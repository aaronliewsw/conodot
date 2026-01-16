import SwiftUI
import Combine

@MainActor
final class AppState: ObservableObject {
    // MARK: - Published State
    @Published var tasks: [Task] = []
    @Published var archive: [Task] = []
    @Published var progress: Progress = .default
    @Published var settings: UserSettings = .default
    @Published var pet: PetState = .createDefault()
    @Published var inventory: Inventory = .default
    @Published var dailyCompletedDate: String = ""
    @Published var isLoaded: Bool = false

    private let storage = StorageService.shared

    // MARK: - Computed Properties

    /// Planning mode: user completed all tasks today, now planning for tomorrow
    var isPlanningMode: Bool {
        dailyCompletedDate == DateUtils.todayString()
    }

    /// Task counts
    var signalCount: Int { tasks.filter { $0.type == .signal }.count }
    var noiseCount: Int { tasks.filter { $0.type == .noise }.count }
    var totalCount: Int { tasks.count }
    var completedCount: Int { tasks.filter { $0.isCompleted }.count }
    var completedSignalCount: Int { tasks.filter { $0.type == .signal && $0.isCompleted }.count }
    var completedNoiseCount: Int { tasks.filter { $0.type == .noise && $0.isCompleted }.count }

    /// All tasks complete (triggers planning mode)
    var allTasksComplete: Bool {
        !tasks.isEmpty && tasks.allSatisfy { $0.isCompleted }
    }

    /// Daily goal complete (3+ Signal tasks all done) - for streak
    var dailyGoalComplete: Bool {
        signalCount >= TaskLimits.minSignal && completedSignalCount == signalCount
    }

    /// Remaining feedings today
    var remainingFeedings: Int {
        PetConfig.maxFeedingsPerDay - pet.feedingsToday
    }

    /// Can feed pet today
    var canFeedPet: Bool {
        remainingFeedings > 0
    }

    // MARK: - Initialization

    init() {
        loadFromStorage()
    }

    // MARK: - Storage Operations

    private func loadFromStorage() {
        let storedTasks = storage.load([Task].self, forKey: StorageService.Keys.tasks, default: [])
        let storedArchive = storage.load([Task].self, forKey: StorageService.Keys.archive, default: [])
        let storedProgress = storage.load(Progress.self, forKey: StorageService.Keys.progress, default: .default)
        let storedSettings = storage.load(UserSettings.self, forKey: StorageService.Keys.settings, default: .default)
        let storedPet = storage.load(PetState.self, forKey: StorageService.Keys.pet, default: .createDefault())
        let storedInventory = storage.load(Inventory.self, forKey: StorageService.Keys.inventory, default: .default)
        let lastActiveDate = storage.loadString(forKey: StorageService.Keys.lastActiveDate) ?? ""
        let storedDailyCompleted = storage.loadString(forKey: StorageService.Keys.dailyCompletedDate) ?? ""

        let today = DateUtils.todayString()

        // Check if we need to do a midnight reset
        if !lastActiveDate.isEmpty && lastActiveDate != today {
            // Day changed - archive completed tasks and reset
            let completedTasks = storedTasks.filter { $0.isCompleted }
            let unfinishedTasks = storedTasks.filter { !$0.isCompleted }

            archive = completedTasks + storedArchive
            tasks = unfinishedTasks
            dailyCompletedDate = ""

            // Check streak
            var newProgress = storedProgress
            if storedProgress.lastCompletedDate == nil || !DateUtils.isYesterday(storedProgress.lastCompletedDate!) {
                newProgress.streak = 0
            }
            progress = newProgress

            // Save updated state
            storage.save(tasks, forKey: StorageService.Keys.tasks)
            storage.save(archive, forKey: StorageService.Keys.archive)
            storage.save(progress, forKey: StorageService.Keys.progress)
            storage.saveString("", forKey: StorageService.Keys.dailyCompletedDate)
        } else {
            tasks = storedTasks
            archive = storedArchive
            progress = storedProgress
            dailyCompletedDate = storedDailyCompleted == today ? storedDailyCompleted : ""
        }

        settings = storedSettings

        // Load pet state and apply mood decay
        var updatedPet = storedPet

        // Reset feedingsToday if new day
        if storedPet.lastFeedingDate != today {
            updatedPet.feedingsToday = 0
            updatedPet.lastFeedingDate = today
        }

        // Apply mood decay
        let hoursSinceUpdate = DateUtils.hoursSince(updatedPet.lastMoodUpdate)
        let moodDecaySteps = Int(hoursSinceUpdate / PetConfig.moodDecayHours)

        if moodDecaySteps > 0 {
            let newMoodIndex = max(0, updatedPet.mood.index - moodDecaySteps)
            updatedPet.mood = MoodState.fromIndex(newMoodIndex)
            updatedPet.lastMoodUpdate = Date()
        }

        pet = updatedPet
        inventory = storedInventory

        storage.save(pet, forKey: StorageService.Keys.pet)
        storage.saveString(today, forKey: StorageService.Keys.lastActiveDate)

        isLoaded = true
    }

    private func saveTasks() {
        storage.save(tasks, forKey: StorageService.Keys.tasks)
    }

    private func saveArchive() {
        storage.save(archive, forKey: StorageService.Keys.archive)
    }

    private func saveProgress() {
        storage.save(progress, forKey: StorageService.Keys.progress)
    }

