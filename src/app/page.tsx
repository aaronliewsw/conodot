"use client";

import { Logo } from "@/components/Logo";
import { XPBar } from "@/components/XPBar";
import { TaskList } from "@/components/TaskList";
import { AddTask } from "@/components/AddTask";
import { Onboarding } from "@/components/Onboarding";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export default function Home() {
  const {
    tasks,
    progress,
    settings,
    isLoaded,
    signalCount,
    noiseCount,
    completedCount,
    allTasksComplete,
    dailyGoalComplete,
    canAddTask,
    addTask,
    completeTask,
    updateTaskNotes,
    completeOnboarding,
  } = useStore();

  const signalCheck = canAddTask("signal");
  const noiseCheck = canAddTask("noise");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show onboarding for first-time users
  if (!settings.hasSeenOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-silver/20">
        <Logo />
        <div className="text-xs text-taupe">
          <span className={signalCount > 0 ? "text-chestnut" : ""}>
            {signalCount}/4 Signal
          </span>
          <span className="mx-1.5">·</span>
          <span className={noiseCount > 0 ? "text-taupe" : ""}>
            {noiseCount}/1 Noise
          </span>
        </div>
      </header>

      {/* Progress */}
      <div className="px-6 py-4">
        <XPBar
          currentXP={progress.currentXP}
          currentLevel={progress.currentLevel}
          streak={progress.streak}
        />
      </div>

      {/* Completion Banners */}
      {allTasksComplete && (
        <div className="mx-6 mb-4 p-4 bg-chestnut/10 border border-chestnut/20 rounded-lg text-center">
          <p className="text-chestnut font-medium">All tasks complete!</p>
          <p className="text-sm text-taupe mt-1">
            You&apos;ve earned your rest. See you tomorrow.
          </p>
        </div>
      )}
      {!allTasksComplete && dailyGoalComplete && (
        <div className="mx-6 mb-4 p-4 bg-chestnut/5 border border-chestnut/10 rounded-lg text-center">
          <p className="text-chestnut font-medium">All Signal tasks complete!</p>
          <p className="text-sm text-taupe mt-1">
            Great focus today. Finish your Noise task if you have one.
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 px-6 py-2 overflow-y-auto">
        <TaskList tasks={tasks} onComplete={completeTask} onUpdateNotes={updateTaskNotes} />
      </div>

      {/* Task count indicator */}
      {tasks.length > 0 && (
        <div className="px-6 py-2 text-center text-xs text-taupe">
          {completedCount}/{tasks.length} completed
        </div>
      )}

      {/* Add task */}
      <div className="px-6 py-4">
        <AddTask
          onAdd={addTask}
          canAddSignal={signalCheck.allowed}
          canAddNoise={noiseCheck.allowed}
          signalReason={signalCheck.reason}
          noiseReason={noiseCheck.reason}
        />
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 flex items-center justify-between text-xs text-taupe border-t border-silver/20">
        <Link href="/archive" className="hover:text-chestnut transition-colors">
          Archive
        </Link>
        <Link href="/settings" className="hover:text-chestnut transition-colors">
          Settings
        </Link>
      </footer>
    </main>
  );
}
