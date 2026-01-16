import SwiftUI

struct FoodItemView: View {
    let food: FoodType
    var mode: FoodItemMode = .shop
    var quantity: Int = 0
    var disabled: Bool = false
    var onAction: () -> Void

    enum FoodItemMode {
        case shop      // Shows price, "Buy" button
        case inventory // Shows quantity, "Feed" button
    }

    private var foodConfig: FoodConfig {
        food.config
    }

    private var foodEmoji: String {
        switch food {
        case .kibble: return "🥫"
        case .fish: return "🐟"
        case .steak: return "🥩"
        }
    }

    var body: some View {
        HStack(spacing: 16) {
            // Food icon
            Text(foodEmoji)
                .font(.system(size: 32))
                .frame(width: 50, height: 50)
                .background(Theme.silver.opacity(0.1))
                .cornerRadius(10)

            // Food info
            VStack(alignment: .leading, spacing: 4) {
                Text(foodConfig.name)
                    .font(.body.weight(.medium))
                    .foregroundColor(Theme.chestnut)

                HStack(spacing: 8) {
                    // Mood boost indicator
                    HStack(spacing: 2) {
                        ForEach(0..<foodConfig.moodBoost, id: \.self) { _ in
                            Image(systemName: "heart.fill")
                                .font(.caption2)
                                .foregroundColor(Theme.burntRose)
                        }
                    }

                    if mode == .shop {
                        Text("\(foodConfig.xpCost) XP")
                            .font(.caption)
                            .foregroundColor(Theme.taupe)
                    }
                }
            }

            Spacer()

            // Action area
            if mode == .inventory {
                // Quantity badge
                Text("x\(quantity)")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(Theme.taupe)
                    .padding(.trailing, 8)
            }

            // Action button
            Button(action: {
                HapticFeedback.light()
                onAction()
            }) {
                Text(mode == .shop ? "Buy" : "Feed")
                    .font(.subheadline.weight(.medium))
                    .foregroundColor(disabled ? Theme.silver : Theme.dustGrey)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(disabled ? Theme.silver.opacity(0.3) : Theme.chestnut)
                    .cornerRadius(8)
            }
            .disabled(disabled)
        }
        .padding()
        .background(Theme.silver.opacity(0.05))
        .cornerRadius(12)
    }
}

#Preview {
    VStack(spacing: 12) {
        FoodItemView(food: .kibble, mode: .shop, disabled: false) {}
        FoodItemView(food: .fish, mode: .shop, disabled: true) {}
        FoodItemView(food: .steak, mode: .inventory, quantity: 3) {}
        FoodItemView(food: .kibble, mode: .inventory, quantity: 0, disabled: true) {}
    }
    .padding()
    .background(Theme.dustGrey)
}
