import Foundation
import Security

// MARK: - Keychain Manager

class KeychainManager {
    static let shared = KeychainManager()

    private let service = "com.starter.swiftStarter"

    private init() {}

    // MARK: - Token Management

    func saveTokens(_ tokens: AuthTokens) throws {
        let data = try JSONEncoder().encode(tokens)
        try save(data, forKey: "auth_tokens")
    }

    func getTokens() -> AuthTokens? {
        guard let data = get(forKey: "auth_tokens") else { return nil }
        return try? JSONDecoder().decode(AuthTokens.self, from: data)
    }

    func clearTokens() {
        delete(forKey: "auth_tokens")
    }

    var accessToken: String? {
        getTokens()?.accessToken
    }

    // MARK: - Generic Operations

    func save(_ data: Data, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]

        // Delete any existing item
        SecItemDelete(query as CFDictionary)

        // Add the new item
        let status = SecItemAdd(query as CFDictionary, nil)

        guard status == errSecSuccess else {
            throw KeychainError.unableToSave
        }
    }

    func get(forKey key: String) -> Data? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess else { return nil }
        return result as? Data
    }

    func delete(forKey key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]

        SecItemDelete(query as CFDictionary)
    }

    func saveString(_ value: String, forKey key: String) throws {
        guard let data = value.data(using: .utf8) else {
            throw KeychainError.invalidData
        }
        try save(data, forKey: key)
    }

    func getString(forKey key: String) -> String? {
        guard let data = get(forKey: key) else { return nil }
        return String(data: data, encoding: .utf8)
    }

    // MARK: - Clear All

    func clearAll() {
        let secItemClasses = [
            kSecClassGenericPassword,
            kSecClassInternetPassword,
            kSecClassCertificate,
            kSecClassKey,
            kSecClassIdentity
        ]

        for itemClass in secItemClasses {
            let query: [String: Any] = [
                kSecClass as String: itemClass,
                kSecAttrService as String: service
            ]
            SecItemDelete(query as CFDictionary)
        }
    }
}

// MARK: - Keychain Error

enum KeychainError: LocalizedError {
    case unableToSave
    case itemNotFound
    case invalidData

    var errorDescription: String? {
        switch self {
        case .unableToSave:
            return "Unable to save to keychain"
        case .itemNotFound:
            return "Item not found in keychain"
        case .invalidData:
            return "Invalid data format"
        }
    }
}
