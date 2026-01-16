import Foundation

/// Storage service using UserDefaults with same key prefix as web version
final class StorageService {
    static let shared = StorageService()

    private let defaults = UserDefaults.standard
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    private init() {}

    // MARK: - Storage Keys (matching web version)
    enum Keys {
        static let tasks = "conodot_tasks"
        static let archive = "conodot_archive"
        static let progress = "conodot_progress"
        static let settings = "conodot_settings"
        static let lastActiveDate = "conodot_last_active_date"
        static let dailyCompletedDate = "conodot_daily_completed_date"
        static let pet = "conodot_pet"
        static let inventory = "conodot_inventory"
    }

    // MARK: - Generic Save/Load
    func save<T: Encodable>(_ value: T, forKey key: String) {
        do {
            let data = try encoder.encode(value)
            defaults.set(data, forKey: key)
        } catch {
            print("StorageService: Failed to save \(key): \(error)")
        }
    }

    func load<T: Decodable>(_ type: T.Type, forKey key: String) -> T? {
        guard let data = defaults.data(forKey: key) else { return nil }
        do {
            return try decoder.decode(type, from: data)
        } catch {
            print("StorageService: Failed to load \(key): \(error)")
            return nil
        }
    }

    func load<T: Decodable>(_ type: T.Type, forKey key: String, default defaultValue: T) -> T {
        load(type, forKey: key) ?? defaultValue
    }

    // MARK: - String Storage (for dates)
    func saveString(_ value: String, forKey key: String) {
        defaults.set(value, forKey: key)
    }

    func loadString(forKey key: String) -> String? {
        defaults.string(forKey: key)
    }

    func loadString(forKey key: String, default defaultValue: String) -> String {
        defaults.string(forKey: key) ?? defaultValue
    }

    // MARK: - Clear All Data
    func clearAll() {
        let keys = [
            Keys.tasks,
            Keys.archive,
            Keys.progress,
            Keys.settings,
            Keys.lastActiveDate,
            Keys.dailyCompletedDate,
            Keys.pet,
            Keys.inventory
        ]
        keys.forEach { defaults.removeObject(forKey: $0) }
    }
}
