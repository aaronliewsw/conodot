"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const {
    settings,
    progress,
    isLoaded,
    updateNotificationTime,
    showOnboarding,
    clearArchive,
    resetAll,
  } = useStore();

  const [clearConfirmStep, setClearConfirmStep] = useState(0); // 0: none, 1: first confirm, 2: second confirm
  const [resetConfirmStep, setResetConfirmStep] = useState(0); // 0: none, 1: first confirm, 2: second confirm

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe">Loading...</div>
      </div>
    );
  }

  const handleClearArchive = () => {
    clearArchive();
    setClearConfirmStep(0);
  };

  const handleResetAll = () => {
    resetAll();
    setResetConfirmStep(0);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 py-4">
        <Logo onClick={() => router.push("/")} />
      </header>

      {/* Title */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-semibold text-chestnut">Settings</h1>
      </div>

      {/* Settings list */}
      <div className="flex-1 px-6 py-4 space-y-6">
        {/* Progress summary */}
        <div className="p-4 bg-silver/10 rounded-lg">
          <h2 className="text-sm font-medium text-taupe mb-3">Your Progress</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-semibold text-chestnut">
                {progress.currentLevel}
              </div>
              <div className="text-xs text-taupe">Level</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-chestnut">
                {progress.currentXP}
              </div>
              <div className="text-xs text-taupe">Total XP</div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-chestnut">
                {progress.streak}
              </div>
              <div className="text-xs text-taupe">Streak</div>
            </div>
          </div>
        </div>

        {/* Notification time */}
        <div className="p-4 bg-silver/10 rounded-lg">
          <h2 className="text-sm font-medium text-taupe mb-3">
            Reminder Notification
          </h2>
          <p className="text-xs text-silver mb-3">
            Get reminded to plan tomorrow&apos;s tasks after completing today
          </p>
          <input
            type="time"
            value={settings.notificationTime || "20:00"}
            onChange={(e) => updateNotificationTime(e.target.value)}
            className="w-full px-4 py-2 bg-dust-grey border border-silver/30 rounded text-chestnut focus:outline-none focus:border-chestnut/50"
          />
        </div>

        {/* View Guide Again */}
        <div className="p-4 bg-silver/10 rounded-lg">
          <h2 className="text-sm font-medium text-taupe mb-3">
            Introduction Guide
          </h2>
          <p className="text-xs text-silver mb-3">
            View the walkthrough explaining Signal vs Noise tasks
          </p>
          <button
            onClick={() => {
              showOnboarding();
              router.push("/");
            }}
            className="w-full py-2 px-4 text-sm text-chestnut border border-chestnut/30 rounded hover:bg-chestnut/10 transition-colors"
          >
            View Introduction Guide
          </button>
        </div>

        {/* Danger zone */}
        <div className="p-4 bg-burnt-rose/5 border border-burnt-rose/20 rounded-lg">
          <h2 className="text-sm font-medium text-burnt-rose mb-4">
            Danger Zone
          </h2>

          {/* Clear archive */}
          {clearConfirmStep === 0 && (
            <button
              onClick={() => setClearConfirmStep(1)}
              className="w-full py-2 px-4 text-sm text-burnt-rose border border-burnt-rose/30 rounded hover:bg-burnt-rose/10 transition-colors mb-3"
            >
              Clear Archive
            </button>
          )}
          {clearConfirmStep === 1 && (
            <div className="mb-3 p-3 bg-burnt-rose/10 rounded">
              <p className="text-sm text-burnt-rose mb-3">
                This will permanently delete all archived tasks. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setClearConfirmStep(2)}
                  className="flex-1 py-2 text-sm text-dust-grey bg-burnt-rose rounded hover:bg-chestnut"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setClearConfirmStep(0)}
                  className="flex-1 py-2 text-sm text-chestnut border border-chestnut/30 rounded hover:bg-chestnut/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {clearConfirmStep === 2 && (
            <div className="mb-3 p-3 bg-burnt-rose/10 rounded">
              <p className="text-sm text-burnt-rose mb-3 font-medium">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearArchive}
                  className="flex-1 py-2 text-sm text-dust-grey bg-burnt-rose rounded hover:bg-chestnut"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => setClearConfirmStep(0)}
                  className="flex-1 py-2 text-sm text-chestnut border border-chestnut/30 rounded hover:bg-chestnut/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reset all */}
          {resetConfirmStep === 0 && (
            <button
              onClick={() => setResetConfirmStep(1)}
              className="w-full py-2 px-4 text-sm text-dust-grey bg-burnt-rose rounded hover:bg-chestnut transition-colors"
            >
              Reset All Progress
            </button>
          )}
          {resetConfirmStep === 1 && (
            <div className="p-3 bg-burnt-rose/10 rounded">
              <p className="text-sm text-burnt-rose mb-3">
                This will permanently delete ALL data: tasks, archive, XP,
                level, and streak. Continue?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setResetConfirmStep(2)}
                  className="flex-1 py-2 text-sm text-dust-grey bg-burnt-rose rounded hover:bg-chestnut"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setResetConfirmStep(0)}
                  className="flex-1 py-2 text-sm text-chestnut border border-chestnut/30 rounded hover:bg-chestnut/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {resetConfirmStep === 2 && (
            <div className="p-3 bg-burnt-rose/10 rounded">
              <p className="text-sm text-burnt-rose mb-3 font-medium">
                Are you absolutely sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleResetAll}
                  className="flex-1 py-2 text-sm text-dust-grey bg-burnt-rose rounded hover:bg-chestnut"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setResetConfirmStep(0)}
                  className="flex-1 py-2 text-sm text-chestnut border border-chestnut/30 rounded hover:bg-chestnut/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
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
