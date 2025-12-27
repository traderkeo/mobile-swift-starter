import WidgetKit
import SwiftUI
import ActivityKit

// MARK: - Timeline Entry
struct AppEntry: TimelineEntry {
    let date: Date
    let title: String
    let subtitle: String
    let isPremium: Bool
}

// MARK: - Timeline Provider
struct AppProvider: TimelineProvider {
    func placeholder(in context: Context) -> AppEntry {
        AppEntry(date: Date(), title: "Welcome", subtitle: "Your app", isPremium: false)
    }

    func getSnapshot(in context: Context, completion: @escaping (AppEntry) -> Void) {
        let entry = AppEntry(date: Date(), title: "Welcome", subtitle: "Your app", isPremium: false)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<AppEntry>) -> Void) {
        let currentDate = Date()
        let entry = AppEntry(
            date: currentDate,
            title: "Welcome",
            subtitle: "Tap to open app",
            isPremium: false // TODO: Read from shared UserDefaults
        )

        // Refresh widget every hour
        let nextUpdate = Calendar.current.date(byAdding: .hour, value: 1, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Home Screen Widget Views

struct SmallWidgetView: View {
    var entry: AppEntry

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: entry.isPremium ? "star.fill" : "star")
                .font(.system(size: 32))
                .foregroundStyle(Color("brandBlue"))

            Text(entry.title)
                .font(.headline)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(Color("$widgetBackground"), for: .widget)
    }
}

struct MediumWidgetView: View {
    var entry: AppEntry

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: entry.isPremium ? "star.fill" : "star")
                .font(.system(size: 48))
                .foregroundStyle(Color("brandBlue"))

            VStack(alignment: .leading, spacing: 4) {
                Text(entry.title)
                    .font(.title2)
                    .fontWeight(.bold)

                Text(entry.subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                Text(entry.date, style: .time)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }

            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(Color("$widgetBackground"), for: .widget)
    }
}

struct LargeWidgetView: View {
    var entry: AppEntry

    var body: some View {
        VStack(spacing: 16) {
            Image(systemName: entry.isPremium ? "star.fill" : "star")
                .font(.system(size: 64))
                .foregroundStyle(Color("brandBlue"))

            Text(entry.title)
                .font(.largeTitle)
                .fontWeight(.bold)

            Text(entry.subtitle)
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            Spacer()

            HStack {
                Image(systemName: "clock")
                Text("Updated: \(entry.date, style: .time)")
            }
            .font(.caption)
            .foregroundStyle(.tertiary)
        }
        .padding()
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(Color("$widgetBackground"), for: .widget)
    }
}

// MARK: - Lock Screen Widget Views (iOS 16+)

struct AccessoryCircularView: View {
    var entry: AppEntry

    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            Image(systemName: entry.isPremium ? "star.fill" : "star")
                .font(.title2)
        }
    }
}

