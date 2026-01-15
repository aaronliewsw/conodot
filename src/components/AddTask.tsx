"use client";

import { useState, useRef, useCallback } from "react";
import { TaskType } from "@/types";

interface AddTaskProps {
  onAdd: (title: string, type: TaskType, notes?: string) => boolean;
  canAddSignal: boolean;
  canAddNoise: boolean;
  signalReason?: string;
  noiseReason?: string;
}

export function AddTask({
  onAdd,
  canAddSignal,
  canAddNoise,
  signalReason,
  noiseReason,
}: AddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSuccess, setShowSuccess] = useState<TaskType | null>(null);
  const startX = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  // Calculate swipe progress (0 to 1)
  const swipeProgress = Math.min(Math.abs(swipeX) / SWIPE_THRESHOLD, 1);
  const isSwipingRight = swipeX > 0;
  const isSwipingLeft = swipeX < 0;
  const hasReachedThreshold = Math.abs(swipeX) >= SWIPE_THRESHOLD;

  const triggerHaptic = useCallback((pattern: number | number[]) => {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!title.trim()) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !title.trim()) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    const clampedDiff = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff));

    // Haptic feedback when crossing threshold
    if (Math.abs(clampedDiff) >= SWIPE_THRESHOLD && Math.abs(swipeX) < SWIPE_THRESHOLD) {
      triggerHaptic(15);
    }

    setSwipeX(clampedDiff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeX > SWIPE_THRESHOLD && canAddSignal) {
      submitTask("signal");
    } else if (swipeX < -SWIPE_THRESHOLD && canAddNoise) {
      submitTask("noise");
    } else {
      setSwipeX(0);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!title.trim()) return;
    // Only track if clicking on the swipe area, not the input
    if (e.target === inputRef.current) return;
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !title.trim()) return;
    const diff = e.clientX - startX.current;
    setSwipeX(Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeX > SWIPE_THRESHOLD && canAddSignal) {
      submitTask("signal");
    } else if (swipeX < -SWIPE_THRESHOLD && canAddNoise) {
      submitTask("noise");
    } else {
      setSwipeX(0);
    }
  };

  const submitTask = (type: TaskType) => {
    if (!title.trim()) return;

    const success = onAdd(title.trim(), type);
    if (success) {
      // Show success animation
      setShowSuccess(type);
      triggerHaptic([10, 50, 10]);

      setTimeout(() => {
        setTitle("");
        setSwipeX(0);
        setShowSuccess(null);
        setIsOpen(false);
      }, 400);
    } else {
      setSwipeX(0);
    }
  };

  const canAdd = canAddSignal || canAddNoise;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={!canAdd}
        className={`w-full py-4 text-center rounded-lg transition-all duration-200 ${
          canAdd
            ? "bg-chestnut/10 text-chestnut hover:bg-chestnut/20 active:scale-[0.98]"
            : "bg-silver/20 text-taupe cursor-not-allowed"
        }`}
      >
        {canAdd ? "+ Add Task" : "Daily limit reached"}
      </button>
    );
  }

  // Dynamic background based on swipe direction
  const getSwipeBackground = () => {
    if (showSuccess === "signal") return "bg-chestnut/20";
    if (showSuccess === "noise") return "bg-taupe/20";
    if (isSwipingRight && canAddSignal) {
      return `bg-chestnut/${Math.round(swipeProgress * 15)}`;
    }
    if (isSwipingLeft && canAddNoise) {
      return `bg-taupe/${Math.round(swipeProgress * 15)}`;
    }
    return "bg-silver/10";
  };

  return (
    <div
      className={`space-y-4 p-4 rounded-lg transition-colors duration-150 ${getSwipeBackground()}`}
      style={{
        backgroundColor: showSuccess === "signal"
          ? "rgba(130, 51, 41, 0.2)"
          : showSuccess === "noise"
          ? "rgba(153, 136, 136, 0.2)"
          : isSwipingRight && canAddSignal
          ? `rgba(130, 51, 41, ${swipeProgress * 0.15})`
          : isSwipingLeft && canAddNoise
          ? `rgba(153, 136, 136, ${swipeProgress * 0.15})`
          : "rgba(191, 184, 173, 0.1)"
      }}
    >
      {/* Input with swipe area */}
      <div
        className="relative select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Swipe indicator backgrounds */}
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-end pr-3 pointer-events-none transition-all duration-150"
          style={{
            width: isSwipingLeft ? `${Math.abs(swipeX)}px` : 0,
            opacity: isSwipingLeft ? swipeProgress : 0,
          }}
        >
          <span className={`text-sm font-medium ${hasReachedThreshold && canAddNoise ? "text-taupe" : "text-silver"}`}>
            Noise
          </span>
        </div>
        <div
          className="absolute inset-y-0 right-0 flex items-center justify-start pl-3 pointer-events-none transition-all duration-150"
          style={{
            width: isSwipingRight ? `${swipeX}px` : 0,
            opacity: isSwipingRight ? swipeProgress : 0,
          }}
        >
          <span className={`text-sm font-medium ${hasReachedThreshold && canAddSignal ? "text-chestnut" : "text-silver"}`}>
            Signal
          </span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className={`w-full px-4 py-3 bg-dust-grey border rounded-lg text-chestnut placeholder:text-taupe/50 focus:outline-none transition-all duration-150 ${
            hasReachedThreshold && isSwipingRight && canAddSignal
              ? "border-chestnut"
              : hasReachedThreshold && isSwipingLeft && canAddNoise
              ? "border-taupe"
              : "border-silver/30 focus:border-chestnut/50"
          }`}
          style={{
            transform: `translateX(${swipeX}px)`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          autoFocus
        />
      </div>

      {/* Instructions */}
      <p className="text-xs text-taupe text-center">
        {title.trim()
          ? "Swipe left → Noise | Swipe right → Signal"
          : "Type your task first"
        }
      </p>

      {/* Limit indicators */}
      <div className="flex justify-between text-xs">
        <span className={canAddNoise ? "text-taupe" : "text-silver"}>
          {canAddNoise ? "← Noise" : noiseReason}
        </span>
        <span className={canAddSignal ? "text-chestnut" : "text-silver"}>
          {canAddSignal ? "Signal →" : signalReason}
        </span>
      </div>

      {/* Manual buttons as fallback */}
      {title.trim() && (
        <div className="flex gap-2">
          <button
            onClick={() => submitTask("noise")}
            disabled={!canAddNoise}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              canAddNoise
                ? "bg-taupe/20 text-taupe hover:bg-taupe/30 active:scale-[0.98]"
                : "bg-silver/10 text-silver cursor-not-allowed"
            }`}
          >
            Noise
          </button>
          <button
            onClick={() => submitTask("signal")}
            disabled={!canAddSignal}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              canAddSignal
                ? "bg-chestnut/20 text-chestnut hover:bg-chestnut/30 active:scale-[0.98]"
                : "bg-silver/10 text-silver cursor-not-allowed"
            }`}
          >
            Signal
          </button>
        </div>
      )}

      {/* Cancel */}
      <button
        onClick={() => {
          setIsOpen(false);
          setTitle("");
          setSwipeX(0);
        }}
        className="w-full py-2 text-sm text-taupe hover:text-chestnut transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
