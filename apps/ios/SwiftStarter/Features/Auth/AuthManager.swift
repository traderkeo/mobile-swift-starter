import Foundation
import LocalAuthentication
import AuthenticationServices

// MARK: - Auth Error

enum AuthError: LocalizedError {
    case invalidCredentials
    case weakPassword
    case emailAlreadyExists
    case biometricFailed
    case biometricNotAvailable
    case networkError
    case serverError(String)
    case unknown

    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .weakPassword:
            return "Password must be at least 8 characters with uppercase, lowercase, and numbers"
        case .emailAlreadyExists:
            return "An account with this email already exists"
        case .biometricFailed:
            return "Biometric authentication failed"
        case .biometricNotAvailable:
            return "Biometric authentication is not available"
        case .networkError:
            return "Network connection error. Please try again."
        case .serverError(let message):
            return message
        case .unknown:
            return "An unexpected error occurred"
        }
    }
}

// MARK: - User Model

struct User: Codable, Identifiable {
    let id: String
    let email: String
    var name: String?
    var avatarUrl: String?
    let isPremium: Bool
    let createdAt: Date

    static var placeholder: User {
        User(
            id: "placeholder",
            email: "user@example.com",
            name: "User",
            avatarUrl: nil,
            isPremium: false,
            createdAt: Date()
        )
    }
}

// MARK: - Auth Tokens

struct AuthTokens: Codable {
    let accessToken: String
    let refreshToken: String
    let expiresAt: Date
}

// MARK: - Auth Manager

@MainActor
class AuthManager: ObservableObject {
    static let shared = AuthManager()

    // MARK: - Published Properties

    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var biometricEnabled: Bool = false

    // MARK: - Private Properties

    private let storage = StorageManager.shared
    private let keychain = KeychainManager.shared

    // MARK: - Biometric Properties

    var biometricType: LABiometryType {
        let context = LAContext()
        _ = context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
        return context.biometryType
    }

