import Foundation

struct Progress: Codable, Equatable {
    var currentXP: Int
    var currentLevel: Int
    var streak: Int
    var lastCompletedDate: String?  // YYYY-MM-DD

    static let `default` = Progress(
        currentXP: 0,
        currentLevel: 1,
        streak: 0,
        lastCompletedDate: nil
    )

    var xpForCurrentLevel: Int {
        currentXP % XPValues.xpPerLevel
    }

    var xpProgress: Double {
        Double(xpForCurrentLevel) / Double(XPValues.xpPerLevel)
    }
}
