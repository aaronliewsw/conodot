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
