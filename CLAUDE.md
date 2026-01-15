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

Conodot is a minimalist to-do web app focused on daily execution with strict task limits. Web version first, iOS later.

**Core Concept:** Users can add max 5 tasks per day (3-4 Signal + exactly 1 Noise). Signal = high-impact work, Noise = necessary but low-value. Tasks reset at midnight. XP system rewards completion.

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Today view (main screen)
│   ├── archive/page.tsx   # Completed tasks history
│   └── settings/page.tsx  # User settings
├── components/            # React components
│   ├── AddTask.tsx       # Task creation with swipe-to-classify
│   ├── TaskList.tsx      # Task list container
│   ├── TaskRow.tsx       # Individual task with completion
│   ├── XPBar.tsx         # Progress bar + streak display
│   └── Logo.tsx          # Branding
├── store/
│   └── useStore.ts       # Main state hook (tasks, progress, settings)
├── types/
│   └── index.ts          # TypeScript types + constants (TASK_LIMITS, XP_VALUES)
└── lib/
    └── utils.ts          # Helper functions
```

## Key Constraints (from PRD)

- **Task Limits:** Max 5 total, 3-4 Signal, exactly 1 Noise - enforced in `useStore.ts`
- **XP:** Signal +40, Noise +5, 150 XP per level
- **Color Palette (strict):** #eadeda (dust-grey), #998888 (taupe), #bfb8ad (silver), #823329 (chestnut), #8a3033 (burnt-rose)
- **No dark mode** - light theme only per PRD
- **localStorage only** - no backend, full offline support

## State Management

Single `useStore()` hook manages all state with localStorage persistence. Automatic midnight reset archives completed tasks and resets streak if incomplete.