    var isBiometricAvailable: Bool {
        let context = LAContext()
        return context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: nil)
    }

    var biometricLabel: String {
        switch biometricType {
        case .faceID: return "Face ID"
        case .touchID: return "Touch ID"
        case .opticID: return "Optic ID"
        default: return "Biometrics"
        }
    }

    // MARK: - Initialization

    init() {
        loadSavedUser()
        biometricEnabled = storage.get(Bool.self, forKey: "biometric_enabled") ?? false
    }

    // MARK: - Email/Password Authentication

    func signIn(email: String, password: String) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let response = try await APIClient.shared.login(email: email, password: password)

            // Save tokens
            try keychain.saveTokens(response.tokens)

            // Save user
            currentUser = response.user
            isAuthenticated = true
            saveUser(response.user)

            AnalyticsManager.shared.track(.login, properties: ["method": "email"])
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    func signUp(email: String, password: String, name: String) async throws {
        isLoading = true
        defer { isLoading = false }

        // Validate password strength
        guard isPasswordStrong(password) else {
            throw AuthError.weakPassword
        }

        do {
            let response = try await APIClient.shared.register(email: email, password: password, name: name)

            // Save tokens
            try keychain.saveTokens(response.tokens)

            // Save user
            currentUser = response.user
            isAuthenticated = true
            saveUser(response.user)

            AnalyticsManager.shared.track(.signUp, properties: ["method": "email"])
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    func signOut() {
        // Clear tokens
        keychain.clearTokens()

        // Clear user
        currentUser = nil
        isAuthenticated = false
        storage.remove(forKey: "currentUser")

        AnalyticsManager.shared.track(.logout)
        AnalyticsManager.shared.reset()
    }

    // MARK: - Biometric Authentication

    func authenticateWithBiometrics() async throws -> Bool {
        guard isBiometricAvailable else {
            throw AuthError.biometricNotAvailable
        }

        let context = LAContext()
        let reason = "Unlock your account"

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )

            if success {
                // Load saved credentials and auto-login
                if let savedUser: User = storage.get(User.self, forKey: "currentUser") {
                    currentUser = savedUser
                    isAuthenticated = true
                    return true
                }
            }

            return success
        } catch {
            throw AuthError.biometricFailed
        }
    }

    func setBiometricEnabled(_ enabled: Bool) {
        biometricEnabled = enabled
        storage.set(enabled, forKey: "biometric_enabled")
    }

    // MARK: - Apple Sign In

    func signInWithApple(credential: ASAuthorizationAppleIDCredential) async throws {
        isLoading = true
        defer { isLoading = false }

        guard let identityToken = credential.identityToken,
              let tokenString = String(data: identityToken, encoding: .utf8),
              let authorizationCode = credential.authorizationCode,
              let codeString = String(data: authorizationCode, encoding: .utf8) else {
            throw AuthError.unknown
        }

        let fullName = credential.fullName.map { name in
            [name.givenName, name.familyName].compactMap { $0 }.joined(separator: " ")
        }

        do {
            let response = try await APIClient.shared.loginWithApple(
                identityToken: tokenString,
                authorizationCode: codeString,
                userId: credential.user,
                email: credential.email,
                fullName: fullName
            )

            // Save tokens
            try keychain.saveTokens(response.tokens)

            // Save user
            currentUser = response.user
            isAuthenticated = true
            saveUser(response.user)

            AnalyticsManager.shared.track(.login, properties: ["method": "apple"])
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    // MARK: - Token Management

    func refreshTokensIfNeeded() async throws {
        guard let tokens = keychain.getTokens(),
              tokens.expiresAt < Date().addingTimeInterval(60) else {
            return
        }

        do {
            let newTokens = try await APIClient.shared.refreshTokens(refreshToken: tokens.refreshToken)
            try keychain.saveTokens(newTokens)
        } catch {
            // Token refresh failed, sign out
            signOut()
            throw AuthError.invalidCredentials
        }
    }

    // MARK: - Profile Management

    func updateProfile(name: String?, avatarUrl: String?) async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            let updatedUser = try await APIClient.shared.updateProfile(name: name, avatarUrl: avatarUrl)
            currentUser = updatedUser
            saveUser(updatedUser)
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    func changePassword(currentPassword: String, newPassword: String) async throws {
        isLoading = true
        defer { isLoading = false }

        guard isPasswordStrong(newPassword) else {
            throw AuthError.weakPassword
        }

        do {
            try await APIClient.shared.changePassword(
                currentPassword: currentPassword,
                newPassword: newPassword
            )
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    func deleteAccount() async throws {
        isLoading = true
        defer { isLoading = false }

        do {
            try await APIClient.shared.deleteAccount()
            signOut()
        } catch let error as APIError {
            throw mapAPIError(error)
        } catch {
            throw AuthError.networkError
        }
    }

    // MARK: - Private Helpers

    private func loadSavedUser() {
        guard let user: User = storage.get(User.self, forKey: "currentUser"),
              let tokens = keychain.getTokens(),
              tokens.expiresAt > Date() else {
            return
        }

        currentUser = user
        isAuthenticated = true
    }

    private func saveUser(_ user: User) {
        storage.set(user, forKey: "currentUser")
    }

    private func isPasswordStrong(_ password: String) -> Bool {
        password.count >= 8 &&
        password.range(of: "[A-Z]", options: .regularExpression) != nil &&
        password.range(of: "[a-z]", options: .regularExpression) != nil &&
        password.range(of: "[0-9]", options: .regularExpression) != nil
    }

    private func mapAPIError(_ error: APIError) -> AuthError {
        switch error {
        case .unauthorized:
            return .invalidCredentials
        case .badRequest(let message):
            if message.contains("email") {
                return .emailAlreadyExists
            }
            return .serverError(message)
        case .serverError(let message):
            return .serverError(message)
        case .networkError:
            return .networkError
        default:
            return .unknown
        }
    }
}
