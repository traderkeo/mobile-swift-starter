import Foundation

// MARK: - API Configuration

struct APIConfig {
    #if DEBUG
    static let baseURL = "http://localhost:8787"
    #else
    static let baseURL = "https://api.yourapp.com"
    #endif

    static let timeout: TimeInterval = 30
}

// MARK: - API Error

enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case networkError(Error)
    case unauthorized
    case forbidden
    case notFound
    case badRequest(String)
    case serverError(String)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unauthorized:
            return "Unauthorized. Please sign in again."
        case .forbidden:
            return "You don't have permission to perform this action"
        case .notFound:
            return "Resource not found"
        case .badRequest(let message):
            return message
        case .serverError(let message):
            return "Server error: \(message)"
        case .decodingError(let error):
            return "Failed to parse response: \(error.localizedDescription)"
        }
    }
}

// MARK: - API Response

struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: APIErrorResponse?
    let message: String?
}

struct APIErrorResponse: Decodable {
    let code: String
    let message: String
}

// MARK: - Auth Response

struct AuthResponse: Decodable {
    let user: User
    let tokens: AuthTokens

    enum CodingKeys: String, CodingKey {
        case user
        case accessToken
        case refreshToken
        case expiresAt
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        user = try container.decode(User.self, forKey: .user)

        let accessToken = try container.decode(String.self, forKey: .accessToken)
        let refreshToken = try container.decode(String.self, forKey: .refreshToken)
        let expiresAt = try container.decode(Date.self, forKey: .expiresAt)

        tokens = AuthTokens(accessToken: accessToken, refreshToken: refreshToken, expiresAt: expiresAt)
    }
}

// MARK: - API Client

