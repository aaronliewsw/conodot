import Foundation

// Mood states ordered from worst to best (index-based for calculations)
enum MoodState: String, Codable, CaseIterable {
    case dead
    case sad
    case neutral
    case smiling
    case loved

    var index: Int {
        Self.allCases.firstIndex(of: self) ?? 2
    }

    static func fromIndex(_ index: Int) -> MoodState {
        let clampedIndex = max(0, min(index, allCases.count - 1))
        return allCases[clampedIndex]
    }

    var description: String {
        switch self {
        case .dead: return "is not feeling well..."
        case .sad: return "is feeling down"
        case .neutral: return "is doing okay"
        case .smiling: return "is happy"
        case .loved: return "is feeling loved!"
        }
    }
}

struct PetState: Codable, Equatable {
    var name: String
    var mood: MoodState
    var lastMoodUpdate: Date
    var feedingsToday: Int
    var lastFeedingDate: String  // YYYY-MM-DD
    var createdAt: Date

    static func createDefault() -> PetState {
        PetState(
            name: PetConfig.defaultName,
            mood: PetConfig.initialMood,
            lastMoodUpdate: Date(),
            feedingsToday: 0,
            lastFeedingDate: DateUtils.todayString(),
            createdAt: Date()
        )
    }
}

// MARK: - Pet Configuration
enum PetConfig {
    static let maxFeedingsPerDay = 3
    static let moodDecayHours: Double = 4
    static let initialMood: MoodState = .neutral
    static let defaultName = "Whiskers"
}
