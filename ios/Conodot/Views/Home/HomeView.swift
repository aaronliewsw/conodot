import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var selectedTask: Task?
    @State private var showingSettings = false
    @State private var showingArchive = false
    @State private var showingCelebration = false
    @State private var navigateToShop = false
    @State private var earnedXP: Int = 0

    var body: some View {
        ZStack {
            VStack(spacing: 0) {
                // Header
                headerView

                // XP Bar
                XPBarView()
                    .padding(.horizontal)

                // Planning mode banner
                if appState.isPlanningMode {
                    planningModeBanner
                }

                // Daily goal complete banner
                if !appState.isPlanningMode && appState.dailyGoalComplete {
                    goalCompleteBanner
                }

                // Task list
                TaskListView(selectedTask: $selectedTask)
                    .frame(maxHeight: .infinity)

                // Add task area
                AddTaskView()
            }
            .background(Theme.dustGrey)

            // Celebration overlay
            if showingCelebration {
                celebrationOverlay
            }
        }
        .navigationDestination(isPresented: $navigateToShop) {
            ShopView()
        }
        .sheet(item: $selectedTask) { task in
            TaskDetailView(task: task)
        }
        .sheet(isPresented: $showingSettings) {
            SettingsView()
        }
        .sheet(isPresented: $showingArchive) {
            ArchiveView()
        }
        .onChange(of: appState.isPlanningMode) { oldValue, newValue in
            if newValue && !oldValue {
                // Just entered planning mode - calculate XP from today's archived tasks
                let today = DateUtils.todayString()
                let todaysTasks = appState.archive.filter { task in
                    guard let completedAt = task.completedAt else { return false }
                    return DateUtils.dateString(from: completedAt) == today
                }
                let signalXP = todaysTasks.filter { $0.type == .signal }.count * XPValues.signal
                let noiseXP = todaysTasks.filter { $0.type == .noise }.count * XPValues.noise
                earnedXP = signalXP + noiseXP

                // Show celebration
                HapticFeedback.success()
                withAnimation(.spring(response: 0.5, dampingFraction: 0.7)) {
                    showingCelebration = true
                }
            }
        }
    }

    private var headerView: some View {
        HStack {
            LogoView()

            Spacer()

            // Navigation buttons
            HStack(spacing: 16) {
                // Cat button
                NavigationLink(destination: CatView()) {
                    Image(systemName: "pawprint.fill")
                        .font(.title3)
                        .foregroundColor(Theme.chestnut)
                }

                // Archive button
                Button(action: { showingArchive = true }) {
                    Image(systemName: "archivebox")
                        .font(.title3)
                        .foregroundColor(Theme.taupe)
                }

                // Settings button
                Button(action: { showingSettings = true }) {
                    Image(systemName: "gearshape")
                        .font(.title3)
                        .foregroundColor(Theme.taupe)
                }
            }
        }
        .padding()
    }

    private var planningModeBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "moon.fill")
                .font(.caption)
                .foregroundColor(Theme.chestnut)

            Text("Planning tomorrow's tasks")
                .font(.caption.weight(.medium))
                .foregroundColor(Theme.chestnut)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 10)
        .background(Theme.chestnut.opacity(0.1))
    }

    private var goalCompleteBanner: some View {
        HStack(spacing: 8) {
            Image(systemName: "star.fill")
                .font(.caption)
                .foregroundColor(Theme.chestnut)

            Text("Daily goal complete!")
                .font(.caption.weight(.medium))
                .foregroundColor(Theme.chestnut)

            Spacer()

            NavigationLink(destination: ShopView()) {
                Text("Visit Shop")
                    .font(.caption.weight(.medium))
                    .foregroundColor(Theme.dustGrey)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Theme.chestnut)
                    .cornerRadius(12)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal)
        .padding(.vertical, 10)
        .background(Theme.chestnut.opacity(0.1))
    }

    private var celebrationOverlay: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.4)
                .ignoresSafeArea()
                .onTapGesture {
                    withAnimation {
                        showingCelebration = false
                    }
                }

            // Celebration card
            VStack(spacing: 24) {
                // Animated stars
                HStack(spacing: 12) {
                    ForEach(0..<5) { i in
                        Image(systemName: "star.fill")
                            .font(.title2)
                            .foregroundColor(Theme.chestnut)
                            .rotationEffect(.degrees(Double(i) * 15 - 30))
                    }
                }

                // Trophy icon
                Image(systemName: "trophy.fill")
                    .font(.system(size: 60))
                    .foregroundColor(Theme.chestnut)

                // Congratulations text
                VStack(spacing: 8) {
                    Text("Amazing Work!")
                        .font(.title.weight(.bold))
                        .foregroundColor(Theme.chestnut)

                    Text("You completed all your tasks today!")
                        .font(.body)
                        .foregroundColor(Theme.taupe)
                        .multilineTextAlignment(.center)

                    Text("Earned +\(earnedXP) XP")
                        .font(.headline)
                        .foregroundColor(Theme.burntRose)
                        .padding(.top, 4)
                }

                // Buttons
                VStack(spacing: 12) {
                    Button(action: {
                        withAnimation {
                            showingCelebration = false
                        }
                        navigateToShop = true
                    }) {
                        HStack {
                            Image(systemName: "cart.fill")
                            Text("Visit Shop")
                        }
                        .primaryButton()
                    }

                    Button(action: {
                        withAnimation {
                            showingCelebration = false
                        }
                    }) {
                        Text("Continue Planning")
                            .font(.body.weight(.medium))
                            .foregroundColor(Theme.taupe)
                    }
                }
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Theme.dustGrey)
                    .shadow(color: .black.opacity(0.2), radius: 20)
            )
            .padding(24)
            .transition(.scale.combined(with: .opacity))
        }
    }
}

#Preview {
    NavigationStack {
        HomeView()
    }
    .environmentObject(AppState())
}
