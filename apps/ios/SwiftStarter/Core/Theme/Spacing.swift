import SwiftUI

// MARK: - Spacing Enum
// Matches Tailwind CSS spacing scale

enum Spacing: CGFloat {
    case none = 0        // spacing-0
    case xxs = 2         // spacing-0.5
    case xs = 4          // spacing-1
    case sm = 8          // spacing-2
    case md = 12         // spacing-3
    case base = 16       // spacing-4
    case lg = 20         // spacing-5
    case xl = 24         // spacing-6
    case xxl = 32        // spacing-8
    case xxxl = 40       // spacing-10
    case xxxxl = 48      // spacing-12
    case xxxxxl = 64     // spacing-16
    case xxxxxxl = 80    // spacing-20
    case xxxxxxxl = 96   // spacing-24
}

// MARK: - Corner Radius Enum
// Matches Tailwind CSS border-radius scale

enum CornerRadius: CGFloat {
    case none = 0        // rounded-none
    case sm = 6          // rounded-sm
    case base = 8        // rounded
    case md = 10         // rounded-md
    case lg = 12         // rounded-lg
    case xl = 16         // rounded-xl
    case xxl = 20        // rounded-2xl
    case xxxl = 24       // rounded-3xl
    case full = 9999     // rounded-full
}

// MARK: - Shadow Presets
// Matches Tailwind CSS shadow utilities

struct ShadowPreset {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat

    static let sm = ShadowPreset(color: .black.opacity(0.05), radius: 2, x: 0, y: 1)
    static let base = ShadowPreset(color: .black.opacity(0.1), radius: 3, x: 0, y: 1)
    static let md = ShadowPreset(color: .black.opacity(0.1), radius: 6, x: 0, y: 4)
    static let lg = ShadowPreset(color: .black.opacity(0.1), radius: 10, x: 0, y: 8)
    static let xl = ShadowPreset(color: .black.opacity(0.1), radius: 20, x: 0, y: 12)
    static let xxl = ShadowPreset(color: .black.opacity(0.25), radius: 30, x: 0, y: 24)
}

// MARK: - View Extensions for Shadows

extension View {
    func shadow(_ preset: ShadowPreset) -> some View {
        self.shadow(color: preset.color, radius: preset.radius, x: preset.x, y: preset.y)
    }

    func shadowSm() -> some View { shadow(.sm) }
    func shadowBase() -> some View { shadow(.base) }
    func shadowMd() -> some View { shadow(.md) }
    func shadowLg() -> some View { shadow(.lg) }
    func shadowXl() -> some View { shadow(.xl) }
}

// MARK: - View Extensions for Spacing

extension View {
    func padding(_ spacing: Spacing) -> some View {
        self.padding(spacing.rawValue)
    }

    func padding(_ edges: Edge.Set, _ spacing: Spacing) -> some View {
        self.padding(edges, spacing.rawValue)
    }

    func cornerRadius(_ radius: CornerRadius) -> some View {
        self.cornerRadius(radius.rawValue)
    }
}

// MARK: - Safe Area Insets

struct SafeAreaSpacing {
    static var bottom: CGFloat {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows
            .first?.safeAreaInsets.bottom ?? 0
    }

    static var top: CGFloat {
        UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first?.windows
            .first?.safeAreaInsets.top ?? 0
    }
}
