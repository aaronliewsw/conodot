# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Overview

Conodot is a minimalist to-do web app focused on daily execution with strict task limits and a virtual pet gamification system. Web version complete (Phases 1 & 2), iOS version next (Phase 3).

**Core Concept:** Users can add max 5 tasks per day (3-4 Signal + exactly 1 Noise). Signal = high-impact work, Noise = necessary but low-value. Tasks auto-archive at midnight. XP rewards completion, which can be spent on food for a virtual pet.

## Architecture

```
src/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                # Today view (main screen)
│   ├── archive/page.tsx        # Completed tasks history (grouped by Yesterday/Month/Year)
│   ├── settings/page.tsx       # User settings + reset options
│   ├── cat/page.tsx            # Pet view + feeding
│   └── shop/page.tsx           # Buy food with XP
├── components/
│   ├── AddTask.tsx             # Swipe-to-classify task creation
│   ├── TaskList.tsx            # Task list container
│   ├── TaskRow.tsx             # Individual task with animated completion
│   ├── TaskDetail.tsx          # Modal for task details/notes (also read-only for archive)
│   ├── XPBar.tsx               # Progress bar + streak display
│   ├── Logo.tsx                # Branding component
│   ├── CatDisplay.tsx          # Animated cat with mood states + feeding animation
│   ├── FoodItem.tsx            # Food item (shop and inventory modes)
│   └── Onboarding.tsx          # Multi-step welcome flow
├── store/
│   └── useStore.ts             # Main state hook (all app state + localStorage persistence)
├── types/
│   └── index.ts                # TypeScript types + constants
├── lib/
│   └── utils.ts                # Helper functions (generateId, date utils)
└── public/
    └── cat/                    # Cat SVG assets (5 moods, 3 foods, animations)
```

## Key Constraints (from PRD)

- **Task Limits:** Max 5 total, 3-4 Signal, exactly 1 Noise - enforced in `useStore.ts`
- **XP System:** Signal +40 XP, Noise +5 XP, 150 XP per level
- **Streak:** Requires 3+ Signal tasks completed daily, consecutive days
- **Color Palette (strict):**
  - `#eadeda` (dust-grey) - Background
  - `#998888` (taupe) - Secondary text, Noise tasks
  - `#bfb8ad` (silver) - Borders, disabled
  - `#823329` (chestnut) - Primary, Signal tasks
  - `#8a3033` (burnt-rose) - Hover states
- **No dark mode** - Light theme only per PRD
- **localStorage only** - No backend, full offline support

## Types & Constants

### Task Types
```typescript
type TaskType = "signal" | "noise";

interface Task {
  id: string;
  title: string;
  type: TaskType;
  notes?: string;
  isCompleted: boolean;
  completedAt?: string;  // ISO date
  createdAt: string;     // ISO date
}
```

### Task Limits
```typescript
const TASK_LIMITS = {
  maxTotal: 5,
  minSignal: 3,
  maxSignal: 4,
  exactNoise: 1,
};
```

### XP Values
```typescript
const XP_VALUES = {
  signal: 40,
  noise: 5,
  xpPerLevel: 150,
};
```

### Pet System Types
```typescript
const MOOD_STATES = ["dead", "sad", "neutral", "smiling", "loved"] as const;
type MoodState = "dead" | "sad" | "neutral" | "smiling" | "loved";

const FOOD_TYPES = ["kibble", "fish", "steak"] as const;
type FoodType = "kibble" | "fish" | "steak";

const FOOD_CONFIG = {
  kibble: { moodBoost: 1, xpCost: 40 },
  fish: { moodBoost: 2, xpCost: 80 },
  steak: { moodBoost: 3, xpCost: 120 },
};

const PET_CONFIG = {
  maxFeedingsPerDay: 3,
  moodDecayHours: 4,
  initialMood: "neutral",
  defaultName: "Whiskers",
};

interface PetState {
  name: string;
  mood: MoodState;
  lastMoodUpdate: string;    // ISO timestamp for decay
  feedingsToday: number;
  lastFeedingDate: string;   // YYYY-MM-DD
  createdAt: string;         // ISO timestamp
}

interface Inventory {
  kibble: number;
  fish: number;
  steak: number;
}
```

## Storage Keys

All localStorage keys use `conodot_` prefix:
```typescript
const STORAGE_KEYS = {
  tasks: "conodot_tasks",
  archive: "conodot_archive",
  progress: "conodot_progress",
  settings: "conodot_settings",
  lastActiveDate: "conodot_last_active_date",
  dailyCompletedDate: "conodot_daily_completed_date",
  pet: "conodot_pet",
  inventory: "conodot_inventory",
};
```

## State Management

Single `useStore()` hook manages all state with localStorage persistence.

### Key Computed Values
- `isPlanningMode` - True when `dailyCompletedDate === today` (all tasks archived)
- `allTasksComplete` - 4 Signal + 1 Noise, all done
- `dailyGoalComplete` - 3+ Signal tasks completed (for streak)
- `canFeedPet` - `remainingFeedings > 0`
- `canAffordFood(food)` - `currentXP >= FOOD_CONFIG[food].xpCost`

