"use client";

import { useState, useMemo } from "react";
import { Logo } from "@/components/Logo";
import { TaskDetail } from "@/components/TaskDetail";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { Task } from "@/types";

// Get the group key for a task date
function getGroupKey(dateStr: string): { key: string; label: string; sortOrder: number } {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  // Yesterday
  if (taskDate.getTime() === yesterday.getTime()) {
    return { key: "yesterday", label: "Yesterday", sortOrder: 0 };
  }

  // Same year - group by month
  if (date.getFullYear() === now.getFullYear()) {
    const monthName = date.toLocaleDateString("en-US", { month: "long" });
    // sortOrder: months in current year, more recent = lower number
    const sortOrder = 100 - date.getMonth();
    return { key: `month-${date.getMonth()}`, label: monthName, sortOrder };
  }

  // Previous years - group by year
  const year = date.getFullYear().toString();
  // sortOrder: years, more recent = lower number
  const sortOrder = 1000 - date.getFullYear();
  return { key: `year-${year}`, label: year, sortOrder };
}

export default function ArchivePage() {
  const router = useRouter();
  const { archive, isLoaded } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Group tasks by period (yesterday, month, year)
  const groupedTasks = useMemo(() => {
    const groups: Record<string, { label: string; sortOrder: number; tasks: Task[] }> = {};

    archive.forEach((task) => {
      const dateStr = task.completedAt
        ? task.completedAt.split("T")[0]
        : task.createdAt.split("T")[0];
      const { key, label, sortOrder } = getGroupKey(dateStr);

      if (!groups[key]) {
        groups[key] = { label, sortOrder, tasks: [] };
      }
      groups[key].tasks.push(task);
    });

    // Sort tasks within each group by date (newest first)
    Object.values(groups).forEach((group) => {
      group.tasks.sort((a, b) => {
        const dateA = a.completedAt || a.createdAt;
        const dateB = b.completedAt || b.createdAt;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    });

    // Return sorted groups
    return Object.entries(groups)
      .sort(([, a], [, b]) => a.sortOrder - b.sortOrder)
      .map(([key, { label, tasks }]) => ({ key, label, tasks }));
  }, [archive]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 py-4">
        <Logo onClick={() => router.push("/")} />
      </header>

      {/* Title */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-chestnut">Archive</h1>
        <p className="text-sm text-taupe mt-1">
          All completed tasks from previous days
        </p>
      </div>

      {/* Archive list */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {groupedTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-taupe">No archived tasks yet</p>
            <p className="text-silver text-sm mt-2">
              Completed tasks will appear here after midnight
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedTasks.map(({ key, label, tasks }) => (
              <div key={key}>
                <h2 className="text-sm font-medium text-taupe mb-3">
                  {label}
                </h2>
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="w-full flex items-center gap-3 py-2 px-3 bg-silver/10 rounded hover:bg-silver/20 transition-colors text-left"
                    >
                      <span
                        className={`text-xs font-medium uppercase ${
                          task.type === "signal"
                            ? "text-chestnut"
                            : "text-taupe"
                        }`}
                      >
                        {task.type}
                      </span>
                      <span className="text-chestnut/70 line-through truncate">
                        {task.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back link */}
      <footer className="px-6 py-4">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-taupe hover:text-chestnut transition-colors"
        >
          ← Back to Today
        </button>
      </footer>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          readOnly
        />
      )}
    </main>
  );
}
