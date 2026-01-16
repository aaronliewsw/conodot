import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        NavigationStack {
            HomeView()
        }
        .tint(Theme.chestnut)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
