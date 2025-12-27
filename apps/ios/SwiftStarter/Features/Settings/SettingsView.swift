import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var authManager: AuthManager
    @EnvironmentObject private var storeManager: StoreManager
    @State private var showSignOutAlert = false
    @State private var showDeleteAccountAlert = false
    @State private var showPaywall = false

    @AppStorage("notifications_enabled") private var notificationsEnabled = true
    @AppStorage("dark_mode") private var darkMode = false
    @AppStorage("haptics_enabled") private var hapticsEnabled = true

    var body: some View {
        NavigationStack {
            List {
                // Account section
                accountSection

                // Preferences section
                preferencesSection

                // Security section
                securitySection

                // About section
                aboutSection

                // Danger zone
                dangerZoneSection
            }
            .navigationTitle("Settings")
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
            .alert("Sign Out", isPresented: $showSignOutAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Sign Out", role: .destructive) {
                    authManager.signOut()
                }
            } message: {
                Text("Are you sure you want to sign out?")
            }
            .alert("Delete Account", isPresented: $showDeleteAccountAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    Task {
                        try? await authManager.deleteAccount()
                    }
                }
            } message: {
                Text("This action cannot be undone. All your data will be permanently deleted.")
            }
        }
        .trackScreen("Settings")
    }

    // MARK: - Account Section

    private var accountSection: some View {
        Section("Account") {
            HStack {
                VStack(alignment: .leading, spacing: Spacing.xxs.rawValue) {
                    Text(authManager.currentUser?.name ?? "User")
                        .font(.headline)
                    Text(authManager.currentUser?.email ?? "")
                        .font(.caption)
                        .foregroundColor(.adaptiveTextSecondary)
                }

                Spacer()

                if storeManager.isPremium {
                    HStack(spacing: Spacing.xs.rawValue) {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.brandAccent)
                        Text("Premium")
                            .font(.caption)
                            .foregroundColor(.brandAccent)
                    }
                    .padding(.horizontal, Spacing.sm.rawValue)
                    .padding(.vertical, Spacing.xs.rawValue)
                    .background(Color.brandAccent.opacity(0.15))
                    .cornerRadius(CornerRadius.full.rawValue)
                }
            }

            if !storeManager.isPremium {
                Button(action: { showPaywall = true }) {
                    HStack {
                        Image(systemName: "crown.fill")
                            .foregroundColor(.brandAccent)
                        Text("Upgrade to Premium")
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.caption)
                            .foregroundColor(.textMuted)
                    }
                }
            }

            NavigationLink {
                SubscriptionDetailsView()
            } label: {
                Label("Subscription", systemImage: "creditcard")
            }
        }
    }

    // MARK: - Preferences Section

    private var preferencesSection: some View {
        Section("Preferences") {
            Toggle(isOn: $notificationsEnabled) {
                Label("Notifications", systemImage: "bell")
            }

            Toggle(isOn: $darkMode) {
                Label("Dark Mode", systemImage: "moon")
            }
            .onChange(of: darkMode) { _, newValue in
                // Apply dark mode
            }

            Toggle(isOn: $hapticsEnabled) {
                Label("Haptic Feedback", systemImage: "waveform")
            }

            NavigationLink {
                Text("Language Settings")
            } label: {
                Label("Language", systemImage: "globe")
            }
        }
    }

    // MARK: - Security Section

    private var securitySection: some View {
        Section("Security") {
            if authManager.isBiometricAvailable {
                Toggle(isOn: Binding(
                    get: { authManager.biometricEnabled },
                    set: { authManager.setBiometricEnabled($0) }
                )) {
                    Label(authManager.biometricLabel, systemImage: authManager.biometricType == .faceID ? "faceid" : "touchid")
                }
            }

            NavigationLink {
                ChangePasswordView()
            } label: {
                Label("Change Password", systemImage: "lock")
            }
        }
    }

    // MARK: - About Section

    private var aboutSection: some View {
        Section("About") {
            Link(destination: URL(string: "https://yourapp.com/privacy")!) {
                Label("Privacy Policy", systemImage: "hand.raised")
            }

            Link(destination: URL(string: "https://yourapp.com/terms")!) {
                Label("Terms of Service", systemImage: "doc.text")
            }

            NavigationLink {
                Text("Open Source Licenses")
            } label: {
                Label("Licenses", systemImage: "scroll")
            }

            HStack {
                Label("Version", systemImage: "info.circle")
                Spacer()
                Text(Bundle.main.appVersion)
                    .foregroundColor(.adaptiveTextSecondary)
            }
        }
    }

    // MARK: - Danger Zone Section

    private var dangerZoneSection: some View {
        Section {
            Button(action: { showSignOutAlert = true }) {
                HStack {
                    Spacer()
                    Text("Sign Out")
                        .foregroundColor(.danger)
                    Spacer()
                }
            }

            Button(action: { showDeleteAccountAlert = true }) {
                HStack {
                    Spacer()
                    Text("Delete Account")
                        .foregroundColor(.danger)
                    Spacer()
                }
            }
        }
    }
}

// MARK: - Change Password View

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var authManager: AuthManager

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    @State private var showSuccess = false

    private var isValid: Bool {
        !currentPassword.isEmpty &&
        newPassword.count >= 8 &&
        newPassword == confirmPassword
    }

    var body: some View {
        Form {
            Section {
                SecureField("Current Password", text: $currentPassword)
            } header: {
                Text("Current Password")
            }

            Section {
                SecureField("New Password", text: $newPassword)
                SecureField("Confirm New Password", text: $confirmPassword)

                if !confirmPassword.isEmpty && newPassword != confirmPassword {
                    Text("Passwords don't match")
                        .font(.caption)
                        .foregroundColor(.danger)
                }
            } header: {
                Text("New Password")
            } footer: {
                Text("Password must be at least 8 characters with uppercase, lowercase, and numbers.")
            }
        }
        .navigationTitle("Change Password")
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Save") {
                    changePassword()
                }
                .disabled(!isValid || isLoading)
            }
        }
        .loadingOverlay(isLoading)
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .alert("Success", isPresented: $showSuccess) {
            Button("OK") { dismiss() }
        } message: {
            Text("Your password has been changed.")
        }
    }

    private func changePassword() {
        isLoading = true
        Task {
            do {
                try await authManager.changePassword(
                    currentPassword: currentPassword,
                    newPassword: newPassword
                )
                showSuccess = true
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isLoading = false
        }
    }
}

// MARK: - Bundle Extension

extension Bundle {
    var appVersion: String {
        let version = infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }
}

#Preview {
    SettingsView()
        .environmentObject(AuthManager.shared)
        .environmentObject(StoreManager.shared)
}
