import StoreKit
import Foundation

// MARK: - Product Configuration

struct ProductConfig {
    static let monthlyPremium = "com.starter.premium.monthly"
    static let yearlyPremium = "com.starter.premium.yearly"
    static let lifetimePremium = "com.starter.premium.lifetime"

    static let premiumProducts: Set<String> = [
        monthlyPremium,
        yearlyPremium,
        lifetimePremium
    ]

    static let allProducts: Set<String> = premiumProducts
}

// MARK: - Store Error

enum StoreError: LocalizedError {
    case failedToLoadProducts(Error)
    case failedVerification
    case purchasePending
    case purchaseCancelled
    case unknown
    case networkError
    case serverVerificationFailed

    var errorDescription: String? {
        switch self {
        case .failedToLoadProducts(let error):
            return "Failed to load products: \(error.localizedDescription)"
        case .failedVerification:
            return "Transaction verification failed"
        case .purchasePending:
            return "Purchase is pending approval"
        case .purchaseCancelled:
            return "Purchase was cancelled"
        case .unknown:
            return "An unknown error occurred"
        case .networkError:
            return "Network connection error"
        case .serverVerificationFailed:
            return "Server verification failed"
        }
    }
}

// MARK: - Store Manager

@MainActor
class StoreManager: ObservableObject {
    static let shared = StoreManager()

    // MARK: - Published Properties

    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs = Set<String>()
    @Published private(set) var isLoading = false
    @Published private(set) var error: StoreError?
    @Published private(set) var subscriptionStatus: SubscriptionStatus?

    // MARK: - Computed Properties

    var isPremium: Bool {
        !purchasedProductIDs.intersection(ProductConfig.premiumProducts).isEmpty
    }

    var activeSubscription: Product? {
        products.first { purchasedProductIDs.contains($0.id) }
    }

    var sortedProducts: [Product] {
        products.sorted { $0.price < $1.price }
    }

    var monthlyProduct: Product? {
        products.first { $0.id == ProductConfig.monthlyPremium }
    }

    var yearlyProduct: Product? {
        products.first { $0.id == ProductConfig.yearlyPremium }
    }

    var lifetimeProduct: Product? {
        products.first { $0.id == ProductConfig.lifetimePremium }
    }

    // MARK: - Private Properties

    private var updateListenerTask: Task<Void, Error>?

    // MARK: - Initialization

    init() {
        updateListenerTask = listenForTransactions()

        Task {
            await loadProducts()
            await updatePurchasedProducts()
        }
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Load Products

    func loadProducts() async {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let storeProducts = try await Product.products(for: ProductConfig.allProducts)
            products = storeProducts.sorted { $0.price < $1.price }

            #if DEBUG
            print("📦 Loaded \(products.count) products:")
            for product in products {
                print("  - \(product.displayName): \(product.displayPrice)")
            }
            #endif
        } catch {
            self.error = .failedToLoadProducts(error)
            print("❌ Failed to load products: \(error)")
        }
    }

    // MARK: - Purchase

