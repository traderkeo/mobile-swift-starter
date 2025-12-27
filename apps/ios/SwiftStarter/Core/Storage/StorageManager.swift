import Foundation

// MARK: - Storage Keys

enum StorageKey {
    static let subscriptionStatus = "subscription:status"
    static let onboardingComplete = "onboarding:complete"
    static let themePreference = "user:theme"
    static let lastSyncDate = "sync:last"
    static let biometricEnabled = "biometric_enabled"
    static let currentUser = "currentUser"
}

// MARK: - Storage Manager

class StorageManager {
    static let shared = StorageManager()

    private let defaults = UserDefaults.standard
    private let appGroup = UserDefaults(suiteName: "group.com.starter.swiftStarter")

    private init() {}

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

    func exists(forKey key: String) -> Bool {
        defaults.object(forKey: key) != nil
    }

    // MARK: - Primitive Types

    func setBool(_ value: Bool, forKey key: String) {
        defaults.set(value, forKey: key)
    }

    func getBool(forKey key: String, defaultValue: Bool = false) -> Bool {
        defaults.bool(forKey: key)
    }

    func setString(_ value: String, forKey key: String) {
        defaults.set(value, forKey: key)
    }

    func getString(forKey key: String) -> String? {
        defaults.string(forKey: key)
    }

    func setInt(_ value: Int, forKey key: String) {
        defaults.set(value, forKey: key)
    }

    func getInt(forKey key: String, defaultValue: Int = 0) -> Int {
        defaults.integer(forKey: key)
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

    func removeShared(forKey key: String) {
        appGroup?.removeObject(forKey: key)
    }

    // MARK: - Shared Primitives

    func setSharedBool(_ value: Bool, forKey key: String) {
        appGroup?.set(value, forKey: key)
    }

    func getSharedBool(forKey key: String, defaultValue: Bool = false) -> Bool {
        appGroup?.bool(forKey: key) ?? defaultValue
    }

    // MARK: - Clear All

    func clearAll() {
        let domain = Bundle.main.bundleIdentifier!
        defaults.removePersistentDomain(forName: domain)
    }
}
