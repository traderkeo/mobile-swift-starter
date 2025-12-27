# Mobile Starter Kit Refactoring Plan

## Expo + RevenueCat → Native Swift + StoreKit 2

### Executive Summary

Transform the current Expo React Native app with RevenueCat into a **native Swift/SwiftUI iOS app** with Apple's StoreKit 2 for in-app purchases. The NativeWind design system will be preserved by translating Tailwind tokens into a SwiftUI theme system.

---

## Table of Contents

1. [Approach Options](#1-approach-options)
2. [Recommended Architecture](#2-recommended-architecture)
3. [Phase 1: Project Setup](#phase-1-project-setup)
4. [Phase 2: Design System Migration](#phase-2-design-system-migration)
5. [Phase 3: StoreKit 2 Implementation](#phase-3-storekit-2-implementation)
6. [Phase 4: Core Features Migration](#phase-4-core-features-migration)
7. [Phase 5: UI Components Migration](#phase-5-ui-components-migration)
8. [Phase 6: iOS Features Migration](#phase-6-ios-features-migration)
9. [Phase 7: Testing & Deployment](#phase-7-testing-deployment)
10. [File-by-File Migration Map](#file-by-file-migration-map)
11. [Dependencies Comparison](#dependencies-comparison)
12. [Risk Assessment](#risk-assessment)

---

## 1. Approach Options

### Option A: Full Native Swift/SwiftUI (RECOMMENDED)

**Pros:**

- Full access to all iOS APIs (widgets, Live Activities, App Intents)
- Best performance and battery life
- StoreKit 2 integrates natively
- Xcode debugging and testing
- App Clips, SharePlay, and future iOS features

**Cons:**

- iOS only (no Android)
- Larger rewrite effort
- Need to recreate UI components in SwiftUI

### Option B: Expo Dev Client + Native Modules

**Pros:**

- Keep React Native codebase
- Add StoreKit 2 via native module
- Test widgets via Xcode
- Cross-platform potential

**Cons:**

- Still have React Native overhead
- Bridging complexity
- Two languages to maintain

### Option C: React Native Bare Workflow

**Pros:**

- Keep most existing code
- More native access than Expo Go

**Cons:**

- Still can't use StoreKit 2 directly without a bridge
- RevenueCat replacement would need custom module

---

## 2. Recommended Architecture

**Approach: Full Native Swift/SwiftUI (Option A)**

```
ios-swift-starter/
├── App/
│   ├── SwiftStarterApp.swift          # @main entry point
│   ├── AppDelegate.swift              # App lifecycle (optional)
│   └── ContentView.swift              # Root view with navigation
├── Features/
│   ├── Auth/
│   │   ├── AuthManager.swift          # Auth state management
│   │   ├── LoginView.swift
│   │   ├── SignupView.swift
│   │   └── BiometricAuth.swift
│   ├── Payments/
│   │   ├── StoreManager.swift         # StoreKit 2 manager
│   │   ├── PaywallView.swift
│   │   ├── SubscriptionStatusView.swift
│   │   ├── ProductCard.swift
│   │   └── PremiumGate.swift
│   ├── Home/
│   │   └── HomeView.swift
│   ├── Profile/
│   │   └── ProfileView.swift
│   ├── Settings/
│   │   └── SettingsView.swift
│   └── Onboarding/
│       └── OnboardingView.swift
├── Core/
│   ├── Theme/
│   │   ├── Theme.swift                # Design tokens from Tailwind
│   │   ├── Colors.swift               # Color palette
│   │   ├── Typography.swift           # Font styles
│   │   ├── Spacing.swift              # Spacing scale
│   │   └── ViewModifiers.swift        # Reusable modifiers
│   ├── Storage/
│   │   ├── StorageManager.swift       # UserDefaults wrapper
│   │   ├── KeychainManager.swift      # Secure storage
│   │   └── CacheManager.swift
│   ├── Network/
│   │   ├── APIClient.swift
│   │   └── NetworkMonitor.swift
│   ├── Analytics/
│   │   └── AnalyticsManager.swift
│   └── Utils/
│       ├── Logger.swift
│       ├── Validation.swift
│       └── Extensions.swift
├── Components/
│   ├── Buttons/
│   │   ├── PrimaryButton.swift
│   │   ├── SecondaryButton.swift
│   │   └── IconButton.swift
│   ├── Cards/
│   │   ├── Card.swift
│   │   └── ProductCard.swift
│   ├── Forms/
│   │   ├── TextField.swift
│   │   ├── SecureField.swift
│   │   └── FormField.swift
│   ├── Feedback/
│   │   ├── Toast.swift
│   │   ├── LoadingView.swift
│   │   └── EmptyState.swift
│   └── Navigation/
│       └── CustomTabBar.swift
├── Widgets/
│   ├── WidgetBundle.swift
│   ├── HomeWidget.swift
│   ├── LockScreenWidget.swift
│   ├── InteractiveWidget.swift
│   └── LiveActivity.swift
├── Resources/
│   ├── Assets.xcassets/
│   ├── Localizable.strings
│   └── Products.storekit            # StoreKit config file
├── Configuration/
│   ├── Config.swift                 # Environment config
│   ├── FeatureFlags.swift
│   └── ProductConfig.swift
└── Tests/
    ├── UnitTests/
    └── UITests/
```

---

## Phase 1: Project Setup

### 1.1 Create New Xcode Project

**Tasks:**

- [ ] Create new Xcode project (iOS App, SwiftUI, Swift)
- [ ] Set deployment target: iOS 16.0 (for widgets, Live Activities)
- [ ] Configure bundle identifier: `com.yourcompany.swiftStarter`
- [ ] Add Widget Extension target
- [ ] Add App Intent Extension (for interactive widgets)
- [ ] Configure signing & capabilities

**Capabilities to add:**

- In-App Purchase
- Push Notifications
- Background Modes
- App Groups (for widget data sharing)
- Sign in with Apple

### 1.2 Project Configuration

**Files to create:**

```swift
// Configuration/Config.swift
enum Environment {
    case development
    case staging
    case production

    static var current: Environment {
        #if DEBUG
        return .development
        #else
        return .production
        #endif
    }
}

struct Config {
    static let appStoreId = "YOUR_APP_STORE_ID"
    static let appGroupId = "group.com.yourcompany.swiftStarter"
    static let universalLinkDomain = "yourapp.com"

    // StoreKit Product IDs (replace RevenueCat offering)
    struct Products {
        static let monthlyPremium = "com.yourcompany.premium.monthly"
        static let yearlyPremium = "com.yourcompany.premium.yearly"
        static let lifetimePremium = "com.yourcompany.premium.lifetime"
    }
}
```

### 1.3 Dependencies (Swift Package Manager)

**Add via Xcode → File → Add Package Dependencies:**

| Package        | Purpose               | URL                                                  |
| -------------- | --------------------- | ---------------------------------------------------- |
| SwiftLint      | Code linting          | `https://github.com/realm/SwiftLint`                 |
| Sentry         | Crash reporting       | `https://github.com/getsentry/sentry-cocoa`          |
| Kingfisher     | Image loading/caching | `https://github.com/onevcat/Kingfisher`              |
| KeychainAccess | Secure storage        | `https://github.com/kishikawakatsumi/KeychainAccess` |

**Built-in frameworks (no packages needed):**

- StoreKit 2 (native)
- WidgetKit (native)
- ActivityKit (native)
- LocalAuthentication (for biometrics)

---

## Phase 2: Design System Migration

### 2.1 Translate Tailwind Config to SwiftUI Theme

**Source:** `tailwind.config.js` → **Target:** `Core/Theme/`

### Colors (Colors.swift)

```swift
import SwiftUI

extension Color {
    // Brand Colors (from tailwind.config.js)
    static let brandPrimary = Color(hex: "0a7ea4")      // primary
    static let brandSecondary = Color(hex: "6b7280")    // secondary
    static let brandAccent = Color(hex: "8b5cf6")       // accent

    // Semantic Colors
    static let success = Color(hex: "22c55e")
    static let warning = Color(hex: "f59e0b")
    static let danger = Color(hex: "ef4444")
    static let info = Color(hex: "3b82f6")

    // Background Colors
    static let backgroundLight = Color(hex: "f9fafb")
    static let backgroundDark = Color(hex: "111827")

    // Surface Colors
    static let surfaceLight = Color.white
    static let surfaceDark = Color(hex: "1f2937")

    // Text Colors
    static let textPrimary = Color(hex: "111827")
    static let textSecondary = Color(hex: "6b7280")
    static let textMuted = Color(hex: "9ca3af")

    // Dark mode variants
    static let textPrimaryDark = Color(hex: "f9fafb")
    static let textSecondaryDark = Color(hex: "d1d5db")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
```

### Typography (Typography.swift)

```swift
import SwiftUI

enum FontSize: CGFloat {
    case xxs = 10
    case xs = 12
    case sm = 14
    case base = 16
    case lg = 18
    case xl = 20
    case xxl = 24
    case xxxl = 30
    case xxxxl = 36
    case xxxxxl = 48
}

struct Typography {
    // System font styles (matching Tailwind sizes)
    static func body(_ size: FontSize = .base, weight: Font.Weight = .regular) -> Font {
        .system(size: size.rawValue, weight: weight)
    }

    static let largeTitle = Font.system(size: 34, weight: .bold)
    static let title = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 22, weight: .bold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 17, weight: .regular)
    static let callout = Font.system(size: 16, weight: .regular)
    static let subheadline = Font.system(size: 15, weight: .regular)
    static let footnote = Font.system(size: 13, weight: .regular)
    static let caption = Font.system(size: 12, weight: .regular)
    static let caption2 = Font.system(size: 11, weight: .regular)
}
```

### Spacing (Spacing.swift)

```swift
import SwiftUI

enum Spacing: CGFloat {
    case none = 0
    case xxs = 2
    case xs = 4
    case sm = 8
    case md = 12
    case base = 16
    case lg = 20
    case xl = 24
    case xxl = 32
    case xxxl = 40
    case xxxxl = 48
    case xxxxxl = 64
}

enum CornerRadius: CGFloat {
    case sm = 6
    case base = 8
    case md = 10
    case lg = 12
    case xl = 16
    case xxl = 20
    case xxxl = 24
    case full = 9999
}
```

### View Modifiers (ViewModifiers.swift)

```swift
import SwiftUI

// Card style modifier (matches NativeWind card)
struct CardModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    func body(content: Content) -> some View {
        content
            .background(colorScheme == .dark ? Color.surfaceDark : Color.surfaceLight)
            .cornerRadius(CornerRadius.lg.rawValue)
            .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

// Primary button style
struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg.rawValue)
            .padding(.vertical, Spacing.md.rawValue)
            .background(isEnabled ? Color.brandPrimary : Color.gray)
            .cornerRadius(CornerRadius.lg.rawValue)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2), value: configuration.isPressed)
    }
}

// Press scale animation (matches PressableScale)
struct PressableModifier: ViewModifier {
    @State private var isPressed = false
    var scale: CGFloat = 0.96
    var action: () -> Void

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scale : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: isPressed)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in isPressed = true }
                    .onEnded { _ in
                        isPressed = false
                        action()
                    }
            )
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }

    func pressable(scale: CGFloat = 0.96, action: @escaping () -> Void) -> some View {
        modifier(PressableModifier(scale: scale, action: action))
    }
}
```

---

## Phase 3: StoreKit 2 Implementation

### 3.1 StoreKit Configuration File

**Create `Products.storekit` in Xcode:**

1. File → New → File → StoreKit Configuration File
2. Add products matching your App Store Connect setup:

```
Monthly Premium
- ID: com.yourcompany.premium.monthly
- Type: Auto-Renewable Subscription
- Price: $4.99/month
- Group: Premium

Yearly Premium
- ID: com.yourcompany.premium.yearly
- Type: Auto-Renewable Subscription
- Price: $39.99/year
- Group: Premium

Lifetime Premium
- ID: com.yourcompany.premium.lifetime
- Type: Non-Consumable
- Price: $99.99
```

### 3.2 StoreManager (Core Payment Logic)

**Replaces:** `hooks/use-revenuecat.ts` + `services/payments.ts`

```swift
// Features/Payments/StoreManager.swift
import StoreKit

@MainActor
class StoreManager: ObservableObject {
    static let shared = StoreManager()

    // Published properties (like useRevenueCat hook)
    @Published private(set) var products: [Product] = []
    @Published private(set) var purchasedProductIDs = Set<String>()
    @Published private(set) var isLoading = false
    @Published private(set) var error: StoreError?

    // Entitlement check (replaces isPremium from RevenueCat)
    var isPremium: Bool {
        !purchasedProductIDs.intersection(Config.Products.premiumProducts).isEmpty
    }

    private var updateListenerTask: Task<Void, Error>?

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

    // MARK: - Load Products (replaces RevenueCat offerings)

    func loadProducts() async {
        isLoading = true
        defer { isLoading = false }

        do {
            let productIDs: Set<String> = [
                Config.Products.monthlyPremium,
                Config.Products.yearlyPremium,
                Config.Products.lifetimePremium
            ]
            products = try await Product.products(for: productIDs)
                .sorted { $0.price < $1.price }
        } catch {
            self.error = .failedToLoadProducts(error)
        }
    }

    // MARK: - Purchase (replaces purchasePackage)

    func purchase(_ product: Product) async throws -> Transaction? {
        isLoading = true
        defer { isLoading = false }

        let result = try await product.purchase()

        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            await transaction.finish()
            await updatePurchasedProducts()
            return transaction

        case .userCancelled:
            return nil

        case .pending:
            throw StoreError.purchasePending

        @unknown default:
            throw StoreError.unknown
        }
    }

    // MARK: - Restore Purchases (replaces restorePurchases)

    func restorePurchases() async throws {
        isLoading = true
        defer { isLoading = false }

        try await AppStore.sync()
        await updatePurchasedProducts()
    }

    // MARK: - Transaction Listener

    private func listenForTransactions() -> Task<Void, Error> {
        Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    await self.updatePurchasedProducts()
                    await transaction.finish()
                } catch {
                    // Handle verification error
                }
            }
        }
    }

    // MARK: - Update Purchased Products

    func updatePurchasedProducts() async {
        var purchased = Set<String>()

        for await result in Transaction.currentEntitlements {
            do {
                let transaction = try checkVerified(result)
                purchased.insert(transaction.productID)
            } catch {
                // Skip invalid transactions
            }
        }

        purchasedProductIDs = purchased
    }

    // MARK: - Verification

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified:
            throw StoreError.failedVerification
        case .verified(let safe):
            return safe
        }
    }
}

// MARK: - Error Types

enum StoreError: LocalizedError {
    case failedToLoadProducts(Error)
    case failedVerification
    case purchasePending
    case unknown

    var errorDescription: String? {
        switch self {
        case .failedToLoadProducts(let error):
            return "Failed to load products: \(error.localizedDescription)"
        case .failedVerification:
            return "Transaction verification failed"
        case .purchasePending:
            return "Purchase is pending approval"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}
```

### 3.3 PaywallView (Replaces Paywall.tsx)

```swift
// Features/Payments/PaywallView.swift
import SwiftUI
import StoreKit

struct PaywallView: View {
    @StateObject private var store = StoreManager.shared
    @Environment(\.dismiss) private var dismiss
    @State private var selectedProduct: Product?
    @State private var isPurchasing = false
    @State private var showError = false
    @State private var errorMessage = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl.rawValue) {
                    // Header
                    headerSection

                    // Features list
                    featuresSection

                    // Products
                    productsSection

                    // Legal
                    legalSection
                }
                .padding()
            }
            .navigationTitle("Go Premium")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
    }

    private var headerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            Image(systemName: "crown.fill")
                .font(.system(size: 60))
                .foregroundColor(.brandAccent)

            Text("Unlock All Features")
                .font(.title2)
                .fontWeight(.bold)

            Text("Get unlimited access to all premium features")
                .font(.subheadline)
                .foregroundColor(.textSecondary)
                .multilineTextAlignment(.center)
        }
    }

    private var featuresSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            FeatureRow(icon: "checkmark.circle.fill", text: "Unlimited usage")
            FeatureRow(icon: "bolt.fill", text: "Priority support")
            FeatureRow(icon: "icloud.fill", text: "Cloud sync")
            FeatureRow(icon: "nosign", text: "No ads")
        }
        .cardStyle()
        .padding(.horizontal)
    }

    private var productsSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            if store.isLoading {
                ProgressView()
            } else {
                ForEach(store.products, id: \.id) { product in
                    ProductCardView(
                        product: product,
                        isSelected: selectedProduct?.id == product.id,
                        onSelect: { selectedProduct = product }
                    )
                }
            }

            // Purchase button
            Button(action: purchase) {
                HStack {
                    if isPurchasing {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isPurchasing ? "Processing..." : "Continue")
                }
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(selectedProduct == nil || isPurchasing)

            // Restore purchases
            Button("Restore Purchases") {
                Task { try? await store.restorePurchases() }
            }
            .font(.footnote)
            .foregroundColor(.brandPrimary)
        }
    }

    private var legalSection: some View {
        VStack(spacing: Spacing.xs.rawValue) {
            Text("Subscription automatically renews unless canceled 24 hours before the end of the current period.")
                .font(.caption2)
                .foregroundColor(.textMuted)
                .multilineTextAlignment(.center)

            HStack {
                Link("Terms", destination: URL(string: "https://yourapp.com/terms")!)
                Text("•")
                Link("Privacy", destination: URL(string: "https://yourapp.com/privacy")!)
            }
            .font(.caption2)
            .foregroundColor(.brandPrimary)
        }
        .padding(.top)
    }

    private func purchase() {
        guard let product = selectedProduct else { return }

        isPurchasing = true
        Task {
            do {
                _ = try await store.purchase(product)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isPurchasing = false
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: Spacing.md.rawValue) {
            Image(systemName: icon)
                .foregroundColor(.success)
            Text(text)
                .font(.callout)
            Spacer()
        }
    }
}

struct ProductCardView: View {
    let product: Product
    let isSelected: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            HStack {
                VStack(alignment: .leading) {
                    Text(product.displayName)
                        .font(.headline)
                    Text(product.description)
                        .font(.caption)
                        .foregroundColor(.textSecondary)
                }

                Spacer()

                VStack(alignment: .trailing) {
                    Text(product.displayPrice)
                        .font(.headline)
                    if let subscription = product.subscription {
                        Text(subscription.subscriptionPeriod.debugDescription)
                            .font(.caption2)
                            .foregroundColor(.textMuted)
                    }
                }

                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isSelected ? .brandPrimary : .textMuted)
            }
            .padding()
            .background(isSelected ? Color.brandPrimary.opacity(0.1) : Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg.rawValue)
                    .stroke(isSelected ? Color.brandPrimary : Color.gray.opacity(0.3), lineWidth: isSelected ? 2 : 1)
            )
            .cornerRadius(CornerRadius.lg.rawValue)
        }
        .buttonStyle(.plain)
    }
}
```

### 3.4 PremiumGate (Replaces PremiumGate.tsx)

```swift
// Features/Payments/PremiumGate.swift
import SwiftUI

struct PremiumGate<Content: View, Fallback: View>: View {
    @StateObject private var store = StoreManager.shared

    let content: () -> Content
    let fallback: () -> Fallback

    init(
        @ViewBuilder content: @escaping () -> Content,
        @ViewBuilder fallback: @escaping () -> Fallback
    ) {
        self.content = content
        self.fallback = fallback
    }

    var body: some View {
        if store.isPremium {
            content()
        } else {
            fallback()
        }
    }
}

// Convenience initializer with default paywall
extension PremiumGate where Fallback == PaywallPromptView {
    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
        self.fallback = { PaywallPromptView() }
    }
}

struct PaywallPromptView: View {
    @State private var showPaywall = false

    var body: some View {
        VStack(spacing: Spacing.lg.rawValue) {
            Image(systemName: "lock.fill")
                .font(.largeTitle)
                .foregroundColor(.brandAccent)

            Text("Premium Feature")
                .font(.headline)

            Text("Upgrade to access this feature")
                .font(.subheadline)
                .foregroundColor(.textSecondary)

            Button("Upgrade Now") {
                showPaywall = true
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }
}
```

---

## Phase 4: Core Features Migration

### 4.1 Authentication

**Replaces:** `context/AuthContext.tsx`, `lib/auth.ts`, `hooks/use-biometric.ts`

```swift
// Features/Auth/AuthManager.swift
import LocalAuthentication
import KeychainAccess

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false

    private let keychain = Keychain(service: "com.yourcompany.swiftStarter")

    struct User: Codable {
        let id: String
        let email: String
        let createdAt: Date
    }

    init() {
        loadSavedUser()
    }

    // MARK: - Email/Password Auth

    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // Local auth (same as React Native version)
        guard let savedHash = try? keychain.get("password_hash"),
              hashPassword(password) == savedHash else {
            throw AuthError.invalidCredentials
        }

        let user = User(id: UUID().uuidString, email: email, createdAt: Date())
        currentUser = user
        isAuthenticated = true
        saveUser(user)
    }

    func signUp(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // Validate password strength
        guard isPasswordStrong(password) else {
            throw AuthError.weakPassword
        }

        // Store credentials locally
        try keychain.set(hashPassword(password), key: "password_hash")
        try keychain.set(email, key: "email")

        let user = User(id: UUID().uuidString, email: email, createdAt: Date())
        currentUser = user
        isAuthenticated = true
        saveUser(user)
    }

    func signOut() {
        currentUser = nil
        isAuthenticated = false
        UserDefaults.standard.removeObject(forKey: "currentUser")
    }

    // MARK: - Biometric Auth

    var biometricType: LABiometryType {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType
    }

    var isBiometricAvailable: Bool {
        let context = LAContext()
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    }

    func authenticateWithBiometrics() async throws -> Bool {
        let context = LAContext()
        let reason = "Unlock your account"

        return try await context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: reason
        )
    }

    // MARK: - Apple Sign In

    func signInWithApple(idToken: String, user: String?) async throws {
        // Handle Apple Sign In credential
        let userId = user ?? UUID().uuidString
        let appleUser = User(id: userId, email: "", createdAt: Date())
        currentUser = appleUser
        isAuthenticated = true
        saveUser(appleUser)
    }

    // MARK: - Private Helpers

    private func loadSavedUser() {
        guard let data = UserDefaults.standard.data(forKey: "currentUser"),
              let user = try? JSONDecoder().decode(User.self, from: data) else {
            return
        }
        currentUser = user
        isAuthenticated = true
    }

    private func saveUser(_ user: User) {
        if let data = try? JSONEncoder().encode(user) {
            UserDefaults.standard.set(data, forKey: "currentUser")
        }
    }

    private func hashPassword(_ password: String) -> String {
        // Use proper hashing in production
        return password.data(using: .utf8)!.base64EncodedString()
    }

    private func isPasswordStrong(_ password: String) -> Bool {
        password.count >= 8 &&
        password.rangeOfCharacter(from: .uppercaseLetters) != nil &&
        password.rangeOfCharacter(from: .lowercaseLetters) != nil &&
        password.rangeOfCharacter(from: .decimalDigits) != nil
    }
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case weakPassword
    case biometricFailed

    var errorDescription: String? {
        switch self {
        case .invalidCredentials: return "Invalid email or password"
        case .weakPassword: return "Password must be at least 8 characters with uppercase, lowercase, and numbers"
        case .biometricFailed: return "Biometric authentication failed"
        }
    }
}
```

### 4.2 Storage

**Replaces:** `lib/storage.ts`

```swift
// Core/Storage/StorageManager.swift
import Foundation

class StorageManager {
    static let shared = StorageManager()

    private let defaults = UserDefaults.standard
    private let appGroup = UserDefaults(suiteName: Config.appGroupId)

    // MARK: - Basic Storage

    func set<T: Encodable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) {
            defaults.set(data, forKey: key)
        }
    }

    func get<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    func remove(forKey key: String) {
        defaults.removeObject(forKey: key)
    }

    // MARK: - App Group Storage (for widgets)

    func setShared<T: Encodable>(_ value: T, forKey key: String) {
        if let data = try? JSONEncoder().encode(value) {
            appGroup?.set(data, forKey: key)
        }
    }

    func getShared<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = appGroup?.data(forKey: key) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }
}

// Storage Keys (matching React Native version)
enum StorageKey {
    static let subscriptionStatus = "subscription:status"
    static let onboardingComplete = "onboarding:complete"
    static let themePreference = "user:theme"
    static let lastSyncDate = "sync:last"
}
```

### 4.3 Analytics

**Replaces:** `lib/analytics.ts`

```swift
// Core/Analytics/AnalyticsManager.swift
import Foundation

class AnalyticsManager {
    static let shared = AnalyticsManager()

    enum Event: String {
        case appOpened = "app_opened"
        case screenViewed = "screen_viewed"
        case checkoutStarted = "checkout_started"
        case purchaseCompleted = "purchase_completed"
        case purchaseFailed = "purchase_failed"
        case subscriptionRestored = "subscription_restored"
        case featureUsed = "feature_used"
        case signUp = "sign_up"
        case login = "login"
        case logout = "logout"
    }

    func track(_ event: Event, properties: [String: Any]? = nil) {
        #if DEBUG
        print("📊 Analytics: \(event.rawValue)", properties ?? [:])
        #endif

        // Add your analytics provider here (Mixpanel, Amplitude, etc.)
    }

    func setUser(id: String, properties: [String: Any]? = nil) {
        #if DEBUG
        print("👤 Set User: \(id)", properties ?? [:])
        #endif
    }

    func reset() {
        // Clear user on logout
    }
}
```

### 4.4 Network Layer

**Replaces:** `lib/api.ts`, `lib/network.ts`

```swift
// Core/Network/APIClient.swift
import Foundation
import Network

actor APIClient {
    static let shared = APIClient()

    private let session = URLSession.shared
    private let baseURL: URL
    private var cache: [String: (data: Data, expiry: Date)] = [:]

    init() {
        self.baseURL = URL(string: Config.apiURL ?? "")!
    }

    func get<T: Decodable>(_ path: String, cacheTTL: TimeInterval? = nil) async throws -> T {
        let url = baseURL.appendingPathComponent(path)

        // Check cache
        if let ttl = cacheTTL,
           let cached = cache[path],
           cached.expiry > Date() {
            return try JSONDecoder().decode(T.self, from: cached.data)
        }

        let (data, _) = try await session.data(from: url)

        // Cache response
        if let ttl = cacheTTL {
            cache[path] = (data, Date().addingTimeInterval(ttl))
        }

        return try JSONDecoder().decode(T.self, from: data)
    }

    func post<T: Decodable, B: Encodable>(_ path: String, body: B) async throws -> T {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(body)

        let (data, _) = try await session.data(for: request)
        return try JSONDecoder().decode(T.self, from: data)
    }
}

// Network Monitor
@MainActor
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published var isConnected = true
    @Published var connectionType: NWInterface.InterfaceType?

    private let monitor = NWPathMonitor()

    init() {
        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied
                self?.connectionType = path.availableInterfaces.first?.type
            }
        }
        monitor.start(queue: DispatchQueue.global())
    }
}
```

---

## Phase 5: UI Components Migration

### 5.1 Component Mapping Table

| NativeWind Component | SwiftUI Component                  | Priority |
| -------------------- | ---------------------------------- | -------- |
| `Button`             | `PrimaryButton`, `SecondaryButton` | High     |
| `Card`               | `CardView`                         | High     |
| `Text`               | Native `Text` with modifiers       | High     |
| `Input`              | `CustomTextField`                  | High     |
| `Modal`              | `.sheet()` modifier                | High     |
| `BottomSheet`        | `.sheet(detents:)`                 | High     |
| `Toast`              | Custom overlay                     | Medium   |
| `Loading`            | `ProgressView`                     | High     |
| `EmptyState`         | `EmptyStateView`                   | Medium   |
| `Badge`              | `BadgeView`                        | Medium   |
| `Avatar`             | `AvatarView`                       | Medium   |
| `Tabs`               | `TabView`                          | High     |
| `Accordion`          | `DisclosureGroup`                  | Low      |
| `Skeleton`           | Custom shimmer view                | Medium   |
| `FadeIn`, `SlideIn`  | `.transition()` + `.animation()`   | Medium   |
| `PressableScale`     | `.pressable()` modifier            | High     |
| Custom Tab Bar       | `CustomTabBar`                     | High     |

### 5.2 Sample UI Components

```swift
// Components/Buttons/PrimaryButton.swift
import SwiftUI

struct PrimaryButton: View {
    let title: String
    let isLoading: Bool
    let action: () -> Void

    init(_ title: String, isLoading: Bool = false, action: @escaping () -> Void) {
        self.title = title
        self.isLoading = isLoading
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.sm.rawValue) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                }
                Text(title)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PrimaryButtonStyle())
        .disabled(isLoading)
    }
}

// Components/Cards/Card.swift
struct Card<Content: View>: View {
    let content: () -> Content

    init(@ViewBuilder content: @escaping () -> Content) {
        self.content = content
    }

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            content()
        }
        .padding(Spacing.lg.rawValue)
        .cardStyle()
    }
}

// Components/Forms/CustomTextField.swift
struct CustomTextField: View {
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var error: String?

    var body: some View {
        VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .padding(Spacing.md.rawValue)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(CornerRadius.md.rawValue)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.md.rawValue)
                    .stroke(error != nil ? Color.danger : Color.clear, lineWidth: 1)
            )

            if let error = error {
                Text(error)
                    .font(.caption)
                    .foregroundColor(.danger)
            }
        }
    }
}

// Components/Feedback/Toast.swift
struct ToastModifier: ViewModifier {
    @Binding var isPresented: Bool
    let message: String
    let type: ToastType

    enum ToastType {
        case success, error, warning, info

        var color: Color {
            switch self {
            case .success: return .success
            case .error: return .danger
            case .warning: return .warning
            case .info: return .info
            }
        }

        var icon: String {
            switch self {
            case .success: return "checkmark.circle.fill"
            case .error: return "xmark.circle.fill"
            case .warning: return "exclamationmark.triangle.fill"
            case .info: return "info.circle.fill"
            }
        }
    }

    func body(content: Content) -> some View {
        ZStack {
            content

            if isPresented {
                VStack {
                    Spacer()

                    HStack(spacing: Spacing.sm.rawValue) {
                        Image(systemName: type.icon)
                        Text(message)
                    }
                    .padding()
                    .background(type.color)
                    .foregroundColor(.white)
                    .cornerRadius(CornerRadius.lg.rawValue)
                    .padding()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
                }
                .animation(.spring(), value: isPresented)
                .onAppear {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                        isPresented = false
                    }
                }
            }
        }
    }
}

extension View {
    func toast(isPresented: Binding<Bool>, message: String, type: ToastModifier.ToastType = .info) -> some View {
        modifier(ToastModifier(isPresented: isPresented, message: message, type: type))
    }
}
```

---

## Phase 6: iOS Features Migration

### 6.1 Widgets (Enhanced from existing)

**The current `targets/widget/index.swift` can be largely reused** but should be updated to:

1. Read premium status from App Group UserDefaults
2. Use the new theme system
3. Add proper deep linking

```swift
// Widgets/WidgetBundle.swift
import WidgetKit
import SwiftUI

@main
struct StarterWidgets: WidgetBundle {
    var body: some Widget {
        HomeWidget()
        LockScreenWidget()
        if #available(iOS 17.0, *) {
            InteractiveWidget()
        }
    }
}

// Widgets/HomeWidget.swift
struct HomeWidget: Widget {
    let kind = "HomeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HomeWidgetView(entry: entry)
        }
        .configurationDisplayName("Quick Stats")
        .description("View your stats at a glance")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), isPremium: false, stats: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        let entry = WidgetEntry(date: Date(), isPremium: loadPremiumStatus(), stats: loadStats())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let entry = WidgetEntry(date: Date(), isPremium: loadPremiumStatus(), stats: loadStats())
        let timeline = Timeline(entries: [entry], policy: .after(Date().addingTimeInterval(3600)))
        completion(timeline)
    }

    private func loadPremiumStatus() -> Bool {
        let defaults = UserDefaults(suiteName: Config.appGroupId)
        return defaults?.bool(forKey: "isPremium") ?? false
    }

    private func loadStats() -> WidgetStats {
        let defaults = UserDefaults(suiteName: Config.appGroupId)
        guard let data = defaults?.data(forKey: "widgetStats"),
              let stats = try? JSONDecoder().decode(WidgetStats.self, from: data) else {
            return .placeholder
        }
        return stats
    }
}
```

### 6.2 Live Activities

```swift
// Widgets/LiveActivity.swift
import ActivityKit
import WidgetKit
import SwiftUI

struct ProgressActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var progress: Double
        var status: String
    }

    var title: String
}

@available(iOS 16.1, *)
struct ProgressLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: ProgressActivityAttributes.self) { context in
            // Lock screen view
            HStack {
                VStack(alignment: .leading) {
                    Text(context.attributes.title)
                        .font(.headline)
                    Text(context.state.status)
                        .font(.caption)
                }

                Spacer()

                CircularProgressView(progress: context.state.progress)
            }
            .padding()
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.attributes.title)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(Int(context.state.progress * 100))%")
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: context.state.progress)
                }
            } compactLeading: {
                Image(systemName: "arrow.down.circle.fill")
            } compactTrailing: {
                Text("\(Int(context.state.progress * 100))%")
            } minimal: {
                Image(systemName: "arrow.down.circle.fill")
            }
        }
    }
}
```

### 6.3 App Intents (Siri Shortcuts)

**Replaces:** `lib/siri-shortcuts.ts`

```swift
// Features/Intents/AppIntents.swift
import AppIntents

struct OpenPremiumIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Premium"
    static var description = IntentDescription("Open the premium features screen")

    @MainActor
    func perform() async throws -> some IntentResult {
        // Handle deep link to premium screen
        NotificationCenter.default.post(name: .openPremium, object: nil)
        return .result()
    }
}

struct QuickActionIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Action"

    @Parameter(title: "Action Type")
    var actionType: String

    @MainActor
    func perform() async throws -> some IntentResult {
        // Handle quick action
        return .result()
    }
}

// App Shortcuts
struct AppShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: OpenPremiumIntent(),
            phrases: ["Open premium in \(.applicationName)"],
            shortTitle: "Premium",
            systemImageName: "crown.fill"
        )
    }
}
```

### 6.4 Background Tasks

**Replaces:** `lib/background-tasks.ts`

```swift
// Core/BackgroundTasks/BackgroundTaskManager.swift
import BackgroundTasks

class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()

    static let syncTaskId = "com.yourcompany.swiftStarter.sync"
    static let refreshTaskId = "com.yourcompany.swiftStarter.refresh"

    func registerTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.syncTaskId,
            using: nil
        ) { task in
            self.handleSyncTask(task as! BGProcessingTask)
        }

        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.refreshTaskId,
            using: nil
        ) { task in
            self.handleRefreshTask(task as! BGAppRefreshTask)
        }
    }

    func scheduleSync() {
        let request = BGProcessingTaskRequest(identifier: Self.syncTaskId)
        request.requiresNetworkConnectivity = true
        request.requiresExternalPower = false

        try? BGTaskScheduler.shared.submit(request)
    }

    func scheduleRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: Self.refreshTaskId)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

        try? BGTaskScheduler.shared.submit(request)
    }

    private func handleSyncTask(_ task: BGProcessingTask) {
        task.expirationHandler = { task.setTaskCompleted(success: false) }

        Task {
            // Perform sync
            await performSync()
            task.setTaskCompleted(success: true)
            scheduleSync()
        }
    }

    private func handleRefreshTask(_ task: BGAppRefreshTask) {
        task.expirationHandler = { task.setTaskCompleted(success: false) }

        Task {
            // Refresh data
            await refreshData()
            task.setTaskCompleted(success: true)
            scheduleRefresh()
        }
    }

    private func performSync() async {
        // Sync implementation
    }

    private func refreshData() async {
        // Refresh implementation
    }
}
```

---

## Phase 7: Testing & Deployment

### 7.1 Unit Tests

```swift
// Tests/UnitTests/StoreManagerTests.swift
import XCTest
import StoreKitTest
@testable import SwiftStarter

final class StoreManagerTests: XCTestCase {
    var store: StoreManager!
    var session: SKTestSession!

    override func setUp() async throws {
        session = try SKTestSession(configurationFileNamed: "Products")
        session.disableDialogs = true
        session.clearTransactions()
        store = StoreManager.shared
    }

    func testLoadProducts() async throws {
        await store.loadProducts()
        XCTAssertFalse(store.products.isEmpty)
    }

    func testPurchaseFlow() async throws {
        await store.loadProducts()
        guard let product = store.products.first else {
            XCTFail("No products available")
            return
        }

        let transaction = try await store.purchase(product)
        XCTAssertNotNil(transaction)
        XCTAssertTrue(store.isPremium)
    }

    func testRestorePurchases() async throws {
        // Simulate a previous purchase
        try await session.buyProduct(identifier: Config.Products.monthlyPremium)

        try await store.restorePurchases()
        XCTAssertTrue(store.isPremium)
    }
}
```

### 7.2 UI Tests

```swift
// Tests/UITests/PaywallUITests.swift
import XCTest

final class PaywallUITests: XCTestCase {
    let app = XCUIApplication()

    override func setUp() {
        continueAfterFailure = false
        app.launch()
    }

    func testPaywallDisplaysProducts() {
        // Navigate to paywall
        app.buttons["Upgrade"].tap()

        // Verify products are displayed
        XCTAssertTrue(app.staticTexts["Monthly Premium"].exists)
        XCTAssertTrue(app.staticTexts["Yearly Premium"].exists)
    }

    func testSelectProductAndPurchase() {
        app.buttons["Upgrade"].tap()

        // Select a product
        app.buttons["Monthly Premium"].tap()

        // Verify selection
        XCTAssertTrue(app.buttons["Continue"].isEnabled)
    }
}
```

### 7.3 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ios.yml
name: iOS Build & Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: macos-14

    steps:
      - uses: actions/checkout@v4

      - name: Select Xcode
        run: sudo xcode-select -s /Applications/Xcode_15.2.app

      - name: Install dependencies
        run: |
          brew install swiftlint

      - name: Lint
        run: swiftlint lint --strict

      - name: Build
        run: |
          xcodebuild build \
            -scheme SwiftStarter \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -configuration Debug

      - name: Test
        run: |
          xcodebuild test \
            -scheme SwiftStarter \
            -destination 'platform=iOS Simulator,name=iPhone 15' \
            -configuration Debug

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: macos-14

    steps:
      - uses: actions/checkout@v4

      - name: Install Fastlane
        run: gem install fastlane

      - name: Deploy to TestFlight
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.ASC_API_KEY }}
        run: fastlane beta
```

---

## File-by-File Migration Map

### Critical Path (Must Complete First)

| React Native File         | Swift Equivalent                       | Notes          |
| ------------------------- | -------------------------------------- | -------------- |
| `hooks/use-revenuecat.ts` | `Features/Payments/StoreManager.swift` | StoreKit 2     |
| `services/payments.ts`    | (merged into StoreManager)             | Simplified     |
| `config/product.ts`       | `Configuration/ProductConfig.swift`    | Keep structure |
| `context/AuthContext.tsx` | `Features/Auth/AuthManager.swift`      | Observable     |
| `app/_layout.tsx`         | `App/SwiftStarterApp.swift`            | @main entry    |
| `tailwind.config.js`      | `Core/Theme/*.swift`                   | Design tokens  |

### Payment Components

| React Native                                 | Swift                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `components/payments/Paywall.tsx`            | `Features/Payments/PaywallView.swift`            |
| `components/payments/PremiumGate.tsx`        | `Features/Payments/PremiumGate.swift`            |
| `components/payments/SubscriptionStatus.tsx` | `Features/Payments/SubscriptionStatusView.swift` |
| `components/payments/RestorePurchases.tsx`   | (button in PaywallView)                          |
| `components/payments/ProductCard.tsx`        | `Features/Payments/ProductCardView.swift`        |

### Screens

| React Native                   | Swift                                      |
| ------------------------------ | ------------------------------------------ |
| `app/(tabs)/index.tsx`         | `Features/Home/HomeView.swift`             |
| `app/(tabs)/profile.tsx`       | `Features/Profile/ProfileView.swift`       |
| `app/(tabs)/settings.tsx`      | `Features/Settings/SettingsView.swift`     |
| `app/(auth)/login.tsx`         | `Features/Auth/LoginView.swift`            |
| `app/(auth)/signup.tsx`        | `Features/Auth/SignupView.swift`           |
| `app/account/subscription.tsx` | `Features/Settings/SubscriptionView.swift` |

### UI Components

| React Native                 | Swift                                    |
| ---------------------------- | ---------------------------------------- |
| `components/ui/Button.tsx`   | `Components/Buttons/PrimaryButton.swift` |
| `components/ui/Card.tsx`     | `Components/Cards/Card.swift`            |
| `components/ui/Modal.tsx`    | Native `.sheet()`                        |
| `components/ui/Toast.tsx`    | `Components/Feedback/Toast.swift`        |
| `components/ui/Loading.tsx`  | Native `ProgressView`                    |
| `components/ui/Input.tsx`    | `Components/Forms/CustomTextField.swift` |
| `components/ui/Skeleton.tsx` | `Components/Feedback/SkeletonView.swift` |

### Libraries

| React Native              | Swift                                              |
| ------------------------- | -------------------------------------------------- |
| `lib/storage.ts`          | `Core/Storage/StorageManager.swift`                |
| `lib/auth.ts`             | `Features/Auth/AuthManager.swift`                  |
| `lib/analytics.ts`        | `Core/Analytics/AnalyticsManager.swift`            |
| `lib/api.ts`              | `Core/Network/APIClient.swift`                     |
| `lib/network.ts`          | `Core/Network/NetworkMonitor.swift`                |
| `lib/sentry.ts`           | Sentry SDK (SPM)                                   |
| `lib/siri-shortcuts.ts`   | `Features/Intents/AppIntents.swift`                |
| `lib/background-tasks.ts` | `Core/BackgroundTasks/BackgroundTaskManager.swift` |
| `lib/animations.ts`       | SwiftUI native animations                          |

### iOS-Specific (Enhanced)

| Existing                     | Enhanced Swift                             |
| ---------------------------- | ------------------------------------------ |
| `targets/widget/index.swift` | `Widgets/` directory (modularized)         |
| -                            | `Features/Intents/AppIntents.swift` (Siri) |
| -                            | Live Activities support                    |
| -                            | App Clips (optional)                       |

---

## Dependencies Comparison

### Removed (React Native)

```json
{
  "react-native-purchases": "removed",
  "react-native-purchases-ui": "removed",
  "nativewind": "replaced with SwiftUI theme",
  "react-native-reanimated": "SwiftUI animations",
  "expo-*": "all Expo packages removed",
  "react": "removed",
  "react-native": "removed"
}
```

### Added (Swift)

```swift
// Package.swift / SPM
dependencies: [
    .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.0.0"),
    .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.0"),
    .package(url: "https://github.com/onevcat/Kingfisher", from: "7.0.0"),
    .package(url: "https://github.com/realm/SwiftLint", from: "0.54.0")
]
```

### Native Frameworks (No packages needed)

- StoreKit (in-app purchases)
- WidgetKit (widgets)
- ActivityKit (Live Activities)
- LocalAuthentication (biometrics)
- BackgroundTasks
- AppIntents (Siri)
- CoreSpotlight
- Network (connectivity)

---

## Risk Assessment

### High Risk

1. **StoreKit 2 testing** - Requires App Store Connect setup and sandbox testing
2. **Widget data sharing** - App Groups must be configured correctly
3. **Biometric fallback** - Must handle passcode fallback properly

### Medium Risk

1. **Design parity** - Ensuring SwiftUI matches NativeWind designs exactly
2. **Animation differences** - SwiftUI animations behave differently
3. **Deep linking** - Universal links setup can be tricky

### Low Risk

1. **Local storage** - UserDefaults/Keychain are well-documented
2. **Network layer** - URLSession is stable and well-tested
3. **Analytics** - Simple event tracking

---

## Migration Checklist

### Pre-Migration

- [ ] Export all assets from Expo project
- [ ] Document all API endpoints (if any)
- [ ] Create App Store Connect products
- [ ] Set up StoreKit configuration file
- [ ] Configure App Groups in developer portal

### Phase 1: Setup

- [ ] Create Xcode project
- [ ] Add Swift packages
- [ ] Configure signing
- [ ] Add capabilities
- [ ] Set up widget target

### Phase 2: Theme

- [ ] Migrate colors
- [ ] Migrate typography
- [ ] Migrate spacing
- [ ] Create view modifiers
- [ ] Test dark mode

### Phase 3: StoreKit

- [ ] Implement StoreManager
- [ ] Test sandbox purchases
- [ ] Implement restore
- [ ] Handle edge cases
- [ ] Test subscription renewals

### Phase 4: Core

- [ ] Implement AuthManager
- [ ] Implement StorageManager
- [ ] Implement NetworkMonitor
- [ ] Implement Analytics
- [ ] Test biometrics

### Phase 5: UI

- [ ] Migrate buttons
- [ ] Migrate cards
- [ ] Migrate forms
- [ ] Migrate navigation
- [ ] Migrate paywall

### Phase 6: iOS Features

- [ ] Update widgets
- [ ] Implement Live Activities
- [ ] Implement App Intents
- [ ] Implement background tasks
- [ ] Test deep links

### Phase 7: Testing

- [ ] Unit tests
- [ ] UI tests
- [ ] StoreKit tests
- [ ] Performance testing
- [ ] App Store submission

---

## Questions Before Proceeding

Before implementing this plan, please confirm:

1. **iOS Only?** - This plan is iOS-only. Do you need Android support? (Would require keeping React Native or separate Kotlin app)

2. **Minimum iOS Version?** - Recommended iOS 16.0 for full widget/Live Activity support. Could go iOS 15.0 with reduced features.

3. **Backend API?** - The current app is backend-less. Will the Swift version also be backend-less?

4. **Analytics Provider?** - Currently using local analytics. Do you want to add a provider (Mixpanel, Amplitude, etc.)?

5. **Existing App Store Products?** - Do you have products already set up in App Store Connect, or do we need to create new ones?

6. **Timeline Priority?** - Which features are critical for v1.0 vs can be added later?
