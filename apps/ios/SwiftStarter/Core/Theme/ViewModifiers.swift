import SwiftUI

// MARK: - Card Modifier
// Matches NativeWind card component styling

struct CardModifier: ViewModifier {
    @Environment(\.colorScheme) var colorScheme

    var padding: Spacing = .lg
    var cornerRadius: CornerRadius = .lg

    func body(content: Content) -> some View {
        content
            .padding(padding.rawValue)
            .background(colorScheme == .dark ? Color.surfaceDark : Color.surfaceLight)
            .cornerRadius(cornerRadius.rawValue)
            .shadow(.md)
    }
}

// MARK: - Primary Button Style

struct PrimaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled

    var fullWidth: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg.rawValue)
            .padding(.vertical, Spacing.md.rawValue)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(isEnabled ? Color.brandPrimary : Color.gray400)
            .cornerRadius(CornerRadius.lg.rawValue)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Secondary Button Style

struct SecondaryButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled
    @Environment(\.colorScheme) var colorScheme

    var fullWidth: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(isEnabled ? .brandPrimary : .gray400)
            .padding(.horizontal, Spacing.lg.rawValue)
            .padding(.vertical, Spacing.md.rawValue)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: CornerRadius.lg.rawValue)
                    .stroke(isEnabled ? Color.brandPrimary : Color.gray400, lineWidth: 1.5)
            )
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Ghost Button Style

struct GhostButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .medium))
            .foregroundColor(isEnabled ? .brandPrimary : .gray400)
            .padding(.horizontal, Spacing.md.rawValue)
            .padding(.vertical, Spacing.sm.rawValue)
            .background(configuration.isPressed ? Color.brandPrimary.opacity(0.1) : Color.clear)
            .cornerRadius(CornerRadius.md.rawValue)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Destructive Button Style

struct DestructiveButtonStyle: ButtonStyle {
    @Environment(\.isEnabled) var isEnabled

    var fullWidth: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(size: 16, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, Spacing.lg.rawValue)
            .padding(.vertical, Spacing.md.rawValue)
            .frame(maxWidth: fullWidth ? .infinity : nil)
            .background(isEnabled ? Color.danger : Color.gray400)
            .cornerRadius(CornerRadius.lg.rawValue)
            .scaleEffect(configuration.isPressed ? 0.96 : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Pressable Modifier
// Matches PressableScale from React Native

struct PressableModifier: ViewModifier {
    @State private var isPressed = false
    var scale: CGFloat = 0.96
    var haptic: Bool = true
    var action: () -> Void

    func body(content: Content) -> some View {
        content
            .scaleEffect(isPressed ? scale : 1.0)
            .animation(.spring(response: 0.2, dampingFraction: 0.7), value: isPressed)
            .simultaneousGesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in
                        if !isPressed {
                            isPressed = true
                            if haptic {
                                UIImpactFeedbackGenerator(style: .light).impactOccurred()
                            }
                        }
                    }
                    .onEnded { _ in
                        isPressed = false
                        action()
                    }
            )
    }
}

// MARK: - Loading Overlay Modifier

struct LoadingOverlayModifier: ViewModifier {
    let isLoading: Bool

    func body(content: Content) -> some View {
        ZStack {
            content
                .disabled(isLoading)
                .blur(radius: isLoading ? 2 : 0)

            if isLoading {
                Color.black.opacity(0.2)
                    .ignoresSafeArea()

                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: isLoading)
    }
}

// MARK: - Shimmer Modifier (Skeleton Loading)

struct ShimmerModifier: ViewModifier {
    @State private var phase: CGFloat = 0

    func body(content: Content) -> some View {
        content
            .overlay(
                GeometryReader { geometry in
                    LinearGradient(
                        gradient: Gradient(colors: [
                            .clear,
                            .white.opacity(0.4),
                            .clear
                        ]),
                        startPoint: .leading,
                        endPoint: .trailing
                    )
                    .frame(width: geometry.size.width * 2)
                    .offset(x: phase * geometry.size.width * 2 - geometry.size.width)
                }
            )
            .mask(content)
            .onAppear {
                withAnimation(.linear(duration: 1.5).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }
}

// MARK: - View Extensions

extension View {
    func cardStyle(padding: Spacing = .lg, cornerRadius: CornerRadius = .lg) -> some View {
        modifier(CardModifier(padding: padding, cornerRadius: cornerRadius))
    }

    func pressable(scale: CGFloat = 0.96, haptic: Bool = true, action: @escaping () -> Void) -> some View {
        modifier(PressableModifier(scale: scale, haptic: haptic, action: action))
    }

    func loadingOverlay(_ isLoading: Bool) -> some View {
        modifier(LoadingOverlayModifier(isLoading: isLoading))
    }

    func shimmer() -> some View {
        modifier(ShimmerModifier())
    }
}
