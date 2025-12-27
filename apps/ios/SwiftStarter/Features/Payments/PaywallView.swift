import SwiftUI
import StoreKit

struct PaywallView: View {
    @EnvironmentObject private var storeManager: StoreManager
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
            .background(Color.adaptiveBackground)
            .navigationTitle("Go Premium")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
        .loadingOverlay(isPurchasing)
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .onAppear {
            if selectedProduct == nil {
                selectedProduct = storeManager.yearlyProduct ?? storeManager.products.first
            }
            AnalyticsManager.shared.track(.checkoutStarted)
        }
    }

    // MARK: - Header Section

    private var headerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            Image(systemName: "crown.fill")
                .font(.system(size: 60))
                .foregroundColor(.brandAccent)

            Text("Unlock All Features")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.adaptiveTextPrimary)

            Text("Get unlimited access to all premium features")
                .font(.subheadline)
                .foregroundColor(.adaptiveTextSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(.top, Spacing.xl.rawValue)
    }

    // MARK: - Features Section

    private var featuresSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            FeatureRow(icon: "checkmark.circle.fill", text: "Unlimited usage")
            FeatureRow(icon: "bolt.fill", text: "Priority support")
            FeatureRow(icon: "icloud.fill", text: "Cloud sync")
            FeatureRow(icon: "nosign", text: "No ads")
            FeatureRow(icon: "sparkles", text: "Exclusive features")
        }
        .cardStyle()
    }

    // MARK: - Products Section

    private var productsSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            if storeManager.isLoading && storeManager.products.isEmpty {
                ProgressView()
                    .padding()
            } else if storeManager.products.isEmpty {
                Text("Products unavailable")
                    .foregroundColor(.adaptiveTextSecondary)
                    .padding()
            } else {
                ForEach(storeManager.sortedProducts, id: \.id) { product in
                    ProductCardView(
                        product: product,
                        isSelected: selectedProduct?.id == product.id,
                        isBestValue: product.id == ProductConfig.yearlyPremium,
                        onSelect: { selectedProduct = product }
                    )
                }
            }

            // Purchase button
            Button(action: purchase) {
                HStack(spacing: Spacing.sm.rawValue) {
                    if isPurchasing {
                        ProgressView()
                            .tint(.white)
                    }
                    Text(isPurchasing ? "Processing..." : "Continue")
                }
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(selectedProduct == nil || isPurchasing)
            .padding(.top, Spacing.sm.rawValue)

            // Restore purchases
            Button("Restore Purchases") {
                Task {
                    isPurchasing = true
                    do {
                        try await storeManager.restorePurchases()
                        if storeManager.isPremium {
                            dismiss()
                        }
                    } catch {
                        errorMessage = "Failed to restore purchases. Please try again."
                        showError = true
                    }
                    isPurchasing = false
                }
            }
            .font(.footnote)
            .foregroundColor(.brandPrimary)
        }
    }

    // MARK: - Legal Section

    private var legalSection: some View {
        VStack(spacing: Spacing.xs.rawValue) {
            Text("Subscription automatically renews unless canceled 24 hours before the end of the current period.")
                .font(.caption2)
                .foregroundColor(.textMuted)
                .multilineTextAlignment(.center)

            HStack {
                Link("Terms", destination: URL(string: "https://yourapp.com/terms")!)
                Text("•").foregroundColor(.textMuted)
                Link("Privacy", destination: URL(string: "https://yourapp.com/privacy")!)
            }
            .font(.caption2)
            .foregroundColor(.brandPrimary)
        }
        .padding(.top, Spacing.lg.rawValue)
        .padding(.bottom, Spacing.xxl.rawValue)
    }

    // MARK: - Purchase

    private func purchase() {
        guard let product = selectedProduct else { return }

        isPurchasing = true
        Task {
            do {
                _ = try await storeManager.purchase(product)
                dismiss()
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isPurchasing = false
        }
    }
}

// MARK: - Feature Row

struct FeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: Spacing.md.rawValue) {
            Image(systemName: icon)
                .foregroundColor(.success)
                .frame(width: 24)
            Text(text)
                .font(.callout)
                .foregroundColor(.adaptiveTextPrimary)
            Spacer()
        }
    }
}

// MARK: - Product Card View

struct ProductCardView: View {
    let product: Product
    let isSelected: Bool
    let isBestValue: Bool
    let onSelect: () -> Void

    var body: some View {
        Button(action: onSelect) {
            VStack(spacing: 0) {
                if isBestValue {
                    Text("BEST VALUE")
                        .font(.caption2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, Spacing.md.rawValue)
                        .padding(.vertical, Spacing.xs.rawValue)
                        .background(Color.brandAccent)
                        .cornerRadius(CornerRadius.sm.rawValue, corners: [.topLeft, .topRight])
                }

                HStack {
                    VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                        Text(product.displayName)
                            .font(.headline)
                            .foregroundColor(.adaptiveTextPrimary)

                        if let subscription = product.subscription {
                            Text(formatPeriod(subscription.subscriptionPeriod))
                                .font(.caption)
                                .foregroundColor(.adaptiveTextSecondary)
                        }
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: Spacing.xs.rawValue) {
                        Text(product.displayPrice)
                            .font(.headline)
                            .foregroundColor(.adaptiveTextPrimary)

                        if let subscription = product.subscription {
                            Text(perPeriodText(product: product, period: subscription.subscriptionPeriod))
                                .font(.caption2)
                                .foregroundColor(.textMuted)
                        }
                    }

                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(isSelected ? .brandPrimary : .textMuted)
                        .font(.title2)
                        .padding(.leading, Spacing.sm.rawValue)
                }
                .padding(Spacing.lg.rawValue)
            }
            .background(isSelected ? Color.brandPrimary.opacity(0.1) : Color.adaptiveSurface)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg.rawValue)
                    .stroke(isSelected ? Color.brandPrimary : Color.adaptiveBorder, lineWidth: isSelected ? 2 : 1)
            )
            .cornerRadius(CornerRadius.lg.rawValue)
        }
        .buttonStyle(.plain)
    }

    private func formatPeriod(_ period: Product.SubscriptionPeriod) -> String {
        switch period.unit {
        case .day: return period.value == 7 ? "Weekly" : "\(period.value) day(s)"
        case .week: return period.value == 1 ? "Weekly" : "\(period.value) weeks"
        case .month: return period.value == 1 ? "Monthly" : "\(period.value) months"
        case .year: return period.value == 1 ? "Yearly" : "\(period.value) years"
        @unknown default: return ""
        }
    }

    private func perPeriodText(product: Product, period: Product.SubscriptionPeriod) -> String {
        if period.unit == .year && period.value == 1 {
            let monthlyPrice = product.price / 12
            return "\(product.priceFormatStyle.format(monthlyPrice))/month"
        }
        return ""
    }
}

// MARK: - Corner Radius Extension

extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = .infinity
    var corners: UIRectCorner = .allCorners

    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}

// MARK: - Preview

#Preview {
    PaywallView()
        .environmentObject(StoreManager.shared)
}
