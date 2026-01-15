"use client";

import { Task } from "@/types";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
}

export function TaskList({ tasks, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-taupe text-lg">No tasks for today</p>
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

  return (
    <div className="divide-y divide-silver/20">
      {sortedTasks.map((task) => (
        <TaskRow key={task.id} task={task} onComplete={onComplete} />
      ))}
    </div>
  );
}
