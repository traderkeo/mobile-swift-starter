import Foundation

// MARK: - Analytics Event

enum AnalyticsEvent: String {
    // App lifecycle
    case appOpened = "app_opened"
    case appBackgrounded = "app_backgrounded"
    case screenViewed = "screen_viewed"

    // Auth
    case signUp = "sign_up"
    case login = "login"
    case logout = "logout"

    // Payments
    case checkoutStarted = "checkout_started"
    case purchaseCompleted = "purchase_completed"
    case purchaseFailed = "purchase_failed"
    case subscriptionRestored = "subscription_restored"

    // Features
    case featureUsed = "feature_used"
    case onboardingCompleted = "onboarding_completed"
    case settingsChanged = "settings_changed"

    // Engagement
    case shareCompleted = "share_completed"
    case ratingRequested = "rating_requested"
    case ratingCompleted = "rating_completed"

    // Errors
    case errorOccurred = "error_occurred"
}

// MARK: - Analytics Manager

class AnalyticsManager {
    static let shared = AnalyticsManager()

    private var userId: String?
    private var userProperties: [String: Any] = [:]

    private init() {}

    // MARK: - User Identification

    func setUser(id: String, properties: [String: Any]? = nil) {
        userId = id

        if let properties {
            userProperties = properties
        }

        #if DEBUG
        print("👤 Analytics: Set user \(id)")
        #endif

        // Add your analytics provider here:
        // Mixpanel.mainInstance().identify(distinctId: id)
        // Amplitude.instance().setUserId(id)
    }

    func updateUserProperties(_ properties: [String: Any]) {
        userProperties.merge(properties) { _, new in new }

        #if DEBUG
        print("👤 Analytics: Updated user properties \(properties)")
        #endif

        // Add your analytics provider here
    }

    func reset() {
        userId = nil
        userProperties = [:]

        #if DEBUG
        print("👤 Analytics: Reset user")
        #endif

        // Add your analytics provider here:
        // Mixpanel.mainInstance().reset()
        // Amplitude.instance().reset()
    }

    // MARK: - Event Tracking

    func track(_ event: AnalyticsEvent, properties: [String: Any]? = nil) {
        var allProperties = properties ?? [:]
        allProperties["timestamp"] = ISO8601DateFormatter().string(from: Date())

        #if DEBUG
        print("📊 Analytics: \(event.rawValue) \(allProperties)")
        #endif

        // Add your analytics provider here:
        // Mixpanel.mainInstance().track(event: event.rawValue, properties: allProperties)
        // Amplitude.instance().logEvent(event.rawValue, eventProperties: allProperties)
    }

    func trackScreen(_ screenName: String) {
        track(.screenViewed, properties: ["screen_name": screenName])
    }

    func trackError(_ error: Error, context: String? = nil) {
        var properties: [String: Any] = [
            "error_message": error.localizedDescription,
            "error_type": String(describing: type(of: error))
        ]

        if let context {
            properties["context"] = context
        }

        track(.errorOccurred, properties: properties)
    }

    // MARK: - Revenue Tracking

    func trackRevenue(
        productId: String,
        price: Decimal,
        currency: String = "USD",
        quantity: Int = 1
    ) {
        let properties: [String: Any] = [
            "product_id": productId,
            "price": NSDecimalNumber(decimal: price).doubleValue,
            "currency": currency,
            "quantity": quantity
        ]

        track(.purchaseCompleted, properties: properties)

        #if DEBUG
        print("💰 Analytics: Revenue \(price) \(currency) for \(productId)")
        #endif

        // Add your analytics provider here:
        // Mixpanel.mainInstance().people.trackCharge(amount: price)
    }

    // MARK: - Time Tracking

    private var timingEvents: [String: Date] = [:]

    func startTiming(event: String) {
        timingEvents[event] = Date()
    }

    func endTiming(event: String) -> TimeInterval? {
        guard let startTime = timingEvents.removeValue(forKey: event) else {
            return nil
        }

        let duration = Date().timeIntervalSince(startTime)

        track(.featureUsed, properties: [
            "event": event,
            "duration_seconds": duration
        ])

        return duration
    }
}

// MARK: - View Extension for Screen Tracking

import SwiftUI

struct AnalyticsScreenModifier: ViewModifier {
    let screenName: String

    func body(content: Content) -> some View {
        content
            .onAppear {
                AnalyticsManager.shared.trackScreen(screenName)
            }
    }
}

extension View {
    func trackScreen(_ name: String) -> some View {
        modifier(AnalyticsScreenModifier(screenName: name))
    }
}
