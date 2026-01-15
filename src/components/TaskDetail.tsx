"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export function TaskDetail({ task, isOpen, onClose, onComplete, onUpdateNotes }: TaskDetailProps) {
  const [notes, setNotes] = useState(task.notes || "");

  // Sync notes when task changes
  useEffect(() => {
    setNotes(task.notes || "");
  }, [task.notes, task.id]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleComplete = () => {
    if (!task.isCompleted) {
      onComplete(task.id);
    }
  };

  const handleClose = () => {
    // Save notes before closing
    if (notes !== (task.notes || "")) {
      onUpdateNotes(task.id, notes);
    }
    onClose();
  };

  const handleNotesBlur = () => {
    if (notes !== (task.notes || "")) {
      onUpdateNotes(task.id, notes);
    }
  };

  const taskDate = task.completedAt || task.createdAt;
  const dateLabel = task.isCompleted ? "Completed" : "Created";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
      onClick={handleBackdropClick}
    >
      <div className="bg-dust-grey rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-silver/20">
          <span
            className={`text-xs font-medium uppercase tracking-wide ${
              task.type === "signal" ? "text-chestnut" : "text-taupe"
            }`}
          >
            {task.type}
          </span>
          <button
            onClick={handleClose}
            className="text-taupe hover:text-chestnut transition-colors p-1"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-hidden">
          {/* Task with checkbox */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={handleComplete}
              disabled={task.isCompleted}
              className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                task.isCompleted
                  ? "bg-chestnut border-chestnut"
                  : task.type === "signal"
                  ? "border-chestnut hover:bg-chestnut/10"
                  : "border-taupe hover:bg-taupe/10"
              }`}
              aria-label={task.isCompleted ? "Task completed" : "Mark task as complete"}
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
            <p
              className={`text-base leading-relaxed break-all min-w-0 ${
                task.isCompleted ? "text-taupe line-through" : "text-chestnut"
              }`}
            >
              {task.title}
            </p>
          </div>

          {/* Editable Notes */}
          <div className="mt-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Notes"
              rows={3}
              className="w-full px-3 py-2 text-sm text-taupe bg-silver/10 border border-silver/20 rounded-lg placeholder:text-silver focus:outline-none focus:border-chestnut/30 resize-none"
            />
          </div>

          {/* Date */}
          <div className="pt-3 mt-2 border-t border-silver/20">
            <p className="text-xs text-silver">
              {dateLabel}: {formatDate(taskDate.split("T")[0])}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
