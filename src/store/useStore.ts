"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Task,
  TaskType,
  Progress,
  UserSettings,
  TASK_LIMITS,
  XP_VALUES,
  PetState,
  Inventory,
  MoodState,
  FoodType,
  MOOD_STATES,
  FOOD_CONFIG,
  PET_CONFIG,
} from "@/types";
import { generateId, getTodayDateString, isYesterday } from "@/lib/utils";

const STORAGE_KEYS = {
  tasks: "conodot_tasks",
  archive: "conodot_archive",
  progress: "conodot_progress",
  settings: "conodot_settings",
  lastActiveDate: "conodot_last_active_date",
  dailyCompletedDate: "conodot_daily_completed_date",
  pet: "conodot_pet",
  inventory: "conodot_inventory",
} as const;

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

const defaultProgress: Progress = {
  currentXP: 0,
  currentLevel: 1,
  streak: 0,
};

const defaultSettings: UserSettings = {
  hasSeenOnboarding: false,
};

const createDefaultPet = (): PetState => ({
  name: PET_CONFIG.defaultName,
  mood: PET_CONFIG.initialMood,
  lastMoodUpdate: new Date().toISOString(),
  feedingsToday: 0,
  lastFeedingDate: getTodayDateString(),
  createdAt: new Date().toISOString(),
});

const defaultInventory: Inventory = {
  kibble: 0,
  fish: 0,
  steak: 0,
};

