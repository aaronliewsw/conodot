"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Task,
  TaskType,
  Progress,
  UserSettings,
  TASK_LIMITS,
  XP_VALUES,
} from "@/types";
import { generateId, getTodayDateString } from "@/lib/utils";

const STORAGE_KEYS = {
  tasks: "conodot_tasks",
  archive: "conodot_archive",
  progress: "conodot_progress",
  settings: "conodot_settings",
  lastActiveDate: "conodot_last_active_date",
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

export function useStore() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [archive, setArchive] = useState<Task[]>([]);
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
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

    // Check if we need to do a midnight reset
    if (lastActiveDate && lastActiveDate !== today) {
      // Day changed - archive completed tasks and reset
      const completedTasks = storedTasks.filter((t) => t.isCompleted);
      const incompleteTasks = storedTasks.filter((t) => !t.isCompleted);

      // Archive completed tasks
      const newArchive = [...completedTasks, ...storedArchive];
      setArchive(newArchive);
      setToStorage(STORAGE_KEYS.archive, newArchive);

      // Reset tasks for new day
      setTasks([]);
      setToStorage(STORAGE_KEYS.tasks, []);

      // Check streak - if there were incomplete tasks, reset streak
      if (incompleteTasks.length > 0) {
        const newProgress = { ...storedProgress, streak: 0 };
        setProgress(newProgress);
        setToStorage(STORAGE_KEYS.progress, newProgress);
      } else {
        setProgress(storedProgress);
      }
    } else {
      setTasks(storedTasks);
      setArchive(storedArchive);
      setProgress(storedProgress);
    }

    setSettings(storedSettings);
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

  // Task counts
  const signalCount = tasks.filter((t) => t.type === "signal").length;
  const noiseCount = tasks.filter((t) => t.type === "noise").length;
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const allComplete = totalCount > 0 && completedCount === totalCount;

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
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === taskId && !task.isCompleted) {
            return {
              ...task,
              isCompleted: true,
              completedAt: new Date().toISOString(),
            };
          }
          return task;
        })
      );

      // Find the task to award XP
      const task = tasks.find((t) => t.id === taskId);
      if (task && !task.isCompleted) {
        const xpGain = task.type === "signal" ? XP_VALUES.signal : XP_VALUES.noise;
        setProgress((prev) => {
          const newXP = prev.currentXP + xpGain;
          const newLevel = Math.floor(newXP / XP_VALUES.xpPerLevel) + 1;
          return {
            ...prev,
            currentXP: newXP,
            currentLevel: newLevel,
          };
        });
      }

      // Check if all tasks are now complete
      const updatedTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: true } : t
      );
      const allNowComplete =
        updatedTasks.length > 0 && updatedTasks.every((t) => t.isCompleted);

      if (allNowComplete) {
        setProgress((prev) => ({
          ...prev,
          streak: prev.streak + 1,
          lastCompletedDate: getTodayDateString(),
        }));
      }
    },
    [tasks]
  );

  // Delete task (only uncompleted)
  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId || t.isCompleted));
  }, []);

  // Mark onboarding as seen
  const completeOnboarding = useCallback(() => {
    setSettings((prev) => ({ ...prev, hasSeenOnboarding: true }));
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
    setToStorage(STORAGE_KEYS.tasks, []);
    setToStorage(STORAGE_KEYS.archive, []);
    setToStorage(STORAGE_KEYS.progress, defaultProgress);
    setToStorage(STORAGE_KEYS.settings, { hasSeenOnboarding: false });
  }, []);

  return {
    // State
    tasks,
    archive,
    progress,
    settings,
    isLoaded,

    // Computed
    signalCount,
    noiseCount,
    totalCount,
    completedCount,
    allComplete,

    // Validation
    canAddTask,
    isValidTaskList,

    // Actions
    addTask,
    completeTask,
    deleteTask,
    completeOnboarding,
    updateNotificationTime,
    clearArchive,
    resetAll,
  };
}
