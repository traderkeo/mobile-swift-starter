import SwiftUI

@main
struct SwiftStarterApp: App {
    @StateObject private var authManager = AuthManager.shared
    @StateObject private var storeManager = StoreManager.shared
    @StateObject private var networkMonitor = NetworkMonitor.shared

    init() {
        // Configure app on launch
        configureApp()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(authManager)
                .environmentObject(storeManager)
                .environmentObject(networkMonitor)
        }
    }

    private func configureApp() {
        // Register background tasks
        BackgroundTaskManager.shared.registerTasks()

        // Initialize analytics
        AnalyticsManager.shared.track(.appOpened)

        #if DEBUG
        print("🚀 SwiftStarter App launched in DEBUG mode")
        #endif
    }
}
