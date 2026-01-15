"use client";

import { useState, useRef } from "react";
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
  const startX = useRef(0);

  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!title.trim()) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !title.trim()) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setSwipeX(Math.max(-150, Math.min(150, diff)));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeX > SWIPE_THRESHOLD && canAddSignal) {
      // Swipe right = Signal
      submitTask("signal");
    } else if (swipeX < -SWIPE_THRESHOLD && canAddNoise) {
      // Swipe left = Noise
      submitTask("noise");
    }

    setSwipeX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!title.trim()) return;
    startX.current = e.clientX;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !title.trim()) return;
    const diff = e.clientX - startX.current;
    setSwipeX(Math.max(-150, Math.min(150, diff)));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (swipeX > SWIPE_THRESHOLD && canAddSignal) {
      submitTask("signal");
    } else if (swipeX < -SWIPE_THRESHOLD && canAddNoise) {
      submitTask("noise");
    }

    setSwipeX(0);
  };

  const submitTask = (type: TaskType) => {
    if (!title.trim()) return;

    const success = onAdd(title.trim(), type);
    if (success) {
      setTitle("");
      setIsOpen(false);
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
            ? "bg-chestnut/10 text-chestnut hover:bg-chestnut/20"
            : "bg-silver/20 text-taupe cursor-not-allowed"
        }`}
      >
        {canAdd ? "+ Add Task" : "Daily limit reached"}
      </button>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-silver/10 rounded-lg">
      {/* Input with swipe area */}
      <div
        className="relative select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Swipe indicators */}
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 text-sm font-medium transition-opacity ${
            swipeX < -20 ? "opacity-100" : "opacity-0"
          } ${canAddNoise ? "text-taupe" : "text-silver"}`}
        >
          ← Noise
        </div>
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 text-sm font-medium transition-opacity ${
            swipeX > 20 ? "opacity-100" : "opacity-0"
          } ${canAddSignal ? "text-chestnut" : "text-silver"}`}
        >
          Signal →
        </div>

        {/* Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-4 py-3 bg-dust-grey border border-silver/30 rounded-lg text-chestnut placeholder:text-taupe/50 focus:outline-none focus:border-chestnut/50 transition-transform"
          style={{
            transform: `translateX(${swipeX}px)`,
          }}
          autoFocus
        />
      </div>

      {/* Instructions */}
      <p className="text-xs text-taupe text-center">
        Type your task, then swipe right for Signal or left for Noise
      </p>

      {/* Limit indicators */}
      <div className="flex justify-between text-xs">
        <span className={canAddNoise ? "text-taupe" : "text-silver"}>
          {canAddNoise ? "Noise available" : noiseReason}
        </span>
        <span className={canAddSignal ? "text-chestnut" : "text-silver"}>
          {canAddSignal ? "Signal available" : signalReason}
        </span>
      </div>

      {/* Manual buttons as fallback */}
      {title.trim() && (
        <div className="flex gap-2">
          <button
            onClick={() => submitTask("noise")}
            disabled={!canAddNoise}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              canAddNoise
                ? "bg-taupe/20 text-taupe hover:bg-taupe/30"
                : "bg-silver/10 text-silver cursor-not-allowed"
            }`}
          >
            Noise
          </button>
          <button
            onClick={() => submitTask("signal")}
            disabled={!canAddSignal}
            className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
              canAddSignal
                ? "bg-chestnut/20 text-chestnut hover:bg-chestnut/30"
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
        }}
        className="w-full py-2 text-sm text-taupe hover:text-chestnut transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
