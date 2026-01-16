import SwiftUI

enum Theme {
    // Primary colors from PRD
    static let dustGrey = Color(hex: "eadeda")
    static let taupe = Color(hex: "998888")
    static let silver = Color(hex: "bfb8ad")
    static let chestnut = Color(hex: "823329")
    static let burntRose = Color(hex: "8a3033")

    // Semantic colors
    static let background = dustGrey
    static let primaryText = chestnut
    static let secondaryText = taupe
    static let border = silver
    static let signalColor = chestnut
    static let noiseColor = taupe
    static let buttonBackground = chestnut
    static let buttonHover = burntRose
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)

        let r, g, b: UInt64
        switch hex.count {
        case 6: // RGB (24-bit)
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: 1
        )
    }
}

// MARK: - Common View Modifiers
extension View {
    func primaryButton() -> some View {
        self
            .font(.body.weight(.medium))
            .foregroundColor(Theme.dustGrey)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.chestnut)
            .cornerRadius(10)
    }

    func secondaryButton() -> some View {
        self
            .font(.body.weight(.medium))
            .foregroundColor(Theme.chestnut)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Color.clear)
            .overlay(
                RoundedRectangle(cornerRadius: 10)
                    .stroke(Theme.chestnut.opacity(0.3), lineWidth: 1)
            )
    }
}
