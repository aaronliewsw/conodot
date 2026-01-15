"use client";

import { Logo } from "@/components/Logo";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export default function ArchivePage() {
  const router = useRouter();
  const { archive, isLoaded } = useStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe">Loading...</div>
      </div>
    );
  }

  // Group tasks by date
  const tasksByDate = archive.reduce((acc, task) => {
    const date = task.completedAt
      ? task.completedAt.split("T")[0]
      : task.createdAt.split("T")[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof archive>);

  const sortedDates = Object.keys(tasksByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col">
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
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-taupe">No archived tasks yet</p>
            <p className="text-silver text-sm mt-2">
              Completed tasks will appear here after midnight
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                <h2 className="text-sm font-medium text-taupe mb-3">
                  {formatDate(date)}
                </h2>
                <div className="space-y-2">
                  {tasksByDate[date].map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 py-2 px-3 bg-silver/10 rounded"
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
                      <span className="text-chestnut/70 line-through">
                        {task.title}
                      </span>
                    </div>
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
    </main>
  );
}
