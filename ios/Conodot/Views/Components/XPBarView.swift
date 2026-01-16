import SwiftUI

struct XPBarView: View {
    @EnvironmentObject var appState: AppState

    var body: some View {
        VStack(spacing: 8) {
            // Level and streak info
            HStack {
                Text("Level \(appState.progress.currentLevel)")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(Theme.chestnut)

                Spacer()

                if appState.progress.streak > 0 {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.caption)
                            .foregroundColor(Theme.burntRose)
                        Text("\(appState.progress.streak) day streak")
                            .font(.caption)
                            .foregroundColor(Theme.taupe)
                    }
                }
            }

            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Theme.silver.opacity(0.3))
                        .frame(height: 8)

                    // Fill
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Theme.chestnut)
                        .frame(width: geometry.size.width * appState.progress.xpProgress, height: 8)
                        .animation(.easeOut(duration: 0.3), value: appState.progress.xpProgress)
                }
            }
            .frame(height: 8)

            // XP text
            HStack {
                Text("\(appState.progress.xpForCurrentLevel) / \(XPValues.xpPerLevel) XP")
                    .font(.caption)
                    .foregroundColor(Theme.taupe)

                Spacer()

                Text("\(appState.progress.currentXP) total")
                    .font(.caption)
                    .foregroundColor(Theme.silver)
            }
        }
        .padding(.vertical, 8)
    }
}

#Preview {
    XPBarView()
        .environmentObject(AppState())
        .padding()
        .background(Theme.dustGrey)
}
