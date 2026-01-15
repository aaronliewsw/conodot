export type TaskType = "signal" | "noise";

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface DayRecord {
  date: string; // YYYY-MM-DD format
  tasks: Task[];
  isComplete: boolean;
}

export interface Progress {
  currentXP: number;
  currentLevel: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD format
}

export interface UserSettings {
  notificationTime?: string; // HH:mm format
  profileImage?: string; // base64 or URL
  hasSeenOnboarding: boolean;
}

// Task limits from PRD
export const TASK_LIMITS = {
  maxTotal: 5,
  minSignal: 3,
  maxSignal: 4,
  exactNoise: 1,
} as const;

// XP values from PRD
export const XP_VALUES = {
  signal: 40,
  noise: 5,
  xpPerLevel: 150,
} as const;

// ============================================
// Pet System Types (Phase 2)
// ============================================

// Mood states ordered from worst to best (index-based for calculations)
export const MOOD_STATES = ["dead", "sad", "neutral", "smiling", "loved"] as const;
export type MoodState = (typeof MOOD_STATES)[number];

// Food types
export const FOOD_TYPES = ["kibble", "fish", "steak"] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

// Food configuration (mood boost and XP cost)
export const FOOD_CONFIG = {
  kibble: { moodBoost: 1, xpCost: 40, name: "Kibble" },
  fish: { moodBoost: 2, xpCost: 80, name: "Fish" },
  steak: { moodBoost: 3, xpCost: 120, name: "Steak" },
} as const;

// Pet system constants
export const PET_CONFIG = {
  maxFeedingsPerDay: 3,
  moodDecayHours: 4,
  initialMood: "neutral" as MoodState,
  defaultName: "Whiskers",
} as const;

// Food inventory
export interface Inventory {
  kibble: number;
  fish: number;
  steak: number;
}

// Pet state
export interface PetState {
  name: string;
  mood: MoodState;
  lastMoodUpdate: string;    // ISO timestamp for decay calculation
  feedingsToday: number;
  lastFeedingDate: string;   // YYYY-MM-DD for daily reset
  createdAt: string;         // ISO timestamp, Day 1 reference
}
