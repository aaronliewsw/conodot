import Foundation

struct UserSettings: Codable, Equatable {
    var hasSeenOnboarding: Bool
    var notificationTime: String?  // HH:mm format

    static let `default` = UserSettings(
        hasSeenOnboarding: false,
        notificationTime: nil
    )
}