    func purchase(_ product: Product) async throws -> Transaction? {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                let transaction = try checkVerified(verification)

                // Verify with server
                await verifyWithServer(transaction: transaction)

                await transaction.finish()
                await updatePurchasedProducts()

                AnalyticsManager.shared.track(.purchaseCompleted, properties: [
                    "product_id": product.id,
                    "price": product.price.description
                ])

                return transaction

            case .userCancelled:
                throw StoreError.purchaseCancelled

            case .pending:
                throw StoreError.purchasePending

            @unknown default:
                throw StoreError.unknown
            }
        } catch let storeError as StoreError {
            self.error = storeError
            AnalyticsManager.shared.track(.purchaseFailed, properties: [
                "product_id": product.id,
                "error": storeError.localizedDescription ?? "unknown"
            ])
            throw storeError
        } catch {
            let storeError = StoreError.unknown
            self.error = storeError
            throw storeError
        }
    }

    // MARK: - Restore Purchases

    func restorePurchases() async throws {
        isLoading = true
        error = nil
        defer { isLoading = false }

        do {
            try await AppStore.sync()
            await updatePurchasedProducts()

            AnalyticsManager.shared.track(.subscriptionRestored)

            #if DEBUG
            print("✅ Restored purchases. Premium: \(isPremium)")
            #endif
        } catch {
            self.error = .networkError
            throw error
        }
    }

    // MARK: - Update Purchased Products

    func updatePurchasedProducts() async {
        var purchased = Set<String>()

        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)

                // Check if subscription is still valid
                if let expirationDate = transaction.expirationDate {
                    if expirationDate > Date() {
                        purchased.insert(transaction.productID)
                    }
                } else {
                    // Non-consumable or lifetime
                    purchased.insert(transaction.productID)
                }
            } catch {
                #if DEBUG
                print("⚠️ Unverified transaction: \(error)")
                #endif
            }
        }

        purchasedProductIDs = purchased

        // Update subscription status
        await updateSubscriptionStatus()

        // Save to storage for widgets
        StorageManager.shared.setShared(isPremium, forKey: "isPremium")
    }

    // MARK: - Subscription Status

    func updateSubscriptionStatus() async {
        guard let product = activeSubscription else {
            subscriptionStatus = nil
            return
        }

        for await result in Transaction.currentEntitlements {
            guard let transaction = try? checkVerified(result),
                  transaction.productID == product.id else {
                continue
            }

            let renewalInfo = await getRenewalInfo(for: product)

            subscriptionStatus = SubscriptionStatus(
                productId: product.id,
                productName: product.displayName,
                expirationDate: transaction.expirationDate,
                isAutoRenewing: renewalInfo?.willAutoRenew ?? false,
                isInGracePeriod: false,
                isInBillingRetry: renewalInfo?.isInBillingRetry ?? false
            )

            return
        }
    }

    private func getRenewalInfo(for product: Product) async -> Product.SubscriptionInfo.RenewalInfo? {
        guard let subscription = product.subscription else { return nil }

        for await result in subscription.status {
            if case .verified(let renewalInfo) = result.renewalInfo {
                return renewalInfo
            }
        }
        return nil
    }

    // MARK: - Transaction Listener

    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    await self.updatePurchasedProducts()
                    await transaction.finish()

                    #if DEBUG
                    print("📥 Transaction update: \(transaction.productID)")
                    #endif
                } catch {
                    #if DEBUG
                    print("⚠️ Transaction verification failed: \(error)")
                    #endif
                }
            }
        }
    }

    // MARK: - Verification

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            #if DEBUG
            print("⚠️ Unverified result: \(error)")
            #endif
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }

    // MARK: - Server Verification

    private func verifyWithServer(transaction: Transaction) async {
        // Send receipt to our Hono API for server-side verification
        // This helps prevent fraud and keeps subscription status in sync

        guard let appStoreReceiptURL = Bundle.main.appStoreReceiptURL,
              let receiptData = try? Data(contentsOf: appStoreReceiptURL) else {
            #if DEBUG
            print("⚠️ No receipt available for server verification")
            #endif
            return
        }

        let receiptString = receiptData.base64EncodedString()

        do {
            try await APIClient.shared.verifyReceipt(
                receiptData: receiptString,
                transactionId: String(transaction.id),
                productId: transaction.productID
            )
            #if DEBUG
            print("✅ Server verification successful")
            #endif
        } catch {
            #if DEBUG
            print("⚠️ Server verification failed: \(error)")
            #endif
            // Don't throw - local verification is primary
        }
    }
}

// MARK: - Subscription Status Model

struct SubscriptionStatus {
    let productId: String
    let productName: String
    let expirationDate: Date?
    let isAutoRenewing: Bool
    let isInGracePeriod: Bool
    let isInBillingRetry: Bool

    var isExpired: Bool {
        guard let expirationDate else { return false }
        return expirationDate < Date()
    }

    var daysUntilExpiration: Int? {
        guard let expirationDate else { return nil }
        return Calendar.current.dateComponents([.day], from: Date(), to: expirationDate).day
    }

    var statusText: String {
        if isExpired {
            return "Expired"
        } else if isInBillingRetry {
            return "Billing Issue"
        } else if isInGracePeriod {
            return "Grace Period"
        } else if isAutoRenewing {
            return "Active"
        } else {
            return "Expires Soon"
        }
    }

    var statusColor: String {
        if isExpired || isInBillingRetry {
            return "danger"
        } else if isInGracePeriod || !isAutoRenewing {
            return "warning"
        } else {
            return "success"
        }
    }
}
