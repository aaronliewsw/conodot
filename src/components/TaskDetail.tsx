"use client";

import { useState, useEffect } from "react";
import { Task } from "@/types";
import { formatDate } from "@/lib/utils";

interface TaskDetailProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (id: string) => void;
  onUpdateNotes?: (id: string, notes: string) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  isPlanningMode?: boolean;
  readOnly?: boolean;
}

export function TaskDetail({ task, isOpen, onClose, onComplete, onUpdateNotes, onUpdateTitle, isPlanningMode = false, readOnly = false }: TaskDetailProps) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || "");

  // Sync when task changes
  useEffect(() => {
    setTitle(task.title);
    setNotes(task.notes || "");
  }, [task.title, task.notes, task.id]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleComplete = () => {
    if (!task.isCompleted && !isPlanningMode && !readOnly && onComplete) {
      onComplete(task.id);
    }
  };

  const handleClose = () => {
    if (!readOnly) {
      // Save title before closing
      if (title.trim() && title !== task.title && onUpdateTitle) {
        onUpdateTitle(task.id, title);
      }
      // Save notes before closing
      if (notes !== (task.notes || "") && onUpdateNotes) {
        onUpdateNotes(task.id, notes);
      }
    }
    onClose();
  };

  const handleTitleBlur = () => {
    if (readOnly) return;
    if (title.trim() && title !== task.title && onUpdateTitle) {
      onUpdateTitle(task.id, title);
    } else if (!title.trim()) {
      // Revert to original if empty
      setTitle(task.title);
    }
  };

  const handleNotesBlur = () => {
    if (readOnly) return;
    if (notes !== (task.notes || "") && onUpdateNotes) {
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
      <div className="bg-dust-grey rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-silver/20 flex-shrink-0">
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
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Task with checkbox and editable title */}
          <div className="flex items-start gap-3 min-w-0">
            {!readOnly && (
              <button
                onClick={handleComplete}
                disabled={task.isCompleted || isPlanningMode}
                className={`mt-2 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                  task.isCompleted
                    ? "bg-chestnut border-chestnut"
                    : isPlanningMode
                    ? "border-silver/50 cursor-not-allowed"
                    : task.type === "signal"
                    ? "border-chestnut hover:bg-chestnut/10"
                    : "border-taupe hover:bg-taupe/10"
                }`}
                aria-label={task.isCompleted ? "Task completed" : isPlanningMode ? "Tasks can be completed tomorrow" : "Mark task as complete"}
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
            )}
            {readOnly ? (
              <p className={`flex-1 min-w-0 text-base leading-relaxed ${
                task.isCompleted ? "text-taupe line-through" : "text-chestnut"
              }`}>
                {task.title}
              </p>
            ) : (
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                rows={1}
                className={`flex-1 min-w-0 bg-transparent text-base leading-relaxed focus:outline-none resize-none overflow-hidden ${
                  task.isCompleted ? "text-taupe line-through" : "text-chestnut"
                }`}
                disabled={task.isCompleted}
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
              />
            )}
          </div>

          {/* Notes */}
          <div className="mt-4">
            {readOnly ? (
              notes ? (
                <div className="w-full px-3 py-2 text-sm text-taupe bg-silver/10 border border-silver/20 rounded-lg">
                  {notes}
                </div>
              ) : (
                <div className="w-full px-3 py-2 text-sm text-silver bg-silver/10 border border-silver/20 rounded-lg">
                  No notes
                </div>
              )
            ) : (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                placeholder="Notes"
                rows={3}
                className="w-full px-3 py-2 text-sm text-taupe bg-silver/10 border border-silver/20 rounded-lg placeholder:text-silver focus:outline-none focus:border-chestnut/30 resize-none overflow-hidden"
                style={{ minHeight: '80px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.max(80, target.scrollHeight) + 'px';
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = Math.max(80, el.scrollHeight) + 'px';
                  }
                }}
              />
            )}
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
