"use client";

import { useEffect, useRef, useState } from "react";
import { XP_VALUES } from "@/types";

interface XPBarProps {
  currentXP: number;
  currentLevel: number;
  streak: number;
}

export function XPBar({ currentXP, currentLevel, streak }: XPBarProps) {
  const xpInCurrentLevel = currentXP % XP_VALUES.xpPerLevel;
  const progressPercent = (xpInCurrentLevel / XP_VALUES.xpPerLevel) * 100;

  // Track previous XP for animation
  const prevXP = useRef(currentXP);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGainAmount, setXpGainAmount] = useState(0);

  useEffect(() => {
    if (currentXP > prevXP.current) {
      const gain = currentXP - prevXP.current;
      setXpGainAmount(gain);
      setShowXPGain(true);

      const timeout = setTimeout(() => {
        setShowXPGain(false);
      }, 1500);

      prevXP.current = currentXP;
      return () => clearTimeout(timeout);
    }
    prevXP.current = currentXP;
  }, [currentXP]);

  return (
    <div className="w-full space-y-2">
      {/* Streak and Level */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          {streak > 0 && (
            <span className="text-burnt-rose">🔥</span>
          )}
          <span className={streak > 0 ? "text-chestnut font-medium" : "text-taupe"}>
            {streak > 0 ? `${streak} day streak` : "Start your streak"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* XP gain indicator */}
          <span
            className={`text-xs font-medium text-chestnut transition-all duration-300 ${
              showXPGain
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            +{xpGainAmount} XP
          </span>
          <span className="text-taupe font-medium">Lv.{currentLevel}</span>
        </div>
      </div>

      {/* XP Bar */}
      <div className="relative w-full h-2.5 bg-silver/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-chestnut to-burnt-rose rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        {/* Subtle shine effect */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full"
          style={{
            transform: "translateX(-100%)",
            animation: showXPGain ? "shine 0.6s ease-out forwards" : "none",
          }}
        />
      </div>

      {/* XP Text */}
      <div className="flex items-center justify-between text-xs text-taupe">
        <span>{xpInCurrentLevel} XP</span>
        <span>{XP_VALUES.xpPerLevel - xpInCurrentLevel} XP to next level</span>
      </div>

      {/* Inline keyframes for shine animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
