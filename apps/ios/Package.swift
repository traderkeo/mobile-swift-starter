// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SwiftStarter",
    platforms: [.iOS(.v16)],
    products: [
        .library(name: "SwiftStarter", targets: ["SwiftStarter"]),
    ],
    dependencies: [
        // Keychain access for secure storage
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.0"),
        // Image loading and caching
        .package(url: "https://github.com/onevcat/Kingfisher", from: "7.0.0"),
        // Crash reporting
        .package(url: "https://github.com/getsentry/sentry-cocoa", from: "8.0.0"),
    ],
    targets: [
        .target(
            name: "SwiftStarter",
            dependencies: [
                "KeychainAccess",
                "Kingfisher",
                .product(name: "Sentry", package: "sentry-cocoa"),
            ],
            path: "SwiftStarter"
        ),
        .testTarget(
            name: "SwiftStarterTests",
            dependencies: ["SwiftStarter"],
            path: "SwiftStarterTests"
        ),
    ]
)
