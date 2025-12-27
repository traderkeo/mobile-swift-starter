import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var storeManager: StoreManager
    @State private var showPaywall = false
    @State private var showEditProfile = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Spacing.xl.rawValue) {
                    // Profile header
                    profileHeader

                    // Subscription status
                    subscriptionSection

                    // Stats section
                    statsSection

                    // Options
                    optionsSection
                }
                .padding()
            }
            .background(Color.adaptiveBackground)
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showEditProfile = true }) {
                        Image(systemName: "pencil")
                    }
                }
            }
            .sheet(isPresented: $showEditProfile) {
                EditProfileView()
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
        }
        .trackScreen("Profile")
    }

    // MARK: - Profile Header

    private var profileHeader: some View {
        VStack(spacing: Spacing.md.rawValue) {
            // Avatar
            ZStack {
                Circle()
                    .fill(Color.brandPrimary.opacity(0.2))
                    .frame(width: 100, height: 100)

                if let avatarUrl = authManager.currentUser?.avatarUrl,
                   let url = URL(string: avatarUrl) {
                    AsyncImage(url: url) { image in
                        image
                            .resizable()
                            .scaledToFill()
                    } placeholder: {
                        Image(systemName: "person.fill")
                            .font(.system(size: 40))
                            .foregroundColor(.brandPrimary)
                    }
                    .frame(width: 100, height: 100)
                    .clipShape(Circle())
                } else {
                    Image(systemName: "person.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.brandPrimary)
                }

                // Premium badge
                if storeManager.isPremium {
                    Circle()
                        .fill(Color.brandAccent)
                        .frame(width: 28, height: 28)
                        .overlay(
                            Image(systemName: "crown.fill")
                                .font(.caption)
                                .foregroundColor(.white)
                        )
                        .offset(x: 35, y: 35)
                }
            }

            // Name and email
            VStack(spacing: Spacing.xs.rawValue) {
                Text(authManager.currentUser?.name ?? "User")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.adaptiveTextPrimary)

                Text(authManager.currentUser?.email ?? "")
                    .font(.subheadline)
                    .foregroundColor(.adaptiveTextSecondary)
            }

            // Member since
            if let createdAt = authManager.currentUser?.createdAt {
                Text("Member since \(createdAt, format: .dateTime.month().year())")
                    .font(.caption)
                    .foregroundColor(.textMuted)
            }
        }
        .padding(.top)
    }

    // MARK: - Subscription Section

    private var subscriptionSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            if storeManager.isPremium {
                // Premium subscription card
                HStack {
                    VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                        HStack {
                            Image(systemName: "crown.fill")
                                .foregroundColor(.brandAccent)
                            Text("Premium")
                                .font(.headline)
                                .foregroundColor(.adaptiveTextPrimary)
                        }

                        if let status = storeManager.subscriptionStatus {
                            Text(status.statusText)
                                .font(.caption)
                                .foregroundColor(.success)

                            if let expiresAt = status.expirationDate {
                                Text("Renews \(expiresAt, format: .dateTime.month().day())")
                                    .font(.caption2)
                                    .foregroundColor(.textMuted)
                            }
                        }
                    }

                    Spacer()

                    NavigationLink(destination: SubscriptionDetailsView()) {
                        Text("Manage")
                            .font(.subheadline)
                            .foregroundColor(.brandPrimary)
                    }
                }
                .padding(Spacing.lg.rawValue)
                .background(Color.brandAccent.opacity(0.1))
                .cornerRadius(CornerRadius.lg.rawValue)
            } else {
                // Upgrade prompt
                Button(action: { showPaywall = true }) {
                    HStack {
                        VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                            Text("Upgrade to Premium")
                                .font(.headline)
                                .foregroundColor(.adaptiveTextPrimary)

                            Text("Unlock all features and remove limits")
                                .font(.caption)
                                .foregroundColor(.adaptiveTextSecondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .foregroundColor(.brandPrimary)
                    }
                    .padding(Spacing.lg.rawValue)
                    .background(Color.adaptiveSurface)
                    .cornerRadius(CornerRadius.lg.rawValue)
                    .shadow(.sm)
                }
                .buttonStyle(.plain)
            }
        }
    }

    // MARK: - Stats Section

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: Spacing.md.rawValue) {
            Text("Your Stats")
                .font(.headline)
                .foregroundColor(.adaptiveTextPrimary)

            HStack(spacing: Spacing.md.rawValue) {
                StatCard(title: "7", subtitle: "Day Streak", icon: "flame.fill", color: .warning)
                StatCard(title: "42", subtitle: "Actions", icon: "star.fill", color: .brandPrimary)
                StatCard(title: "15", subtitle: "Saved", icon: "bookmark.fill", color: .success)
            }
        }
    }

    // MARK: - Options Section

    private var optionsSection: some View {
        VStack(spacing: Spacing.sm.rawValue) {
            ProfileOptionRow(icon: "bell.fill", title: "Notifications", color: .danger) {
                // Navigate to notifications settings
            }

            ProfileOptionRow(icon: "lock.fill", title: "Privacy", color: .brandPrimary) {
                // Navigate to privacy settings
            }

            ProfileOptionRow(icon: "questionmark.circle.fill", title: "Help & Support", color: .info) {
                // Navigate to help
            }

            ProfileOptionRow(icon: "star.fill", title: "Rate App", color: .warning) {
                // Request app rating
            }
        }
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: Spacing.sm.rawValue) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)

            Text(title)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.adaptiveTextPrimary)

            Text(subtitle)
                .font(.caption2)
                .foregroundColor(.adaptiveTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(Spacing.md.rawValue)
        .background(Color.adaptiveSurface)
        .cornerRadius(CornerRadius.lg.rawValue)
        .shadow(.sm)
    }
}

// MARK: - Profile Option Row

struct ProfileOptionRow: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: Spacing.md.rawValue) {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .frame(width: 28)

                Text(title)
                    .font(.body)
                    .foregroundColor(.adaptiveTextPrimary)

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.textMuted)
            }
            .padding(Spacing.md.rawValue)
            .background(Color.adaptiveSurface)
            .cornerRadius(CornerRadius.md.rawValue)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Edit Profile View (Placeholder)

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authManager: AuthManager

    @State private var name: String = ""
    @State private var isLoading = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Personal Information") {
                    TextField("Name", text: $name)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            isLoading = true
                            try? await authManager.updateProfile(name: name, avatarUrl: nil)
                            isLoading = false
                            dismiss()
                        }
                    }
                    .disabled(name.isEmpty || isLoading)
                }
            }
            .onAppear {
                name = authManager.currentUser?.name ?? ""
            }
        }
    }
}

// MARK: - Subscription Details View (Placeholder)

struct SubscriptionDetailsView: View {
    @EnvironmentObject private var storeManager: StoreManager

    var body: some View {
        List {
            if let status = storeManager.subscriptionStatus {
                Section("Current Plan") {
                    LabeledContent("Plan", value: status.productName)
                    LabeledContent("Status", value: status.statusText)
                    if let expiresAt = status.expirationDate {
                        LabeledContent("Renews", value: expiresAt, format: .dateTime)
                    }
                    LabeledContent("Auto-Renew", value: status.isAutoRenewing ? "On" : "Off")
                }

                Section {
                    Button("Manage Subscription") {
                        if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                            UIApplication.shared.open(url)
                        }
                    }
                }
            }
        }
        .navigationTitle("Subscription")
    }
}

#Preview {
    ProfileView()
        .environmentObject(AuthManager.shared)
        .environmentObject(StoreManager.shared)
}
