"use client";

import { useState, useCallback } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to Conodot",
    subtitle: "A minimalist approach to daily execution",
    content: (
      <div className="space-y-4 text-center">
        <p className="text-taupe">
          Every day, do what matters — and finish it.
        </p>
        <p className="text-sm text-silver">
          Conodot enforces clarity, prioritisation, and daily closure.
        </p>
      </div>
    ),
  },
  {
    id: "signal",
    title: "Signal",
    subtitle: "High-impact work",
    content: (
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-chestnut/20 flex items-center justify-center">
          <span className="text-2xl text-chestnut font-bold">S</span>
        </div>
        <p className="text-taupe text-center">
          Signal tasks are your <span className="text-chestnut font-medium">meaningful, high-leverage work</span>.
        </p>
        <ul className="text-sm text-silver space-y-2 text-center">
          <li className="flex items-center justify-center gap-2">
            <span className="text-chestnut">→</span>
            <span>Work that moves the needle</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-chestnut">→</span>
            <span>Tasks requiring deep focus</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-chestnut">→</span>
            <span>Projects that create real value</span>
          </li>
        </ul>
        <p className="text-xs text-taupe text-center pt-2">
          You must have 3-4 Signal tasks each day.
        </p>
      </div>
    ),
  },
  {
    id: "noise",
    title: "Noise",
    subtitle: "Necessary maintenance",
    content: (
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-taupe/20 flex items-center justify-center">
          <span className="text-2xl text-taupe font-bold">N</span>
        </div>
        <p className="text-taupe text-center">
          Noise tasks are <span className="text-taupe font-medium">low-value but sometimes necessary</span>.
        </p>
        <ul className="text-sm text-silver space-y-2 text-center">
          <li className="flex items-center justify-center gap-2">
            <span className="text-taupe">→</span>
            <span>Admin work and errands</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-taupe">→</span>
            <span>Routine maintenance tasks</span>
          </li>
          <li className="flex items-center justify-center gap-2">
            <span className="text-taupe">→</span>
            <span>Things that must be done, but don&apos;t create value</span>
          </li>
        </ul>
        <p className="text-xs text-taupe text-center pt-2">
          Exactly 1 Noise task per day. No more.
        </p>
      </div>
    ),
  },
  {
    id: "limits",
    title: "Daily Limits",
    subtitle: "Focus on what matters",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-chestnut/10 rounded-lg text-center">
            <div className="text-3xl font-bold text-chestnut">3-4</div>
            <div className="text-sm text-taupe">Signal tasks</div>
          </div>
          <div className="p-4 bg-taupe/10 rounded-lg text-center">
            <div className="text-3xl font-bold text-taupe">1</div>
            <div className="text-sm text-taupe">Noise task</div>
          </div>
        </div>
        <div className="p-4 bg-silver/10 rounded-lg text-center">
          <div className="text-3xl font-bold text-chestnut">5</div>
          <div className="text-sm text-taupe">Maximum tasks per day</div>
        </div>
        <p className="text-sm text-silver text-center">
          These limits cannot be changed. They exist to prevent overcommitment.
        </p>
      </div>
    ),
  },
  {
    id: "howto",
    title: "How It Works",
    subtitle: "Swipe to classify",
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-silver/10 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-taupe">← Noise</span>
            <span className="text-sm text-chestnut">Signal →</span>
          </div>
          <div className="h-12 bg-dust-grey border border-silver/30 rounded-lg flex items-center justify-center text-taupe">
            Your task here
          </div>
        </div>
        <div className="flex justify-center">
          <ul className="text-sm text-silver space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-chestnut">1.</span>
              <span>Type your task</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">2.</span>
              <span>Swipe right for Signal, left for Noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">3.</span>
              <span>Complete tasks to earn XP</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">4.</span>
              <span>Finish all tasks to maintain your streak</span>
            </li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "planning",
    title: "Plan Ahead",
    subtitle: "Finish today, prepare for tomorrow",
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-chestnut/10 border border-chestnut/20 rounded-lg text-center">
          <p className="text-chestnut font-medium">Planning Mode</p>
          <p className="text-sm text-taupe mt-1">
            Activates when all tasks are complete
          </p>
        </div>
        <div className="flex justify-center">
          <ul className="text-sm text-silver space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-chestnut">1.</span>
              <span>Complete your Signal tasks for today</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">2.</span>
              <span>Your tasks move to the archive</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">3.</span>
              <span>Add tomorrow&apos;s tasks in advance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-chestnut">4.</span>
              <span>Check them off after midnight</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-taupe text-center pt-2">
          Planning mode helps you start each day with intention.
        </p>
      </div>
    ),
  },
  {
    id: "ready",
    title: "Ready to Focus",
    subtitle: "Signal tasks build your streak",
    content: (
      <div className="space-y-4 text-center">
        <div className="text-4xl">🎯</div>
        <p className="text-taupe">
          Complete all Signal tasks before midnight to build your streak.
        </p>
        <p className="text-sm text-silver">
          Unfinished Signal tasks reset your streak to zero.<br />
          Noise tasks don&apos;t affect your streak.
        </p>
      </div>
    ),
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const handleNext = () => {
    triggerHaptic(10);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      triggerHaptic([10, 50, 10]);
      onComplete();
    }
  };

  const handleBack = () => {
    triggerHaptic(5);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="px-6 py-4 flex items-center justify-center gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep
                ? "w-6 bg-chestnut"
                : index < currentStep
                ? "bg-chestnut/50"
                : "bg-silver/30"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 flex flex-col">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-chestnut mb-2">
            {step.title}
          </h1>
          <p className="text-sm text-taupe">{step.subtitle}</p>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center">
          <div className="w-full">{step.content}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 py-6 flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            className="px-6 py-3 text-taupe hover:text-chestnut transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] ${
            isLastStep
              ? "bg-chestnut text-dust-grey hover:bg-burnt-rose"
              : "bg-chestnut/10 text-chestnut hover:bg-chestnut/20"
          }`}
        >
          {isLastStep ? "Start Using Conodot" : "Continue"}
        </button>
      </div>
    </div>
  );
}
