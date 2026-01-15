"use client";

import { useState, useEffect, useRef } from "react";
import { MoodState, FoodType } from "@/types";
import Image from "next/image";

interface CatDisplayProps {
  mood: MoodState;
  isFeeding?: boolean;
  feedingFood?: FoodType;
  size?: "small" | "large";
  onFeedingComplete?: () => void;
}

export function CatDisplay({
  mood,
  isFeeding = false,
  feedingFood,
  size = "large",
  onFeedingComplete,
}: CatDisplayProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationMood, setAnimationMood] = useState<MoodState | null>(null);
  const [animationFood, setAnimationFood] = useState<FoodType | null>(null);
  const animationStartedRef = useRef(false);

  const dimensions = size === "large" ? { width: 200, height: 200 } : { width: 100, height: 100 };

  // Handle feeding animation
  useEffect(() => {
    if (isFeeding && feedingFood && !animationStartedRef.current) {
      // Capture the current mood and food at animation start
      animationStartedRef.current = true;
      setAnimationMood(mood);
      setAnimationFood(feedingFood);
      setIsAnimating(true);
      setCurrentFrame(1);

      // Animate through 3 frames (500ms each = 1.5s total)
      const timeout1 = setTimeout(() => setCurrentFrame(2), 500);
      const timeout2 = setTimeout(() => setCurrentFrame(3), 1000);
      const timeout3 = setTimeout(() => {
        setCurrentFrame(0);
        setIsAnimating(false);
        setAnimationMood(null);
        setAnimationFood(null);
        animationStartedRef.current = false;
        onFeedingComplete?.();
      }, 1500);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);
      };
    }
  }, [isFeeding, feedingFood, mood, onFeedingComplete]);

  // Reset ref when isFeeding becomes false
  useEffect(() => {
    if (!isFeeding) {
      animationStartedRef.current = false;
    }
  }, [isFeeding]);

  // Get the appropriate image path
  const getImagePath = () => {
    if (isAnimating && animationMood && animationFood && currentFrame > 0) {
      // Show animation frame using captured mood/food
      return `/cat/frames/cat-${animationMood}-${animationFood}-frame-${currentFrame}.svg`;
    }
    // Show static mood
    return `/cat/moods/cat-${mood}.svg`;
  };

  const imagePath = getImagePath();

  return (
    <div className="relative flex items-center justify-center">
      <Image
        key={imagePath}
        src={imagePath}
        alt={`Cat feeling ${mood}`}
        width={dimensions.width}
        height={dimensions.height}
        className="transition-transform duration-200"
        style={{
          transform: isAnimating ? "scale(1.05)" : "scale(1)",
        }}
        priority
        unoptimized
      />
    </div>
  );
}
