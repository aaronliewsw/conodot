"use client";

import { useState } from "react";
import { Task } from "@/types";

interface TaskRowProps {
  task: Task;
  onComplete: (id: string) => void;
}

export function TaskRow({ task, onComplete }: TaskRowProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleComplete = () => {
    if (task.isCompleted || isAnimating) return;

    setIsAnimating(true);

    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    // Small delay for animation
    setTimeout(() => {
      onComplete(task.id);
    }, 300);
  };

  return (
    <div
      className={`flex items-center gap-4 py-4 px-2 border-b border-silver/20 transition-opacity duration-300 ${
        task.isCompleted ? "opacity-50" : ""
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={handleComplete}
        disabled={task.isCompleted}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          task.isCompleted
            ? "bg-chestnut border-chestnut"
            : task.type === "signal"
            ? "border-chestnut hover:bg-chestnut/10"
            : "border-taupe hover:bg-taupe/10"
        }`}
      >
        {task.isCompleted && (
          <svg
            className="w-3 h-3 text-dust-grey"
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
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium uppercase tracking-wide ${
              task.type === "signal" ? "text-chestnut" : "text-taupe"
            }`}
          >
            {task.type}
          </span>
        </div>
        <p
          className={`text-lg transition-all duration-300 ${
            task.isCompleted || isAnimating
              ? "line-through text-taupe"
              : "text-chestnut"
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-sm text-taupe mt-1">{task.notes}</p>
        )}
      </div>
    </div>
  );
}
