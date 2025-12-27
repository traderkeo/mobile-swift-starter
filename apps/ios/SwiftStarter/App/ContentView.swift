import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authManager: AuthManager
    @State private var showOnboarding = !StorageManager.shared.get(Bool.self, forKey: StorageKey.onboardingComplete) ?? false

    var body: some View {
        Group {
            if showOnboarding {
                OnboardingView(isComplete: $showOnboarding)
            } else if authManager.isAuthenticated {
                MainTabView()
            } else {
                AuthFlowView()
            }
        }
        .animation(.easeInOut, value: authManager.isAuthenticated)
        .animation(.easeInOut, value: showOnboarding)
    }
}

struct MainTabView: View {
    @State private var selectedTab = 0
    @State private var showPaywall = false
    @EnvironmentObject private var storeManager: StoreManager

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)

            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(1)

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(2)
        }
        .tint(.brandPrimary)
        .sheet(isPresented: $showPaywall) {
            PaywallView()
        }
    }
}

struct AuthFlowView: View {
    @State private var showLogin = true

    var body: some View {
        NavigationStack {
            if showLogin {
                LoginView(showSignup: $showLogin)
            } else {
                SignupView(showLogin: $showLogin)
            }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AuthManager.shared)
        .environmentObject(StoreManager.shared)
        .environmentObject(NetworkMonitor.shared)
}