export function useStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archive, setArchive] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [pet, setPet] = useState<PetState>(createDefaultPet);
  const [inventory, setInventory] = useState<Inventory>(defaultInventory);
  const [dailyCompletedDate, setDailyCompletedDate] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedTasks = getFromStorage<Task[]>(STORAGE_KEYS.tasks, []);
    const storedArchive = getFromStorage<Task[]>(STORAGE_KEYS.archive, []);
    const storedProgress = getFromStorage<Progress>(
      STORAGE_KEYS.progress,
      defaultProgress
    );
    const storedSettings = getFromStorage<UserSettings>(
      STORAGE_KEYS.settings,
      defaultSettings
    );
    const lastActiveDate = getFromStorage<string>(
      STORAGE_KEYS.lastActiveDate,
      ""
    );

    const today = getTodayDateString();
    const storedDailyCompletedDate = getFromStorage<string>(
      STORAGE_KEYS.dailyCompletedDate,
      ""
    );

    // Check if we need to do a midnight reset
    if (lastActiveDate && lastActiveDate !== today) {
      // Day changed - archive completed tasks and reset
      const completedTasks = storedTasks.filter((t) => t.isCompleted);

      // Archive completed tasks
      const newArchive = [...completedTasks, ...storedArchive];
      setArchive(newArchive);
      setToStorage(STORAGE_KEYS.archive, newArchive);

      // Keep unfinished tasks (planned for today) but reset completed ones
      const unfinishedTasks = storedTasks.filter((t) => !t.isCompleted);
      setTasks(unfinishedTasks);
      setToStorage(STORAGE_KEYS.tasks, unfinishedTasks);

      // Reset dailyCompletedDate since it's a new day
      setDailyCompletedDate("");
      setToStorage(STORAGE_KEYS.dailyCompletedDate, "");

      // Check streak - reset if lastCompletedDate is not yesterday
      const lastCompleted = storedProgress.lastCompletedDate;
      const streakBroken = !lastCompleted || !isYesterday(lastCompleted);
      const newProgress = streakBroken
        ? { ...storedProgress, streak: 0 }
        : storedProgress;
      setProgress(newProgress);
      setToStorage(STORAGE_KEYS.progress, newProgress);
    } else {
      setTasks(storedTasks);
      setArchive(storedArchive);
      setProgress(storedProgress);
      // Only set dailyCompletedDate if it's from today
      setDailyCompletedDate(storedDailyCompletedDate === today ? storedDailyCompletedDate : "");
    }

    setSettings(storedSettings);

    // Load pet state and apply mood decay
    const storedPet = getFromStorage<PetState>(STORAGE_KEYS.pet, createDefaultPet());
    const storedInventory = getFromStorage<Inventory>(STORAGE_KEYS.inventory, defaultInventory);

    // Reset feedingsToday if it's a new day
    let updatedPet = storedPet;
    if (storedPet.lastFeedingDate !== today) {
      updatedPet = { ...storedPet, feedingsToday: 0, lastFeedingDate: today };
    }

    // Apply mood decay based on time elapsed
    const hoursSinceUpdate = (Date.now() - new Date(updatedPet.lastMoodUpdate).getTime()) / (1000 * 60 * 60);
    const moodDecaySteps = Math.floor(hoursSinceUpdate / PET_CONFIG.moodDecayHours);

    if (moodDecaySteps > 0) {
      const currentMoodIndex = MOOD_STATES.indexOf(updatedPet.mood);
      const newMoodIndex = Math.max(0, currentMoodIndex - moodDecaySteps);
      updatedPet = {
        ...updatedPet,
        mood: MOOD_STATES[newMoodIndex],
        lastMoodUpdate: new Date().toISOString(),
      };
    }

    setPet(updatedPet);
    setInventory(storedInventory);
    setToStorage(STORAGE_KEYS.pet, updatedPet);

    setToStorage(STORAGE_KEYS.lastActiveDate, today);
    setIsLoaded(true);
  }, []);

  // Persist tasks
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.tasks, tasks);
    }
  }, [tasks, isLoaded]);

  // Persist progress
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.progress, progress);
    }
  }, [progress, isLoaded]);

  // Persist settings
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.settings, settings);
    }
  }, [settings, isLoaded]);

  // Persist archive
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.archive, archive);
    }
  }, [archive, isLoaded]);

  // Persist pet
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.pet, pet);
    }
  }, [pet, isLoaded]);

  // Persist inventory
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.inventory, inventory);
    }
  }, [inventory, isLoaded]);

  // Persist dailyCompletedDate
  useEffect(() => {
    if (isLoaded) {
      setToStorage(STORAGE_KEYS.dailyCompletedDate, dailyCompletedDate);
    }
  }, [dailyCompletedDate, isLoaded]);

  // Planning mode: user completed all tasks today, now planning for tomorrow
  const isPlanningMode = dailyCompletedDate === getTodayDateString();

  // Task counts
  const signalTasks = tasks.filter((t) => t.type === "signal");
  const noiseTasks = tasks.filter((t) => t.type === "noise");
  const signalCount = signalTasks.length;
  const noiseCount = noiseTasks.length;
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const completedSignalCount = signalTasks.filter((t) => t.isCompleted).length;
  const completedNoiseCount = noiseTasks.filter((t) => t.isCompleted).length;

  // Streak eligibility: 3+ Signal tasks, all Signal tasks completed
  const hasMinSignalTasks = signalCount >= TASK_LIMITS.minSignal;
  const allSignalComplete = signalCount > 0 && completedSignalCount === signalCount;
  const streakEligible = hasMinSignalTasks && allSignalComplete;

  // All tasks complete: 4 Signal + 1 Noise, all done
  const allTasksComplete =
    signalCount === TASK_LIMITS.maxSignal &&
    noiseCount === TASK_LIMITS.exactNoise &&
    completedSignalCount === signalCount &&
    completedNoiseCount === noiseCount;

  // Daily goal complete: 3+ Signal tasks all completed (for banner)
  const dailyGoalComplete = streakEligible;

  // Check if can add task
  const canAddTask = useCallback(
    (type: TaskType): { allowed: boolean; reason?: string } => {
      if (totalCount >= TASK_LIMITS.maxTotal) {
        return { allowed: false, reason: "Maximum 5 tasks per day reached" };
      }

      if (type === "signal") {
        if (signalCount >= TASK_LIMITS.maxSignal) {
          return { allowed: false, reason: "Maximum 4 Signal tasks reached" };
        }
        return { allowed: true };
      }

      if (type === "noise") {
        if (noiseCount >= TASK_LIMITS.exactNoise) {
          return { allowed: false, reason: "Only 1 Noise task allowed per day" };
        }
        return { allowed: true };
      }

      return { allowed: true };
    },
    [totalCount, signalCount, noiseCount]
  );

  // Check if task list is valid (meets minimum requirements)
  const isValidTaskList = useCallback((): {
    valid: boolean;
    reason?: string;
  } => {
    if (signalCount < TASK_LIMITS.minSignal) {
      return {
        valid: false,
        reason: `Need at least ${TASK_LIMITS.minSignal} Signal tasks`,
      };
    }
    return { valid: true };
  }, [signalCount]);

  // Add task
  const addTask = useCallback(
    (title: string, type: TaskType, notes?: string): boolean => {
      const { allowed, reason } = canAddTask(type);
      if (!allowed) {
        console.warn(reason);
        return false;
      }

      const newTask: Task = {
        id: generateId(),
        title,
        type,
        notes,
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };

      setTasks((prev) => [...prev, newTask]);
      return true;
    },
    [canAddTask]
  );

  // Complete task
  const completeTask = useCallback(
    (taskId: string) => {
      // Don't allow completion in planning mode (tasks are for tomorrow)
      if (isPlanningMode) return;

      // Find task first to check if already completed
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.isCompleted) return;

      // Calculate what tasks will look like after completion
      const updatedTasks = tasks.map((t) =>
        t.id === taskId
          ? { ...t, isCompleted: true, completedAt: new Date().toISOString() }
          : t
      );

      // Check if all tasks will be complete (3+ Signal required, ALL tasks done)
      const signalTasksAfter = updatedTasks.filter((t) => t.type === "signal");
      const hasMinSignal = signalTasksAfter.length >= TASK_LIMITS.minSignal;
      const allTasksWillBeComplete = updatedTasks.every((t) => t.isCompleted);
      const canEnterPlanningMode = hasMinSignal && allTasksWillBeComplete;

      // If all tasks complete (including Noise), archive and enter planning mode
      if (canEnterPlanningMode) {
        setArchive((prev) => [...updatedTasks, ...prev]);
        setTasks([]);
        // Mark today as completed - user is now in planning mode
        setDailyCompletedDate(getTodayDateString());
      } else {
        // Just update the task
        setTasks(updatedTasks);
      }

      // Award XP
      const xpGain = task.type === "signal" ? XP_VALUES.signal : XP_VALUES.noise;

      // Check streak eligibility:
      // - Must have at least 3 Signal tasks
      // - All Signal tasks must be completed (including this one if it's Signal)
      const signalTasks = tasks.filter((t) => t.type === "signal");
      const signalTasksAfterCompletion = signalTasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: true } : t
      );
      const hasMinSignalTasks = signalTasks.length >= TASK_LIMITS.minSignal;
      const allSignalComplete = signalTasksAfterCompletion.every((t) => t.isCompleted);
      const completedDailyGoal = hasMinSignalTasks && allSignalComplete;

      setProgress((prevProgress) => {
        const newXP = prevProgress.currentXP + xpGain;
        const newLevel = Math.floor(newXP / XP_VALUES.xpPerLevel) + 1;
        const today = getTodayDateString();

        // If already completed today's goal, no streak change
        if (prevProgress.lastCompletedDate === today) {
          return {
            ...prevProgress,
            currentXP: newXP,
            currentLevel: newLevel,
          };
        }

        // If completed daily goal (3+ Signal tasks done)
        if (completedDailyGoal) {
          const wasYesterday = prevProgress.lastCompletedDate && isYesterday(prevProgress.lastCompletedDate);
          return {
            ...prevProgress,
            currentXP: newXP,
            currentLevel: newLevel,
            // Only increment streak if yesterday was also completed (consecutive)
            streak: wasYesterday ? prevProgress.streak + 1 : 0,
            lastCompletedDate: today,
          };
        }

        return {
          ...prevProgress,
          currentXP: newXP,
          currentLevel: newLevel,
        };
      });
    },
    [tasks, isPlanningMode]
  );

  // Delete task (only uncompleted)
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId || t.isCompleted));
  }, []);

  // Update task notes
  const updateTaskNotes = useCallback((taskId: string, notes: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, notes: notes.trim() || undefined } : t
      )
    );
  }, []);

  // Update task title
  const updateTaskTitle = useCallback((taskId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return; // Don't allow empty titles
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, title: trimmedTitle } : t
      )
    );
  }, []);

  // Mark onboarding as seen
  const completeOnboarding = useCallback(() => {
    setSettings((prev) => ({ ...prev, hasSeenOnboarding: true }));
  }, []);

  // Show onboarding again
  const showOnboarding = useCallback(() => {
    setSettings((prev) => ({ ...prev, hasSeenOnboarding: false }));
  }, []);

  // Update notification time
  const updateNotificationTime = useCallback((time: string) => {
    setSettings((prev) => ({ ...prev, notificationTime: time }));
  }, []);

  // Clear archive
  const clearArchive = useCallback(() => {
    setArchive([]);
    setToStorage(STORAGE_KEYS.archive, []);
  }, []);

  // Reset all progress
  const resetAll = useCallback(() => {
    setTasks([]);
    setArchive([]);
    setProgress(defaultProgress);
    setSettings({ hasSeenOnboarding: false });
    setPet(createDefaultPet());
    setInventory(defaultInventory);
    setDailyCompletedDate("");
    setToStorage(STORAGE_KEYS.tasks, []);
    setToStorage(STORAGE_KEYS.archive, []);
    setToStorage(STORAGE_KEYS.progress, defaultProgress);
    setToStorage(STORAGE_KEYS.settings, { hasSeenOnboarding: false });
    setToStorage(STORAGE_KEYS.pet, createDefaultPet());
    setToStorage(STORAGE_KEYS.inventory, defaultInventory);
    setToStorage(STORAGE_KEYS.dailyCompletedDate, "");
  }, []);

  // ============================================
  // Pet System Computed Values
  // ============================================

  // Remaining feedings today
  const remainingFeedings = PET_CONFIG.maxFeedingsPerDay - pet.feedingsToday;

  // Check if can feed pet today
  const canFeedPet = remainingFeedings > 0;

  // Check if can afford food
  const canAffordFood = useCallback(
    (food: FoodType): boolean => {
      return progress.currentXP >= FOOD_CONFIG[food].xpCost;
    },
    [progress.currentXP]
  );

  // ============================================
  // Pet System Actions
  // ============================================

  // Update pet name
  const updatePetName = useCallback((name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setPet((prev) => ({ ...prev, name: trimmedName }));
  }, []);

  // Purchase food with XP
  const purchaseFood = useCallback(
    (food: FoodType): boolean => {
      const cost = FOOD_CONFIG[food].xpCost;
      if (progress.currentXP < cost) {
        return false;
      }

      // Deduct XP but keep level (level never drops from spending)
      setProgress((prev) => ({
        ...prev,
        currentXP: prev.currentXP - cost,
        // Level stays the same - never decreases from spending XP
      }));

      // Add to inventory
      setInventory((prev) => ({
        ...prev,
        [food]: prev[food] + 1,
      }));

      return true;
    },
    [progress.currentXP]
  );

  // Feed pet from inventory
  const feedPet = useCallback(
    (food: FoodType): boolean => {
      // Check if we have the food in inventory
      if (inventory[food] <= 0) {
        return false;
      }

      // Check if we can feed today
      if (pet.feedingsToday >= PET_CONFIG.maxFeedingsPerDay) {
        return false;
      }

      // Remove from inventory
      setInventory((prev) => ({
        ...prev,
        [food]: prev[food] - 1,
      }));

      // Update pet mood and feeding count
      setPet((prev) => {
        const currentMoodIndex = MOOD_STATES.indexOf(prev.mood);
        const moodBoost = FOOD_CONFIG[food].moodBoost;
        // Cap at max mood (loved = index 4)
        const newMoodIndex = Math.min(MOOD_STATES.length - 1, currentMoodIndex + moodBoost);

        return {
          ...prev,
          mood: MOOD_STATES[newMoodIndex],
          lastMoodUpdate: new Date().toISOString(),
          feedingsToday: prev.feedingsToday + 1,
          lastFeedingDate: getTodayDateString(),
        };
      });

      return true;
    },
    [inventory, pet.feedingsToday]
  );

  return {
    // State
    tasks,
    archive,
    progress,
    settings,
    pet,
    inventory,
    isLoaded,

    // Computed
    signalCount,
    noiseCount,
    totalCount,
    completedCount,
    allTasksComplete,
    dailyGoalComplete,
    isPlanningMode,

    // Pet Computed
    remainingFeedings,
    canFeedPet,

    // Validation
    canAddTask,
    isValidTaskList,
    canAffordFood,

    // Actions
    addTask,
    completeTask,
    deleteTask,
    updateTaskNotes,
    updateTaskTitle,
    completeOnboarding,
    showOnboarding,
    updateNotificationTime,
    clearArchive,
    resetAll,

    // Pet Actions
    updatePetName,
    purchaseFood,
    feedPet,
  };
}