### Key Actions
- `addTask(title, type, notes?)` - Creates task if limits allow
- `completeTask(taskId)` - Marks complete, awards XP, checks planning mode
- `updateTaskNotes(taskId, notes)` - Updates task notes
- `updateTaskTitle(taskId, title)` - Updates task title
- `purchaseFood(food)` - Deducts XP, adds to inventory
- `feedPet(food)` - Consumes from inventory, boosts mood
- `resetAll()` - Clears all data, shows onboarding again

### Planning Mode Logic
1. User completes ALL tasks (3+ Signal + any Noise)
2. Tasks auto-archive, `dailyCompletedDate` set to today
3. User can add tasks for tomorrow but can't check them off
4. At midnight: unfinished tasks become today's tasks, planning mode resets

### Midnight Reset Logic
1. Completed tasks → archive
2. Unfinished tasks → remain as today's tasks
3. Streak resets if yesterday wasn't completed
4. `dailyCompletedDate` resets
5. Pet `feedingsToday` resets

### Mood Decay Logic
- Mood decreases by 1 level every 4 hours
- Checked on app load, updates `lastMoodUpdate`
- Feeding increases mood based on food type (1-3 levels)
- Mood capped at "loved" (max) and "dead" (min)

## Component Patterns

### TaskRow.tsx
- Animated strikethrough (300ms ease-out)
- Haptic feedback via `navigator.vibrate`
- `isPlanningMode` prop disables checkbox
- 200ms delay before task reorders to bottom

### TaskDetail.tsx
- Modal with backdrop click to close
- Auto-saving on blur for title/notes
- `readOnly` prop for archive viewing
- Auto-resizing textareas

### CatDisplay.tsx
- 5 mood state SVGs
- Feeding animation (9 frames per food type)
- `onFeedingComplete` callback after animation

### AddTask.tsx
- Swipe gesture to classify (left = Signal, right = Noise)
- Visual feedback during swipe
- Validates against task limits

## Phase 3: iOS App (Swift/SwiftUI)

The next phase converts this web MVP to a native iOS app using Swift and SwiftUI.

### Why Swift/SwiftUI
- Native performance and best iOS experience
- First-party support with direct access to all iOS APIs
- SwiftUI declarative syntax maps well to React patterns
- No JavaScript runtime overhead

### Key Mappings

| Web | iOS |
|-----|-----|
| `useState` | `@State` |
| `useStore` (hook) | `@ObservableObject` + `@EnvironmentObject` |
| `useEffect` | `.onAppear`, `.onChange` |
| `localStorage` | `UserDefaults` |
| Next.js router | `NavigationStack` |
| Tailwind CSS | SwiftUI ViewModifiers |
| `navigator.vibrate` | `UIImpactFeedbackGenerator` |

### SwiftUI Project Structure
```
Conodot/
├── ConodotApp.swift              # Entry point
├── Models/                       # Task, Pet, Progress, Inventory
├── ViewModels/AppState.swift     # ObservableObject (like useStore)
├── Views/
│   ├── Home/                     # HomeView, TaskRowView, etc.
│   ├── Cat/                      # CatView, CatDisplayView
│   ├── Shop/                     # ShopView
│   ├── Archive/                  # ArchiveView
│   ├── Settings/                 # SettingsView
│   ├── Onboarding/               # OnboardingView
│   └── Components/               # LogoView, XPBarView, etc.
├── Services/StorageService.swift # UserDefaults wrapper
└── Utils/                        # DateUtils, Theme
```

### Storage Keys (same prefix)
Use `conodot_` prefix in UserDefaults to maintain consistency:
- `conodot_tasks`, `conodot_archive`, `conodot_progress`
- `conodot_pet`, `conodot_inventory`
- `conodot_dailyCompleted`, `conodot_onboarding`

### Implementation Order
1. **Foundation:** Models, Theme, StorageService, AppState
2. **Core Components:** LogoView, XPBarView, TaskRowView, TaskListView
3. **Screens:** HomeView, ArchiveView, SettingsView
4. **Pet System:** CatDisplayView, FoodItemView, CatView, ShopView
5. **Polish:** OnboardingView, animations, haptics

## Deployment

- **Web:** Vercel (auto-deploys from main branch)
- **iOS:** App Store (when Phase 3 complete)

## Files Quick Reference

| Feature | File(s) |
|---------|---------|
| Main screen | `src/app/page.tsx` |
| State management | `src/store/useStore.ts` |
| All types/constants | `src/types/index.ts` |
| Task completion | `src/components/TaskRow.tsx` |
| Pet feeding | `src/app/cat/page.tsx`, `src/components/CatDisplay.tsx` |
| Shop | `src/app/shop/page.tsx` |
| Archive (grouped) | `src/app/archive/page.tsx` |
| Planning mode | `useStore.ts:isPlanningMode`, `TaskRow.tsx`, `TaskList.tsx` |