actor APIClient {
    static let shared = APIClient()

    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = APIConfig.timeout
        config.timeoutIntervalForResource = APIConfig.timeout * 2

        session = URLSession(configuration: config)

        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601

        encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
    }

    // MARK: - Auth Endpoints

    func login(email: String, password: String) async throws -> AuthResponse {
        let body = ["email": email, "password": password]
        return try await post("/auth/login", body: body)
    }

    func register(email: String, password: String, name: String) async throws -> AuthResponse {
        let body = [
            "email": email,
            "password": password,
            "confirmPassword": password,
            "name": name
        ]
        return try await post("/auth/register", body: body)
    }

    func loginWithApple(
        identityToken: String,
        authorizationCode: String,
        userId: String?,
        email: String?,
        fullName: String?
    ) async throws -> AuthResponse {
        var body: [String: Any] = [
            "identityToken": identityToken,
            "authorizationCode": authorizationCode
        ]
        if let userId { body["user"] = userId }
        if let email { body["email"] = email }
        if let fullName {
            body["fullName"] = ["givenName": fullName, "familyName": nil]
        }
        return try await post("/auth/login/apple", body: body)
    }

    func refreshTokens(refreshToken: String) async throws -> AuthTokens {
        let body = ["refreshToken": refreshToken]
        let response: APIResponse<AuthTokens> = try await post("/auth/refresh", body: body)
        guard let tokens = response.data else {
            throw APIError.serverError("Failed to refresh tokens")
        }
        return tokens
    }

    func logout() async throws {
        let _: APIResponse<EmptyResponse> = try await post("/auth/logout", body: EmptyRequest(), authenticated: true)
    }

    // MARK: - User Endpoints

    func getProfile() async throws -> User {
        return try await get("/users/me", authenticated: true)
    }

    func updateProfile(name: String?, avatarUrl: String?) async throws -> User {
        var body: [String: Any?] = [:]
        if let name { body["name"] = name }
        if let avatarUrl { body["avatarUrl"] = avatarUrl }
        return try await patch("/users/me", body: body, authenticated: true)
    }

    func changePassword(currentPassword: String, newPassword: String) async throws {
        let body = [
            "currentPassword": currentPassword,
            "newPassword": newPassword,
            "confirmNewPassword": newPassword
        ]
        let _: APIResponse<EmptyResponse> = try await post("/users/me/change-password", body: body, authenticated: true)
    }

    func deleteAccount() async throws {
        let _: APIResponse<EmptyResponse> = try await delete("/users/me", authenticated: true)
    }

    // MARK: - Subscription Endpoints

    func getSubscription() async throws -> SubscriptionResponse? {
        let response: APIResponse<SubscriptionResponse?> = try await get("/subscriptions", authenticated: true)
        return response.data ?? nil
    }

    func verifyReceipt(receiptData: String, transactionId: String, productId: String) async throws {
        let body = [
            "receiptData": receiptData,
            "transactionId": transactionId,
            "productId": productId
        ]
        let _: APIResponse<SubscriptionResponse> = try await post("/subscriptions/verify-receipt", body: body, authenticated: true)
    }

    func restoreSubscription() async throws -> SubscriptionResponse? {
        let response: APIResponse<SubscriptionResponse?> = try await post("/subscriptions/restore", body: EmptyRequest(), authenticated: true)
        return response.data ?? nil
    }

    // MARK: - Generic Request Methods

    private func get<T: Decodable>(_ path: String, authenticated: Bool = false) async throws -> T {
        return try await request(path, method: "GET", authenticated: authenticated)
    }

    private func post<T: Decodable, B: Encodable>(_ path: String, body: B, authenticated: Bool = false) async throws -> T {
        return try await request(path, method: "POST", body: body, authenticated: authenticated)
    }

    private func patch<T: Decodable, B: Encodable>(_ path: String, body: B, authenticated: Bool = false) async throws -> T {
        return try await request(path, method: "PATCH", body: body, authenticated: authenticated)
    }

    private func delete<T: Decodable>(_ path: String, authenticated: Bool = false) async throws -> T {
        return try await request(path, method: "DELETE", authenticated: authenticated)
    }

    private func request<T: Decodable, B: Encodable>(
        _ path: String,
        method: String,
        body: B? = nil as EmptyRequest?,
        authenticated: Bool = false
    ) async throws -> T {
        guard let url = URL(string: APIConfig.baseURL + path) else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if authenticated {
            if let token = KeychainManager.shared.accessToken {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            }
        }

        if let body = body {
            request.httpBody = try encoder.encode(body)
        }

        do {
            let (data, response) = try await session.data(for: request)

            guard let httpResponse = response as? HTTPURLResponse else {
                throw APIError.invalidResponse
            }

            #if DEBUG
            print("📡 \(method) \(path) -> \(httpResponse.statusCode)")
            if let responseString = String(data: data, encoding: .utf8) {
                print("📦 Response: \(responseString.prefix(500))")
            }
            #endif

            switch httpResponse.statusCode {
            case 200...299:
                do {
                    return try decoder.decode(T.self, from: data)
                } catch {
                    throw APIError.decodingError(error)
                }

            case 400:
                let errorResponse = try? decoder.decode(APIResponse<EmptyResponse>.self, from: data)
                throw APIError.badRequest(errorResponse?.error?.message ?? "Bad request")

            case 401:
                throw APIError.unauthorized

            case 403:
                throw APIError.forbidden

            case 404:
                throw APIError.notFound

            case 500...599:
                let errorResponse = try? decoder.decode(APIResponse<EmptyResponse>.self, from: data)
                throw APIError.serverError(errorResponse?.error?.message ?? "Server error")

            default:
                throw APIError.invalidResponse
            }
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.networkError(error)
        }
    }
}

// MARK: - Helper Types

struct EmptyRequest: Encodable {}
struct EmptyResponse: Decodable {}

struct SubscriptionResponse: Decodable {
    let id: String
    let productId: String
    let platform: String
    let status: String
    let currentPeriodStart: Date
    let currentPeriodEnd: Date?
    let cancelledAt: Date?
    let expiresAt: Date?
    let isActive: Bool
}
