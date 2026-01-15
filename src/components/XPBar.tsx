"use client";

import { XP_VALUES } from "@/types";

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  streak: number;
}

export function XPBar({ currentXP, currentLevel, streak }: XPBarProps) {
  const xpInCurrentLevel = currentXP % XP_VALUES.xpPerLevel;
  const progressPercent = (xpInCurrentLevel / XP_VALUES.xpPerLevel) * 100;

  return (
    <div className="w-full space-y-2">
      {/* Streak */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-taupe">
          {streak > 0 ? `${streak} day streak` : "Start your streak"}
        </span>
        <span className="text-taupe">Level {currentLevel}</span>
      </div>

      {/* XP Bar */}
      <div className="w-full h-2 bg-silver/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-chestnut rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* XP Text */}
      <div className="text-xs text-taupe text-right">
        {xpInCurrentLevel} / {XP_VALUES.xpPerLevel} XP
      </div>
    </div>
  );
}