struct AccessoryRectangularView: View {
    var entry: AppEntry

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: entry.isPremium ? "star.fill" : "star")
                .font(.title3)

            VStack(alignment: .leading) {
                Text(entry.title)
                    .font(.headline)
                    .widgetAccentable()
                Text(entry.subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

struct AccessoryInlineView: View {
    var entry: AppEntry

    var body: some View {
        Label(entry.title, systemImage: entry.isPremium ? "star.fill" : "star")
    }
}

// MARK: - Widget Entry View (routes to correct size)
struct AppWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    var entry: AppEntry

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        // Lock Screen widgets
        case .accessoryCircular:
            AccessoryCircularView(entry: entry)
        case .accessoryRectangular:
            AccessoryRectangularView(entry: entry)
        case .accessoryInline:
            AccessoryInlineView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Main Widget Configuration
struct AppWidget: Widget {
    let kind: String = "AppWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AppProvider()) { entry in
            AppWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("App Widget")
        .description("Quick access to your app from home screen and lock screen.")
        .supportedFamilies([
            // Home screen widgets
            .systemSmall,
            .systemMedium,
            .systemLarge,
            // Lock screen widgets (iOS 16+)
            .accessoryCircular,
            .accessoryRectangular,
            .accessoryInline
        ])
    }
}

// MARK: - Interactive Widget with App Intents (iOS 17+)

@available(iOS 17.0, *)
struct QuickActionIntent: AppIntent {
    static var title: LocalizedStringResource = "Quick Action"
    static var description = IntentDescription("Perform a quick action")

    @Parameter(title: "Action Type")
    var actionType: String

    init() {
        self.actionType = "default"
    }

    init(actionType: String) {
        self.actionType = actionType
    }

    func perform() async throws -> some IntentResult {
        // Handle the action - this opens the app with the action parameter
        // You can communicate with your app via shared UserDefaults or App Groups
        return .result()
    }
}

@available(iOS 17.0, *)
struct InteractiveWidgetView: View {
    var entry: AppEntry

    var body: some View {
        VStack(spacing: 12) {
            Text(entry.title)
                .font(.headline)

            HStack(spacing: 8) {
                Button(intent: QuickActionIntent(actionType: "action1")) {
                    Label("Action 1", systemImage: "1.circle.fill")
                        .font(.caption)
                }
                .buttonStyle(.bordered)

                Button(intent: QuickActionIntent(actionType: "action2")) {
                    Label("Action 2", systemImage: "2.circle.fill")
                        .font(.caption)
                }
                .buttonStyle(.bordered)
            }
        }
        .containerBackground(Color("$widgetBackground"), for: .widget)
    }
}

@available(iOS 17.0, *)
struct InteractiveWidget: Widget {
    let kind: String = "InteractiveWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: AppProvider()) { entry in
            InteractiveWidgetView(entry: entry)
        }
        .configurationDisplayName("Interactive Widget")
        .description("Widget with interactive buttons.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Live Activity (iOS 16.1+)

struct LiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var status: String
        var progress: Double
        var emoji: String
    }

    var activityName: String
    var startTime: Date
}

struct LiveActivityView: View {
    let context: ActivityViewContext<LiveActivityAttributes>

    var body: some View {
        HStack(spacing: 16) {
            Text(context.state.emoji)
                .font(.largeTitle)

            VStack(alignment: .leading, spacing: 4) {
                Text(context.attributes.activityName)
                    .font(.headline)
                    .fontWeight(.bold)

                Text(context.state.status)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                ProgressView(value: context.state.progress)
                    .tint(Color("brandBlue"))
            }

            Spacer()
        }
        .padding()
    }
}

struct LiveActivityLockScreenView: View {
    let context: ActivityViewContext<LiveActivityAttributes>

    var body: some View {
        HStack {
            Text(context.state.emoji)
            Text(context.state.status)
                .font(.headline)
        }
    }
}

@available(iOS 16.1, *)
struct AppLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: LiveActivityAttributes.self) { context in
            // Lock screen / banner UI
            LiveActivityView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                // Expanded UI
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.emoji)
                        .font(.title)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(Int(context.state.progress * 100))%")
                        .font(.headline)
                        .foregroundStyle(Color("brandBlue"))
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.activityName)
                        .font(.headline)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(value: context.state.progress)
                        .tint(Color("brandBlue"))
                }
            } compactLeading: {
                Text(context.state.emoji)
            } compactTrailing: {
                Text("\(Int(context.state.progress * 100))%")
                    .foregroundStyle(Color("brandBlue"))
            } minimal: {
                Text(context.state.emoji)
            }
        }
    }
}

// MARK: - Widget Bundle (entry point)
@main
struct AppWidgetBundle: WidgetBundle {
    var body: some Widget {
        AppWidget()

        if #available(iOS 17.0, *) {
            InteractiveWidget()
        }

        if #available(iOS 16.1, *) {
            AppLiveActivity()
        }
    }
}

// MARK: - Preview Providers

#Preview(as: .systemSmall) {
    AppWidget()
} timeline: {
    AppEntry(date: Date(), title: "Welcome", subtitle: "Your app", isPremium: false)
    AppEntry(date: Date(), title: "Premium", subtitle: "Your app", isPremium: true)
}

#Preview(as: .systemMedium) {
    AppWidget()
} timeline: {
    AppEntry(date: Date(), title: "Welcome", subtitle: "Tap to open", isPremium: false)
}

#Preview(as: .accessoryCircular) {
    AppWidget()
} timeline: {
    AppEntry(date: Date(), title: "App", subtitle: "", isPremium: true)
}

#Preview(as: .accessoryRectangular) {
    AppWidget()
} timeline: {
    AppEntry(date: Date(), title: "Welcome", subtitle: "Your app", isPremium: false)
}
