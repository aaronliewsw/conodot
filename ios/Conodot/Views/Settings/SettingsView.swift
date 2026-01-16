import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @State private var showingResetAlert = false
    @State private var showingClearArchiveAlert = false

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.dustGrey.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 24) {
                        // Stats section
                        statsSection

                        // Actions section
                        actionsSection

                        // Danger zone
                        dangerZoneSection
                    }
                    .padding()
                }
            }
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                    .foregroundColor(Theme.chestnut)
                }
            }
            .alert("Clear Archive", isPresented: $showingClearArchiveAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Clear", role: .destructive) {
                    appState.clearArchive()
                }
            } message: {
                Text("This will permanently delete all archived tasks. This cannot be undone.")
            }
            .alert("Reset All Progress", isPresented: $showingResetAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Reset", role: .destructive) {
                    appState.resetAll()
                    dismiss()
                }
            } message: {
                Text("This will delete all tasks, progress, and pet data. You'll start fresh with the onboarding. This cannot be undone.")
            }
        }
    }

    private var statsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Statistics")
                .font(.headline)
                .foregroundColor(Theme.chestnut)

            VStack(spacing: 12) {
                statRow(label: "Level", value: "\(appState.progress.currentLevel)")
                statRow(label: "Total XP", value: "\(appState.progress.currentXP)")
                statRow(label: "Current Streak", value: "\(appState.progress.streak) days")
                statRow(label: "Archived Tasks", value: "\(appState.archive.count)")
            }
            .padding()
            .background(Theme.silver.opacity(0.1))
            .cornerRadius(12)
        }
    }

    private func statRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .font(.body)
                .foregroundColor(Theme.taupe)
            Spacer()
            Text(value)
                .font(.body.weight(.medium))
                .foregroundColor(Theme.chestnut)
        }
    }

    private var actionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Actions")
                .font(.headline)
                .foregroundColor(Theme.chestnut)

            VStack(spacing: 12) {
                Button(action: { appState.showOnboarding() }) {
                    HStack {
                        Image(systemName: "questionmark.circle")
                            .foregroundColor(Theme.chestnut)
                        Text("Show Onboarding Again")
                            .foregroundColor(Theme.chestnut)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(Theme.silver)
                    }
                    .padding()
                    .background(Theme.silver.opacity(0.1))
                    .cornerRadius(12)
                }

                Button(action: { showingClearArchiveAlert = true }) {
                    HStack {
                        Image(systemName: "trash")
                            .foregroundColor(Theme.taupe)
                        Text("Clear Archive")
                            .foregroundColor(Theme.taupe)
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(Theme.silver)
                    }
                    .padding()
                    .background(Theme.silver.opacity(0.1))
                    .cornerRadius(12)
                }
            }
        }
    }

    private var dangerZoneSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Danger Zone")
                .font(.headline)
                .foregroundColor(Theme.burntRose)

            Button(action: { showingResetAlert = true }) {
                HStack {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .foregroundColor(Theme.burntRose)
                    Text("Reset All Progress")
                        .foregroundColor(Theme.burntRose)
                    Spacer()
                }
                .padding()
                .background(Theme.burntRose.opacity(0.1))
                .cornerRadius(12)
            }

            Text("This will delete all your tasks, XP, streaks, pet, and inventory. You will start over completely.")
                .font(.caption)
                .foregroundColor(Theme.taupe)
        }
    }
}

#Preview {
    SettingsView()
        .environmentObject(AppState())
}
