import SwiftUI
import Combine

struct CatView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var isEditing = false
    @State private var editName = ""
    @State private var feedingFood: FoodType? = nil
    @State private var isFeeding = false
    @State private var moodCountdown = ""

    private var moodDecayTimer = Timer.publish(every: 60, on: .main, in: .common).autoconnect()

    var body: some View {
        VStack(spacing: 0) {
            // Pet name
            petNameView
                .padding(.top, 16)

            // Cat display
            VStack(spacing: 4) {
                CatFaceView(mood: appState.pet.mood, size: 140)
                    .scaleEffect(isFeeding ? 1.1 : 1.0)
                    .animation(.easeInOut(duration: 0.3), value: isFeeding)
                    .frame(width: 160, height: 160)

                Text("\(appState.pet.name) \(appState.pet.mood.description)")
                    .font(.subheadline)
                    .foregroundColor(Theme.taupe)

                if !moodCountdown.isEmpty {
                    Text("Mood drops in \(moodCountdown)")
                        .font(.caption)
                        .foregroundColor(Theme.silver)
                }
            }
            .padding(.vertical, 8)

            // Inventory
            inventorySection
                .padding(.horizontal)

            Spacer()

            // Action buttons
            actionButtons
                .padding(.horizontal)
                .padding(.bottom, 16)
        }
        .background(Theme.dustGrey)
        .navigationBarBackButtonHidden(true)
        .toolbarBackground(Theme.dustGrey, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Text("\(appState.remainingFeedings)/\(PetConfig.maxFeedingsPerDay) feedings left")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(Theme.chestnut)
                    .padding(.horizontal, 8)
                    .allowsHitTesting(false)
            }
        }
        .onAppear {
            editName = appState.pet.name
            updateMoodCountdown()
        }
        .onReceive(moodDecayTimer) { _ in
            updateMoodCountdown()
        }
    }

    private var petNameView: some View {
        Group {
            if isEditing {
                HStack {
                    TextField("Pet name", text: $editName)
                        .font(.title2.weight(.medium))
                        .foregroundColor(Theme.chestnut)
                        .multilineTextAlignment(.center)
                        .textFieldStyle(.plain)
                        .onSubmit(saveName)

                    Button(action: saveName) {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(Theme.chestnut)
                    }
                }
                .padding(.horizontal, 40)
            } else {
                Button(action: { isEditing = true }) {
                    HStack(spacing: 8) {
                        Text(appState.pet.name)
                            .font(.title2.weight(.medium))
                            .foregroundColor(Theme.chestnut)

                        Image(systemName: "pencil")
                            .font(.caption)
                            .foregroundColor(Theme.taupe)
                    }
                }
            }
        }
    }

    private var inventorySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("YOUR INVENTORY")
                .font(.caption.weight(.medium))
                .tracking(0.5)
                .foregroundColor(Theme.taupe)

            VStack(spacing: 8) {
                ForEach(FoodType.allCases, id: \.self) { food in
                    FoodItemView(
                        food: food,
                        mode: .inventory,
                        quantity: appState.inventory[food],
                        disabled: !appState.canFeedPet || appState.inventory[food] <= 0 || isFeeding,
                        onAction: { handleFeed(food) }
                    )
                }
            }

            if !appState.canFeedPet {
                Text("No more feedings today. Come back tomorrow!")
                    .font(.caption)
                    .foregroundColor(Theme.taupe)
                    .frame(maxWidth: .infinity)
                    .padding(.top, 8)
            }
        }
    }

    private var actionButtons: some View {
        VStack(spacing: 12) {
            if appState.completedSignalCount >= TaskLimits.minSignal || appState.isPlanningMode {
                NavigationLink(destination: ShopView()) {
                    Text("Visit Shop")
                        .primaryButton()
                }
            }

            Button(action: { dismiss() }) {
                Text("Back to Today")
                    .secondaryButton()
            }
        }
    }

    private func saveName() {
        let trimmed = editName.trimmingCharacters(in: .whitespacesAndNewlines)
        if !trimmed.isEmpty {
            appState.updatePetName(trimmed)
        } else {
            editName = appState.pet.name
        }
        isEditing = false
    }

    private func handleFeed(_ food: FoodType) {
        guard appState.canFeedPet && appState.inventory[food] > 0 && !isFeeding else { return }

        feedingFood = food
        isFeeding = true
        HapticFeedback.light()

        // Simulate feeding animation
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            if appState.feedPet(food) {
                HapticFeedback.success()
            }
            isFeeding = false
            feedingFood = nil
        }
    }

    private func updateMoodCountdown() {
        guard appState.pet.mood != .dead else {
            moodCountdown = ""
            return
        }

        let hoursSinceUpdate = DateUtils.hoursSince(appState.pet.lastMoodUpdate)
        let remainingHours = PetConfig.moodDecayHours - hoursSinceUpdate.truncatingRemainder(dividingBy: PetConfig.moodDecayHours)

        if remainingHours < 1 {
            let minutes = Int(remainingHours * 60)
            moodCountdown = "\(minutes)m"
        } else {
            let hours = Int(remainingHours)
            let minutes = Int((remainingHours - Double(hours)) * 60)
            moodCountdown = "\(hours)h \(minutes)m"
        }
    }
}

#Preview {
    NavigationStack {
        CatView()
    }
    .environmentObject(AppState())
}
