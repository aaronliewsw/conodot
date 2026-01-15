"use client";

import { Logo } from "@/components/Logo";
import { XPBar } from "@/components/XPBar";
import { TaskList } from "@/components/TaskList";
import { AddTask } from "@/components/AddTask";
import { useStore } from "@/store/useStore";
import Link from "next/link";

export default function Home() {
  const {
    tasks,
    progress,
    isLoaded,
    signalCount,
    noiseCount,
    canAddTask,
    addTask,
    completeTask,
  } = useStore();

  const signalCheck = canAddTask("signal");
  const noiseCheck = canAddTask("noise");

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="text-sm text-taupe">
          {signalCount}/4 Signal · {noiseCount}/1 Noise
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

      {/* Main content */}
      <div className="flex-1 px-6 py-4">
        <TaskList tasks={tasks} onComplete={completeTask} />
      </div>

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
      <footer className="px-6 py-4 flex items-center justify-between text-xs text-taupe">
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
