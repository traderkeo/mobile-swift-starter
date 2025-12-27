import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var storeManager: StoreManager
    @State private var showPaywall = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl.rawValue) {
                    // Welcome section
                    welcomeSection

                    // Premium banner (if not premium)
                    if !storeManager.isPremium {
                        premiumBanner
                    }

                    // Quick actions
                    quickActionsSection

                    // Content section
                    contentSection
                }
                .padding()
            }
            .background(Color.adaptiveBackground)
            .navigationTitle("Home")
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
        }
        .trackScreen("Home")
    }

    // MARK: - Welcome Section

    private var welcomeSection: some View {
        HStack {
            VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                Text("Welcome back,")
                    .font(.subheadline)
                    .foregroundColor(.adaptiveTextSecondary)

                Text(authManager.currentUser?.name ?? "User")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.adaptiveTextPrimary)
            }

            Spacer()

            // Premium badge
            if storeManager.isPremium {
                HStack(spacing: Spacing.xs.rawValue) {
                    Image(systemName: "crown.fill")
                        .foregroundColor(.brandAccent)
                    Text("Premium")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.brandAccent)
                }
                .padding(.horizontal, Spacing.md.rawValue)
                .padding(.vertical, Spacing.xs.rawValue)
                .background(Color.brandAccent.opacity(0.15))
                .cornerRadius(CornerRadius.full.rawValue)
            }
        }
    }

    // MARK: - Premium Banner

    private var premiumBanner: some View {
        Button(action: { showPaywall = true }) {
            HStack(spacing: Spacing.md.rawValue) {
                Image(systemName: "sparkles")
                    .font(.title2)
                    .foregroundColor(.white)

                VStack(alignment: .leading, spacing: Spacing.xxs.rawValue) {
                    Text("Unlock Premium")
                        .font(.headline)
                        .foregroundColor(.white)

                    Text("Get unlimited access to all features")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(Spacing.lg.rawValue)
            .background(
                LinearGradient(
                    colors: [.brandPrimary, .brandAccent],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .cornerRadius(CornerRadius.lg.rawValue)
        }
        .buttonStyle(.plain)
    }

    // MARK: - Quick Actions

    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            Text("Quick Actions")
                .font(.headline)
                .foregroundColor(.adaptiveTextPrimary)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: Spacing.md.rawValue) {
                QuickActionCard(
                    icon: "star.fill",
                    title: "Feature 1",
                    subtitle: "Description",
                    color: .brandPrimary,
                    isPremium: false
                ) {
                    // Action
                }

                QuickActionCard(
                    icon: "bolt.fill",
                    title: "Feature 2",
                    subtitle: "Premium",
                    color: .brandAccent,
                    isPremium: true
                ) {
                    if storeManager.isPremium {
                        // Premium action
                    } else {
                        showPaywall = true
                    }
                }

                QuickActionCard(
                    icon: "chart.bar.fill",
                    title: "Feature 3",
                    subtitle: "Stats",
                    color: .success,
                    isPremium: false
                ) {
                    // Action
                }

                QuickActionCard(
                    icon: "gear",
                    title: "Settings",
                    subtitle: "Configure",
                    color: .gray500,
                    isPremium: false
                ) {
                    // Action
                }
            }
        }
    }

    // MARK: - Content Section

    private var contentSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            Text("Recent Activity")
                .font(.headline)
                .foregroundColor(.adaptiveTextPrimary)

            if storeManager.isPremium {
                // Premium content
                ForEach(0..<3) { index in
                    ActivityRow(
                        title: "Activity \(index + 1)",
                        subtitle: "Description of activity",
                        timestamp: Date().addingTimeInterval(Double(-index * 3600))
                    )
                }
            } else {
                // Free tier - limited content
                ActivityRow(
                    title: "Activity 1",
                    subtitle: "Description of activity",
                    timestamp: Date()
                )

                // Upgrade prompt
                Button(action: { showPaywall = true }) {
                    HStack {
                        Image(systemName: "lock.fill")
                        Text("Upgrade to see more")
                    }
                    .font(.subheadline)
                    .foregroundColor(.brandPrimary)
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color.brandPrimary.opacity(0.1))
                    .cornerRadius(CornerRadius.md.rawValue)
                }
            }
        }
    }
}

// MARK: - Quick Action Card

struct QuickActionCard: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    let isPremium: Bool
    let action: () -> Void

    @EnvironmentObject private var storeManager: StoreManager

    var body: some View {
        Button(action: action) {
            VStack(spacing: Spacing.sm.rawValue) {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundColor(color)
                        .frame(width: 48, height: 48)
                        .background(color.opacity(0.15))
                        .cornerRadius(CornerRadius.md.rawValue)

                    if isPremium && !storeManager.isPremium {
                        Image(systemName: "lock.fill")
                            .font(.caption2)
                            .foregroundColor(.white)
                            .padding(4)
                            .background(Color.brandAccent)
                            .clipShape(Circle())
                            .offset(x: 4, y: -4)
                    }
                }

                VStack(spacing: Spacing.xxs.rawValue) {
                    Text(title)
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.adaptiveTextPrimary)

                    Text(subtitle)
                        .font(.caption2)
                        .foregroundColor(.adaptiveTextSecondary)
                }
            }
            .padding(Spacing.md.rawValue)
            .frame(maxWidth: .infinity)
            .background(Color.adaptiveSurface)
            .cornerRadius(CornerRadius.lg.rawValue)
            .shadow(.sm)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Activity Row

struct ActivityRow: View {
    let title: String
    let subtitle: String
    let timestamp: Date

    var body: some View {
        HStack(spacing: Spacing.md.rawValue) {
            Circle()
                .fill(Color.brandPrimary.opacity(0.2))
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: "clock.fill")
                        .foregroundColor(.brandPrimary)
                )

            VStack(alignment: .leading, spacing: Spacing.xxs.rawValue) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.adaptiveTextPrimary)

                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.adaptiveTextSecondary)
            }

            Spacer()

            Text(timestamp, style: .relative)
                .font(.caption2)
                .foregroundColor(.textMuted)
        }
        .padding(Spacing.md.rawValue)
        .background(Color.adaptiveSurface)
        .cornerRadius(CornerRadius.md.rawValue)
    }
}

#Preview {
    HomeView()
        .environmentObject(AuthManager.shared)
        .environmentObject(StoreManager.shared)
}
