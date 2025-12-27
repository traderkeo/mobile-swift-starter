import SwiftUI

// MARK: - Color Extensions
// Translated from Tailwind CSS design tokens

extension Color {
    // MARK: - Brand Colors (from tailwind.config.js)
    static let brandPrimary = Color(hex: "0a7ea4")
    static let brandSecondary = Color(hex: "6b7280")
    static let brandAccent = Color(hex: "8b5cf6")

    // MARK: - Semantic Colors
    static let success = Color(hex: "22c55e")
    static let warning = Color(hex: "f59e0b")
    static let danger = Color(hex: "ef4444")
    static let info = Color(hex: "3b82f6")

    // MARK: - Background Colors
    static let backgroundLight = Color(hex: "f9fafb")
    static let backgroundDark = Color(hex: "111827")

    // MARK: - Surface Colors
    static let surfaceLight = Color.white
    static let surfaceDark = Color(hex: "1f2937")

    // MARK: - Text Colors
    static let textPrimary = Color(hex: "111827")
    static let textSecondary = Color(hex: "6b7280")
    static let textMuted = Color(hex: "9ca3af")

    // MARK: - Dark Mode Text
    static let textPrimaryDark = Color(hex: "f9fafb")
    static let textSecondaryDark = Color(hex: "d1d5db")
    static let textMutedDark = Color(hex: "6b7280")

    // MARK: - Border Colors
    static let borderLight = Color(hex: "e5e7eb")
    static let borderDark = Color(hex: "374151")

    // MARK: - Gray Scale (Tailwind gray)
    static let gray50 = Color(hex: "f9fafb")
    static let gray100 = Color(hex: "f3f4f6")
    static let gray200 = Color(hex: "e5e7eb")
    static let gray300 = Color(hex: "d1d5db")
    static let gray400 = Color(hex: "9ca3af")
    static let gray500 = Color(hex: "6b7280")
    static let gray600 = Color(hex: "4b5563")
    static let gray700 = Color(hex: "374151")
    static let gray800 = Color(hex: "1f2937")
    static let gray900 = Color(hex: "111827")
    static let gray950 = Color(hex: "030712")
}

// MARK: - Hex Color Initializer

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Semantic Color Helper

extension Color {
    /// Returns the appropriate color based on the color scheme
    static func semantic(light: Color, dark: Color) -> Color {
        Color(UIColor { traitCollection in
            traitCollection.userInterfaceStyle == .dark
                ? UIColor(dark)
                : UIColor(light)
        })
    }

    /// Background color that adapts to color scheme
    static var adaptiveBackground: Color {
        semantic(light: .backgroundLight, dark: .backgroundDark)
    }

    /// Surface color that adapts to color scheme
    static var adaptiveSurface: Color {
        semantic(light: .surfaceLight, dark: .surfaceDark)
    }

    /// Primary text color that adapts to color scheme
    static var adaptiveTextPrimary: Color {
        semantic(light: .textPrimary, dark: .textPrimaryDark)
    }

    /// Secondary text color that adapts to color scheme
    static var adaptiveTextSecondary: Color {
        semantic(light: .textSecondary, dark: .textSecondaryDark)
    }

    /// Border color that adapts to color scheme
    static var adaptiveBorder: Color {
        semantic(light: .borderLight, dark: .borderDark)
    }
}
