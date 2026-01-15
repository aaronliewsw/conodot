"use client";

import { useState } from "react";
import { Task } from "@/types";
import { TaskRow } from "./TaskRow";
import { TaskDetail } from "./TaskDetail";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  isPlanningMode?: boolean;
}

export function TaskList({ tasks, onComplete, onUpdateNotes, onUpdateTitle, isPlanningMode = false }: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center">
        <p className="text-taupe text-lg">
          {isPlanningMode ? "No tasks for tomorrow" : "No tasks for today"}
        </p>
        <p className="text-silver text-sm mt-2">
          Add up to 5 tasks to get started
        </p>
      </div>
    );
  }

  // Sort: Signal tasks first, then Noise, incomplete before complete
  const sortedTasks = [...tasks].sort((a, b) => {
    // Incomplete first
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    // Signal before Noise
    if (a.type !== b.type) {
      return a.type === "signal" ? -1 : 1;
    }
    return 0;
  });

  const handleTaskComplete = (taskId: string) => {
    onComplete(taskId);
    // Update selected task if it's the one being completed
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => prev ? { ...prev, isCompleted: true, completedAt: new Date().toISOString() } : null);
    }
  };

  return (
    <>
      <div className="divide-y divide-silver/20">
        {sortedTasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            onComplete={onComplete}
            onClick={() => setSelectedTask(task)}
            isPlanningMode={isPlanningMode}
          />
        ))}
      </div>

      {selectedTask && (
        <TaskDetail
          task={tasks.find((t) => t.id === selectedTask.id) || selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={handleTaskComplete}
          onUpdateNotes={onUpdateNotes}
          onUpdateTitle={onUpdateTitle}
          isPlanningMode={isPlanningMode}
        />
      )}
    </>
  );
}
