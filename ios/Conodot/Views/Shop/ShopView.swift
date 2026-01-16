import SwiftUI

struct ShopView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    var body: some View {
        VStack(spacing: 0) {
            // Title
            VStack(spacing: 4) {
                Text("Cat Shop")
                    .font(.title2.weight(.medium))
                    .foregroundColor(Theme.chestnut)

                Text("Buy food for \(appState.pet.name)")
                    .font(.subheadline)
                    .foregroundColor(Theme.taupe)
            }
            .padding(.vertical)

            // Cat preview
            CatFaceView(mood: appState.pet.mood, size: 120)
                .padding(.vertical, 16)

            // Shop items
            shopSection
                .padding(.horizontal)

            // Inventory display
            inventoryDisplay
                .padding()

            Spacer()

            // Done button
            Button(action: { dismiss() }) {
                Text("Done")
                    .primaryButton()
            }
            .padding()
        }
        .background(Theme.dustGrey)
        .navigationBarBackButtonHidden(true)
        .toolbarBackground(Theme.dustGrey, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Text("\(appState.progress.currentXP) XP")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(Theme.chestnut)
                    .padding(.horizontal, 8)
                    .allowsHitTesting(false)
            }
        }
    }

    private var shopSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("FOOD")
                .font(.caption.weight(.medium))
                .tracking(0.5)
                .foregroundColor(Theme.taupe)

            VStack(spacing: 8) {
                ForEach(FoodType.allCases, id: \.self) { food in
                    FoodItemView(
                        food: food,
                        mode: .shop,
                        disabled: !appState.canAffordFood(food),
                        onAction: { handlePurchase(food) }
                    )
                }
            }
        }
    }

    private var inventoryDisplay: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("YOUR INVENTORY")
                .font(.caption.weight(.medium))
                .tracking(0.5)
                .foregroundColor(Theme.taupe)

            HStack(spacing: 16) {
                inventoryItem("Kibble", count: appState.inventory.kibble)
                inventoryItem("Fish", count: appState.inventory.fish)
                inventoryItem("Steak", count: appState.inventory.steak)
            }
            .padding()
            .background(Theme.silver.opacity(0.1))
            .cornerRadius(12)
        }
    }

    private func inventoryItem(_ name: String, count: Int) -> some View {
        VStack(spacing: 4) {
            Text("\(name):")
                .font(.caption)
                .foregroundColor(Theme.taupe)
            Text("x\(count)")
                .font(.subheadline.weight(.medium))
                .foregroundColor(Theme.chestnut)
        }
    }

    private func handlePurchase(_ food: FoodType) {
        guard appState.canAffordFood(food) else { return }

        if appState.purchaseFood(food) {
            HapticFeedback.success()
        } else {
            HapticFeedback.error()
        }
    }
}

#Preview {
    NavigationStack {
        ShopView()
    }
    .environmentObject(AppState())
}
