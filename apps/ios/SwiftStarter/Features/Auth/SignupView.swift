import SwiftUI
import AuthenticationServices

struct SignupView: View {
    @EnvironmentObject private var authManager: AuthManager
    @Binding var showLogin: Bool

    @State private var name = ""
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false

    private var isFormValid: Bool {
        !name.isEmpty &&
        !email.isEmpty &&
        password.count >= 8 &&
        password == confirmPassword
    }

    var body: some View {
        ScrollView {
            VStack(spacing: Spacing.xl.rawValue) {
                // Header
                headerSection

                // Form
                formSection

                // Social signup
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
        .trackScreen("Signup")
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            Image(systemName: "person.badge.plus.fill")
                .font(.system(size: 80))
                .foregroundColor(.brandPrimary)
                .padding(.top, Spacing.xl.rawValue)

            Text("Create Account")
                .font(.title)
                .fontWeight(.bold)
                .foregroundColor(.adaptiveTextPrimary)

            Text("Sign up to get started")
                .font(.subheadline)
                .foregroundColor(.adaptiveTextSecondary)
        }
    }

    // MARK: - Form

    private var formSection: some View {
        VStack(spacing: Spacing.lg.rawValue) {
            // Name field
            VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                Text("Name")
                    .font(.caption)
                    .foregroundColor(.adaptiveTextSecondary)

                TextField("Enter your name", text: $name)
                    .textContentType(.name)
                    .padding(Spacing.md.rawValue)
                    .background(Color.gray100)
                    .cornerRadius(CornerRadius.md.rawValue)
            }

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

                SecureField("Create a password", text: $password)
                    .textContentType(.newPassword)
                    .padding(Spacing.md.rawValue)
                    .background(Color.gray100)
                    .cornerRadius(CornerRadius.md.rawValue)

                PasswordStrengthIndicator(password: password)
            }

            // Confirm password field
            VStack(alignment: .leading, spacing: Spacing.xs.rawValue) {
                Text("Confirm Password")
                    .font(.caption)
                    .foregroundColor(.adaptiveTextSecondary)

                SecureField("Confirm your password", text: $confirmPassword)
                    .textContentType(.newPassword)
                    .padding(Spacing.md.rawValue)
                    .background(Color.gray100)
                    .cornerRadius(CornerRadius.md.rawValue)
                    .overlay(
                        RoundedRectangle(cornerRadius: CornerRadius.md.rawValue)
                            .stroke(
                                !confirmPassword.isEmpty && password != confirmPassword
                                    ? Color.danger
                                    : Color.clear,
                                lineWidth: 1
                            )
                    )

                if !confirmPassword.isEmpty && password != confirmPassword {
                    Text("Passwords don't match")
                        .font(.caption2)
                        .foregroundColor(.danger)
                }
            }

            // Sign up button
            Button(action: signUp) {
                Text("Create Account")
            }
            .buttonStyle(PrimaryButtonStyle())
            .disabled(!isFormValid)
        }
    }

    // MARK: - Social Signup

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
            SignInWithAppleButton(.signUp) { request in
                request.requestedScopes = [.email, .fullName]
            } onCompletion: { result in
                handleAppleSignUp(result)
            }
            .signInWithAppleButtonStyle(.black)
            .frame(height: 50)
            .cornerRadius(CornerRadius.lg.rawValue)
        }
    }

    // MARK: - Footer

    private var footerSection: some View {
        VStack(spacing: Spacing.md.rawValue) {
            HStack {
                Text("Already have an account?")
                    .foregroundColor(.adaptiveTextSecondary)
                Button("Sign In") {
                    showLogin = true
                }
                .foregroundColor(.brandPrimary)
                .fontWeight(.semibold)
            }
            .font(.subheadline)

            Text("By creating an account, you agree to our Terms of Service and Privacy Policy")
                .font(.caption2)
                .foregroundColor(.textMuted)
                .multilineTextAlignment(.center)
        }
        .padding(.top, Spacing.lg.rawValue)
    }

    // MARK: - Actions

    private func signUp() {
        isLoading = true
        Task {
            do {
                try await authManager.signUp(email: email, password: password, name: name)
            } catch {
                errorMessage = error.localizedDescription
                showError = true
            }
            isLoading = false
        }
    }

    private func handleAppleSignUp(_ result: Result<ASAuthorization, Error>) {
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

// MARK: - Password Strength Indicator

struct PasswordStrengthIndicator: View {
    let password: String

    private var strength: Int {
        var score = 0
        if password.count >= 8 { score += 1 }
        if password.range(of: "[A-Z]", options: .regularExpression) != nil { score += 1 }
        if password.range(of: "[a-z]", options: .regularExpression) != nil { score += 1 }
        if password.range(of: "[0-9]", options: .regularExpression) != nil { score += 1 }
        if password.range(of: "[^A-Za-z0-9]", options: .regularExpression) != nil { score += 1 }
        return score
    }

    private var strengthColor: Color {
        switch strength {
        case 0...1: return .danger
        case 2...3: return .warning
        default: return .success
        }
    }

    private var strengthText: String {
        switch strength {
        case 0...1: return "Weak"
        case 2...3: return "Fair"
        default: return "Strong"
        }
    }

    var body: some View {
        HStack(spacing: Spacing.xs.rawValue) {
            ForEach(0..<5, id: \.self) { index in
                Rectangle()
                    .fill(index < strength ? strengthColor : Color.gray200)
                    .frame(height: 4)
                    .cornerRadius(2)
            }
            Text(strengthText)
                .font(.caption2)
                .foregroundColor(strengthColor)
        }
        .opacity(password.isEmpty ? 0 : 1)
        .animation(.easeInOut, value: strength)
    }
}

#Preview {
    SignupView(showLogin: .constant(false))
        .environmentObject(AuthManager.shared)
}
