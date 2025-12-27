import BackgroundTasks
import Foundation

// MARK: - Background Task Manager

class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()

    // Task identifiers
    static let syncTaskId = "com.starter.swiftStarter.sync"
    static let refreshTaskId = "com.starter.swiftStarter.refresh"

    private init() {}

    // MARK: - Registration

    func registerTasks() {
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.syncTaskId,
            using: nil
        ) { task in
            self.handleSyncTask(task as! BGProcessingTask)
        }

        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: Self.refreshTaskId,
            using: nil
        ) { task in
            self.handleRefreshTask(task as! BGAppRefreshTask)
        }

        #if DEBUG
        print("📋 Background tasks registered")
        #endif
    }

    // MARK: - Scheduling

    func scheduleSync() {
        let request = BGProcessingTaskRequest(identifier: Self.syncTaskId)
        request.requiresNetworkConnectivity = true
        request.requiresExternalPower = false

        do {
            try BGTaskScheduler.shared.submit(request)
            #if DEBUG
            print("📋 Sync task scheduled")
            #endif
        } catch {
            #if DEBUG
            print("⚠️ Failed to schedule sync task: \(error)")
            #endif
        }
    }

    func scheduleRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: Self.refreshTaskId)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

        do {
            try BGTaskScheduler.shared.submit(request)
            #if DEBUG
            print("📋 Refresh task scheduled")
            #endif
        } catch {
            #if DEBUG
            print("⚠️ Failed to schedule refresh task: \(error)")
            #endif
        }
    }

    // MARK: - Task Handlers

    private func handleSyncTask(_ task: BGProcessingTask) {
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }

        Task {
            do {
                await performSync()
                task.setTaskCompleted(success: true)
                scheduleSync() // Schedule next sync
            } catch {
                task.setTaskCompleted(success: false)
            }
        }
    }

    private func handleRefreshTask(_ task: BGAppRefreshTask) {
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }

        Task {
            do {
                await refreshData()
                task.setTaskCompleted(success: true)
                scheduleRefresh() // Schedule next refresh
            } catch {
                task.setTaskCompleted(success: false)
            }
        }
    }

    // MARK: - Task Implementations

    private func performSync() async {
        #if DEBUG
        print("📋 Performing background sync...")
        #endif

        // Update subscription status
        await StoreManager.shared.updatePurchasedProducts()

        // Update shared data for widgets
        let isPremium = await StoreManager.shared.isPremium
        StorageManager.shared.setShared(isPremium, forKey: "isPremium")

        StorageManager.shared.set(Date(), forKey: StorageKey.lastSyncDate)

        #if DEBUG
        print("📋 Background sync completed")
        #endif
    }

    private func refreshData() async {
        #if DEBUG
        print("📋 Performing background refresh...")
        #endif

        // Refresh user profile if authenticated
        if await AuthManager.shared.isAuthenticated {
            do {
                let profile = try await APIClient.shared.getProfile()
                await MainActor.run {
                    AuthManager.shared.currentUser = profile
                }
            } catch {
                #if DEBUG
                print("⚠️ Failed to refresh profile: \(error)")
                #endif
            }
        }

        #if DEBUG
        print("📋 Background refresh completed")
        #endif
    }

    // MARK: - Debug Helpers

    #if DEBUG
    func simulateSyncTask() {
        Task {
            await performSync()
        }
    }

    func simulateRefreshTask() {
        Task {
            await refreshData()
        }
    }
    #endif
}
