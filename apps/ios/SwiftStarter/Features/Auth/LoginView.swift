import SwiftUI
import AuthenticationServices

struct LoginView: View {
    @EnvironmentObject private var authManager: AuthManager
    @Binding var showSignup: Bool

    @State private var email = ""
    @State private var password = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl.rawValue) {
                // Header
                headerSection

                // Form
                formSection

                // Social login
                socialSection

                // Footer
                footerSection
            }
            .padding()
        }
        .background(Color.adaptiveBackground)
        .navigationBarHidden(true)
        .loadingOverlay(isLoading)
        .alert("Error", isPresented: $showError) {
            Button("OK") { }
        } message: {
            Text(errorMessage)
        }
        .trackScreen("Login")
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            Image(systemName: "person.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(.brandPrimary)
                .padding(.top, Spacing.xxl.rawValue)

            Text("Welcome Back")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.adaptiveTextPrimary)

            Text("Sign in to your account")
                .font(.subheadline)
                .foregroundColor(.adaptiveTextSecondary)
        }
    }

    // MARK: - Form

    private var formSection: some View {
        VStack(spacing: Spacing.lg.rawValue) {
            // Email field
            VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                Text("Email")
                    .font(.caption)
                    .foregroundColor(.adaptiveTextSecondary)

                TextField("Enter your email", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .autocapitalization(.none)
                    .padding(Spacing.md.rawValue)
                    .background(Color.gray100)
                    .cornerRadius(CornerRadius.md.rawValue)
            }

            // Password field
            VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                Text("Password")
                    .font(.caption)
                    .foregroundColor(.adaptiveTextSecondary)

                SecureField("Enter your password", text: $password)
                    .textContentType(.password)
                    .padding(Spacing.md.rawValue)
                    .background(Color.gray100)
                    .cornerRadius(CornerRadius.md.rawValue)
            }

            // Forgot password
            HStack {
                Spacer()
                Button("Forgot Password?") {
                    // Handle forgot password
                }
                .font(.footnote)
                .foregroundColor(.brandPrimary)
            }

            // Sign in button
            Button(action: signIn) {
                Text("Sign In")
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(email.isEmpty || password.isEmpty)

            // Biometric login
            if authManager.isBiometricAvailable && authManager.biometricEnabled {
                Button(action: signInWithBiometrics) {
                    HStack {
                        Image(systemName: authManager.biometricType == .faceID ? "faceid" : "touchid")
                        Text("Sign in with \(authManager.biometricLabel)")
                    }
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
    }

    // MARK: - Social Login

    private var socialSection: some View {
        VStack(spacing: Spacing.lg.rawValue) {
            // Divider
            HStack {
                Rectangle()
                    .fill(Color.adaptiveBorder)
                    .frame(height: 1)
                Text("or continue with")
                    .font(.caption)
                    .foregroundColor(.textMuted)
                Rectangle()
                    .fill(Color.adaptiveBorder)
                    .frame(height: 1)
            }

            // Apple Sign In
            SignInWithAppleButton(.signIn) { request in
                request.requestedScopes = [.email, .fullName]
            } onCompletion: { result in
                handleAppleSignIn(result)
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)
            .cornerRadius(CornerRadius.lg.rawValue)
        }
    }

    // MARK: - Footer

    private var footerSection: some View {
        HStack {
            Text("Don't have an account?")
                .foregroundColor(.adaptiveTextSecondary)
            Button("Sign Up") {
                showSignup = false
            }
            .foregroundColor(.brandPrimary)
            .fontWeight(.semibold)
        }
        .font(.subheadline)
        .padding(.top, Spacing.lg.rawValue)
    }

    // MARK: - Actions

    private func signIn() {
        isLoading = true
        Task {
            do {
                try await authManager.signIn(email: email, password: password)
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isLoading = false
        }
    }

    private func signInWithBiometrics() {
        Task {
            do {
                _ = try await authManager.authenticateWithBiometrics()
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
        }
    }

    private func handleAppleSignIn(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            if let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
                isLoading = true
                Task {
                    do {
                        try await authManager.signInWithApple(credential: credential)
                    } catch {
                        errorMessage = error.localizedDescription
                        showError = true
                    }
                    isLoading = false
                }
            }
        case .failure(let error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

#Preview {
    LoginView(showSignup: .constant(true))
        .environmentObject(AuthManager.shared)
}
