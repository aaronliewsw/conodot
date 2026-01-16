import Foundation

enum TaskType: String, Codable, CaseIterable {
    case signal
    case noise
}

struct Task: Identifiable, Codable, Equatable {
    let id: UUID
    var title: String
    var notes: String?
    var type: TaskType
    var isCompleted: Bool
    var createdAt: Date
    var completedAt: Date?

    init(id: UUID = UUID(), title: String, type: TaskType, notes: String? = nil) {
        self.id = id
        self.title = title
        self.type = type
        self.notes = notes
        self.isCompleted = false
        self.createdAt = Date()
        self.completedAt = nil
    }
}

// MARK: - Task Limits
enum TaskLimits {
    static let maxTotal = 5
    static let minSignal = 3
    static let maxSignal = 4
    static let exactNoise = 1
}

// MARK: - XP Values
enum XPValues {
    static let signal = 40
    static let noise = 5
    static let xpPerLevel = 150
}
