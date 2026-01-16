import SwiftUI

@main
struct ConodotApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            Group {
                if appState.isLoaded {
                    if appState.settings.hasSeenOnboarding {
                        ContentView()
                    } else {
                        OnboardingView()
                    }
                } else {
                    LoadingView()
                }
            }
            .environmentObject(appState)
        }
    }
}

struct LoadingView: View {
    var body: some View {
        ZStack {
            Theme.dustGrey.ignoresSafeArea()

            VStack(spacing: 16) {
                ProgressView()
                    .tint(Theme.chestnut)

                Text("Loading...")
                    .font(.body)
                    .foregroundColor(Theme.taupe)
            }
        }
    }
}

#Preview {
    LoadingView()
}
