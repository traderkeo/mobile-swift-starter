import Foundation
import Network

// MARK: - Network Monitor

@MainActor
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()

    @Published private(set) var isConnected = true
    @Published private(set) var isExpensive = false
    @Published private(set) var isConstrained = false
    @Published private(set) var connectionType: NWInterface.InterfaceType?

    private let monitor: NWPathMonitor
    private let queue = DispatchQueue(label: "NetworkMonitor")

    var isWifi: Bool {
        connectionType == .wifi
    }

    var isCellular: Bool {
        connectionType == .cellular
    }

    private init() {
        monitor = NWPathMonitor()

        monitor.pathUpdateHandler = { [weak self] path in
            Task { @MainActor in
                self?.isConnected = path.status == .satisfied
                self?.isExpensive = path.isExpensive
                self?.isConstrained = path.isConstrained
                self?.connectionType = path.availableInterfaces.first?.type

                #if DEBUG
                print("📶 Network status: \(path.status == .satisfied ? "Connected" : "Disconnected")")
                if let type = path.availableInterfaces.first?.type {
                    print("   Type: \(type)")
                }
                #endif
            }
        }

        monitor.start(queue: queue)
    }

    deinit {
        monitor.cancel()
    }
}
