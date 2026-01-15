"use client";

import { useState, useCallback } from "react";
import { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskRow({ task, onComplete }: TaskRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [strikeWidth, setStrikeWidth] = useState(0);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const handleComplete = () => {
    if (task.isCompleted || isAnimating) return;

    setIsAnimating(true);
    triggerHaptic(10);

    // Animate strikethrough from left to right
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setStrikeWidth(eased * 100);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Final haptic on complete
        triggerHaptic([5, 30, 5]);
        onComplete(task.id);
      }
    };

    requestAnimationFrame(animate);
  };

  const isStrikethrough = task.isCompleted || isAnimating;

  return (
    <div
      className={`flex items-center gap-4 py-4 px-2 border-b border-silver/20 transition-all duration-300 ${
        task.isCompleted ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={task.isCompleted}
        aria-label={task.isCompleted ? "Task completed" : "Mark task as complete"}
        className={`relative w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.isCompleted
            ? "bg-chestnut border-chestnut"
            : isAnimating
            ? "bg-chestnut/50 border-chestnut scale-95"
            : task.type === "signal"
            ? "border-chestnut hover:bg-chestnut/10 active:scale-90"
            : "border-taupe hover:bg-taupe/10 active:scale-90"
        }`}
      >
        {(task.isCompleted || isAnimating) && (
          <svg
            className={`w-3.5 h-3.5 text-dust-grey transition-transform duration-200 ${
              isAnimating ? "scale-0" : "scale-100"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>

      {/* Task content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-xs font-medium uppercase tracking-wide ${
              task.type === "signal" ? "text-chestnut" : "text-taupe"
            } ${isStrikethrough ? "opacity-50" : ""}`}
          >
            {task.type}
          </span>
        </div>

        {/* Task title with animated strikethrough */}
        <div className="relative">
          <p
            className={`text-lg transition-colors duration-300 ${
              isStrikethrough ? "text-taupe" : "text-chestnut"
            }`}
          >
            {task.title}
          </p>

          {/* Animated strikethrough line */}
          {isStrikethrough && (
            <div
              className="absolute top-1/2 left-0 h-[2px] bg-taupe transition-none"
              style={{
                width: task.isCompleted ? "100%" : `${strikeWidth}%`,
                transform: "translateY(-50%)",
              }}
            />
          )}
        </div>

        {task.notes && (
          <p className={`text-sm text-taupe mt-1 ${isStrikethrough ? "opacity-50" : ""}`}>
            {task.notes}
          </p>
        )}
      </div>
    </div>
  );
}
