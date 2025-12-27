import SwiftUI

// MARK: - Font Size Enum
// Matches Tailwind CSS font sizes

enum FontSize: CGFloat {
    case xxs = 10    // text-xxs (custom)
    case xs = 12     // text-xs
    case sm = 14     // text-sm
    case base = 16   // text-base
    case lg = 18     // text-lg
    case xl = 20     // text-xl
    case xxl = 24    // text-2xl
    case xxxl = 30   // text-3xl
    case xxxxl = 36  // text-4xl
    case xxxxxl = 48 // text-5xl
}

// MARK: - Typography

struct Typography {
    // MARK: - System Font Styles (matching Tailwind sizes)

    static func body(_ size: FontSize = .base, weight: Font.Weight = .regular) -> Font {
        .system(size: size.rawValue, weight: weight, design: .default)
    }

    static func rounded(_ size: FontSize = .base, weight: Font.Weight = .regular) -> Font {
        .system(size: size.rawValue, weight: weight, design: .rounded)
    }

    static func mono(_ size: FontSize = .base, weight: Font.Weight = .regular) -> Font {
        .system(size: size.rawValue, weight: weight, design: .monospaced)
    }

    // MARK: - Predefined Styles (iOS HIG)

    static let largeTitle = Font.system(size: 34, weight: .bold)
    static let title = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 22, weight: .bold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let bodyText = Font.system(size: 17, weight: .regular)
    static let callout = Font.system(size: 16, weight: .regular)
    static let subheadline = Font.system(size: 15, weight: .regular)
    static let footnote = Font.system(size: 13, weight: .regular)
    static let caption = Font.system(size: 12, weight: .regular)
    static let caption2 = Font.system(size: 11, weight: .regular)

    // MARK: - Line Heights (approximating Tailwind leading)

    static func lineHeight(for size: FontSize) -> CGFloat {
        switch size {
        case .xxs: return 14
        case .xs: return 16
        case .sm: return 20
        case .base: return 24
        case .lg: return 28
        case .xl: return 28
        case .xxl: return 32
        case .xxxl: return 36
        case .xxxxl: return 40
        case .xxxxxl: return 48
        }
    }
}

// MARK: - View Extensions for Typography

extension View {
    func textStyle(_ font: Font, color: Color = .adaptiveTextPrimary) -> some View {
        self
            .font(font)
            .foregroundColor(color)
    }

    func headlineStyle() -> some View {
        textStyle(Typography.headline)
    }

    func bodyStyle() -> some View {
        textStyle(Typography.bodyText)
    }

    func captionStyle() -> some View {
        textStyle(Typography.caption, color: .adaptiveTextSecondary)
    }
}