    private func saveSettings() {
        storage.save(settings, forKey: StorageService.Keys.settings)
    }

    private func savePet() {
        storage.save(pet, forKey: StorageService.Keys.pet)
    }

    private func saveInventory() {
        storage.save(inventory, forKey: StorageService.Keys.inventory)
    }

    private func saveDailyCompletedDate() {
        storage.saveString(dailyCompletedDate, forKey: StorageService.Keys.dailyCompletedDate)
    }

    // MARK: - Task Validation

    func canAddTask(_ type: TaskType) -> (allowed: Bool, reason: String?) {
        if totalCount >= TaskLimits.maxTotal {
            return (false, "Maximum 5 tasks per day reached")
        }

        if type == .signal && signalCount >= TaskLimits.maxSignal {
            return (false, "Maximum 4 Signal tasks reached")
        }

        if type == .noise && noiseCount >= TaskLimits.exactNoise {
            return (false, "Only 1 Noise task allowed per day")
        }

        return (true, nil)
    }

    func canAffordFood(_ food: FoodType) -> Bool {
        progress.currentXP >= food.config.xpCost
    }

    // MARK: - Task Actions

    func addTask(title: String, type: TaskType, notes: String? = nil) -> Bool {
        let (allowed, _) = canAddTask(type)
        guard allowed else { return false }

        let newTask = Task(title: title, type: type, notes: notes)
        tasks.append(newTask)
        saveTasks()
        return true
    }

    func completeTask(_ taskId: UUID) {
        guard !isPlanningMode else { return }
        guard let index = tasks.firstIndex(where: { $0.id == taskId }),
              !tasks[index].isCompleted else { return }

        // Create updated task (must replace whole element for SwiftUI to detect change)
        var updatedTask = tasks[index]
        updatedTask.isCompleted = true
        updatedTask.completedAt = Date()

        // Replace the task in array to trigger @Published update
        tasks[index] = updatedTask

        // Check if all tasks will be complete
        let hasMinSignal = signalCount >= TaskLimits.minSignal
        let allComplete = tasks.allSatisfy { $0.isCompleted }

        if hasMinSignal && allComplete {
            // Archive all tasks and enter planning mode
            archive = tasks + archive
            tasks = []
            dailyCompletedDate = DateUtils.todayString()
            saveDailyCompletedDate()
            saveArchive()
        }

        saveTasks()

        // Award XP
        let xpGain = updatedTask.type == .signal ? XPValues.signal : XPValues.noise
        let newXP = progress.currentXP + xpGain
        let newLevel = (newXP / XPValues.xpPerLevel) + 1

        let today = DateUtils.todayString()

        // Check streak
        if progress.lastCompletedDate != today && dailyGoalComplete {
            let wasYesterday = progress.lastCompletedDate != nil && DateUtils.isYesterday(progress.lastCompletedDate!)
            progress.streak = wasYesterday ? progress.streak + 1 : 0
            progress.lastCompletedDate = today
        }

        progress.currentXP = newXP
        progress.currentLevel = newLevel
        saveProgress()
    }

    func deleteTask(_ taskId: UUID) {
        tasks.removeAll { $0.id == taskId && !$0.isCompleted }
        saveTasks()
    }

    func updateTaskNotes(_ taskId: UUID, notes: String) {
        guard let index = tasks.firstIndex(where: { $0.id == taskId }) else { return }
        tasks[index].notes = notes.isEmpty ? nil : notes
        saveTasks()
    }

    func updateTaskTitle(_ taskId: UUID, title: String) {
        let trimmedTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedTitle.isEmpty,
              let index = tasks.firstIndex(where: { $0.id == taskId }) else { return }
        tasks[index].title = trimmedTitle
        saveTasks()
    }

    // MARK: - Settings Actions

    func completeOnboarding() {
        settings.hasSeenOnboarding = true
        saveSettings()
    }

    func showOnboarding() {
        settings.hasSeenOnboarding = false
        saveSettings()
    }

    // MARK: - Pet Actions

    func updatePetName(_ name: String) {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return }
        pet.name = trimmedName
        savePet()
    }

    func purchaseFood(_ food: FoodType) -> Bool {
        let cost = food.config.xpCost
        guard progress.currentXP >= cost else { return false }

        progress.currentXP -= cost
        saveProgress()

        inventory[food] += 1
        saveInventory()

        return true
    }

    func feedPet(_ food: FoodType) -> Bool {
        guard inventory[food] > 0 else { return false }
        guard pet.feedingsToday < PetConfig.maxFeedingsPerDay else { return false }

        // Remove from inventory
        inventory[food] -= 1
        saveInventory()

        // Update pet mood
        let newMoodIndex = min(MoodState.allCases.count - 1, pet.mood.index + food.config.moodBoost)
        pet.mood = MoodState.fromIndex(newMoodIndex)
        pet.lastMoodUpdate = Date()
        pet.feedingsToday += 1
        pet.lastFeedingDate = DateUtils.todayString()
        savePet()

        return true
    }

    // MARK: - Archive Actions

    func clearArchive() {
        archive = []
        saveArchive()
    }

    // MARK: - Reset

    func resetAll() {
        tasks = []
        archive = []
        progress = .default
        settings = .default
        pet = .createDefault()
        inventory = .default
        dailyCompletedDate = ""

        storage.clearAll()
    }
}
