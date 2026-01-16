import Foundation

// Food types
enum FoodType: String, Codable, CaseIterable {
    case kibble
    case fish
    case steak

    var config: FoodConfig {
        switch self {
        case .kibble: return FoodConfig(moodBoost: 1, xpCost: 40, name: "Kibble")
        case .fish: return FoodConfig(moodBoost: 2, xpCost: 80, name: "Fish")
        case .steak: return FoodConfig(moodBoost: 3, xpCost: 120, name: "Steak")
        }
    }
}

struct FoodConfig {
    let moodBoost: Int
    let xpCost: Int
    let name: String
}

struct Inventory: Codable, Equatable {
    var kibble: Int
    var fish: Int
    var steak: Int

    static let `default` = Inventory(kibble: 0, fish: 0, steak: 0)

    subscript(food: FoodType) -> Int {
        get {
            switch food {
            case .kibble: return kibble
            case .fish: return fish
            case .steak: return steak
            }
        }
        set {
            switch food {
            case .kibble: kibble = newValue
            case .fish: fish = newValue
            case .steak: steak = newValue
            }
        }
    }
}
