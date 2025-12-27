import SwiftUI

struct OnboardingView: View {
    @Binding var isComplete: Bool
    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "star.fill",
            title: "Welcome",
            description: "Your new favorite app is here. Let's get you started.",
            color: .brandPrimary
        ),
        OnboardingPage(
            icon: "bolt.fill",
            title: "Powerful Features",
            description: "Access premium features designed to boost your productivity.",
            color: .brandAccent
        ),
        OnboardingPage(
            icon: "lock.shield.fill",
            title: "Secure & Private",
            description: "Your data is encrypted and never shared with third parties.",
            color: .success
        ),
        OnboardingPage(
            icon: "crown.fill",
            title: "Go Premium",
            description: "Unlock all features with a premium subscription.",
            color: .warning
        )
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Page content
            TabView(selection: $currentPage) {
                ForEach(pages.indices, id: \.self) { index in
                    OnboardingPageView(page: pages[index])
                        .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut, value: currentPage)

            // Bottom section
            VStack(spacing: Spacing.lg.rawValue) {
                // Page indicators
                HStack(spacing: Spacing.sm.rawValue) {
                    ForEach(pages.indices, id: \.self) { index in
                        Circle()
                            .fill(index == currentPage ? Color.brandPrimary : Color.gray300)
                            .frame(width: 8, height: 8)
                            .scaleEffect(index == currentPage ? 1.2 : 1.0)
                            .animation(.spring(), value: currentPage)
                    }
                }

                // Buttons
                if currentPage == pages.count - 1 {
                    Button("Get Started") {
                        completeOnboarding()
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    Button("Maybe Later") {
                        completeOnboarding()
                    }
                    .buttonStyle(GhostButtonStyle())
                } else {
                    Button("Continue") {
                        withAnimation {
                            currentPage += 1
                        }
                    }
                    .buttonStyle(PrimaryButtonStyle())

                    Button("Skip") {
                        completeOnboarding()
                    }
                    .buttonStyle(GhostButtonStyle())
                }
            }
            .padding()
            .padding(.bottom, Spacing.xl.rawValue)
        }
        .background(Color.adaptiveBackground)
        .trackScreen("Onboarding")
    }

    private func completeOnboarding() {
        StorageManager.shared.set(true, forKey: StorageKey.onboardingComplete)
        AnalyticsManager.shared.track(.onboardingCompleted, properties: [
            "pages_viewed": currentPage + 1,
            "total_pages": pages.count
        ])
        isComplete = false
    }
}

// MARK: - Onboarding Page Model

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let description: String
    let color: Color
}

// MARK: - Onboarding Page View

struct OnboardingPageView: View {
    let page: OnboardingPage

    var body: some View {
        VStack(spacing: Spacing.xxl.rawValue) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(page.color.opacity(0.15))
                    .frame(width: 160, height: 160)

                Image(systemName: page.icon)
                    .font(.system(size: 70))
                    .foregroundColor(page.color)
            }

            // Text content
            VStack(spacing: Spacing.md.rawValue) {
                Text(page.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.adaptiveTextPrimary)
                    .multilineTextAlignment(.center)

                Text(page.description)
                    .font(.body)
                    .foregroundColor(.adaptiveTextSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Spacing.xl.rawValue)
            }

            Spacer()
            Spacer()
        }
        .padding()
    }
}

#Preview {
    OnboardingView(isComplete: .constant(true))
}
