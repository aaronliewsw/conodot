"use client";

import { useState, useCallback, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { CatDisplay } from "@/components/CatDisplay";
import { FoodItem } from "@/components/FoodItem";
import { useStore } from "@/store/useStore";
import { FOOD_TYPES, FoodType, PET_CONFIG } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Format countdown time
function formatCountdown(ms: number): string {
  if (ms <= 0) return "soon";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Map moods to friendly descriptions
const MOOD_DESCRIPTIONS: Record<string, string> = {
  dead: "is not feeling well...",
  sad: "is feeling down",
  neutral: "is doing okay",
  smiling: "is happy",
  loved: "is feeling loved!",
};

export default function CatPage() {
  const router = useRouter();
  const {
    pet,
    inventory,
    isLoaded,
    remainingFeedings,
    canFeedPet,
    allTasksComplete,
    isPlanningMode,
    feedPet,
    updatePetName,
  } = useStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(pet.name);
  const [feedingFood, setFeedingFood] = useState<FoodType | null>(null);
  const [isFeeding, setIsFeeding] = useState(false);
  const [moodCountdown, setMoodCountdown] = useState<string>("");

  // Calculate and update mood decay countdown
  useEffect(() => {
    if (pet.mood === "dead") {
      setMoodCountdown("");
      return;
    }

    const updateCountdown = () => {
      const lastUpdate = new Date(pet.lastMoodUpdate).getTime();
      const nextDecay = lastUpdate + PET_CONFIG.moodDecayHours * 60 * 60 * 1000;
      const remaining = nextDecay - Date.now();
      setMoodCountdown(formatCountdown(remaining));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [pet.lastMoodUpdate, pet.mood]);

  const handleFeed = useCallback(
    (food: FoodType) => {
      if (!canFeedPet || inventory[food] <= 0 || isFeeding) return;

      setFeedingFood(food);
      setIsFeeding(true);
      feedPet(food);
    },
    [canFeedPet, inventory, isFeeding, feedPet]
  );

  const handleFeedingComplete = useCallback(() => {
    setIsFeeding(false);
    setFeedingFood(null);
  }, []);

  const handleSaveName = useCallback(() => {
    if (editName.trim()) {
      updatePetName(editName);
    } else {
      setEditName(pet.name);
    }
    setIsEditing(false);
  }, [editName, pet.name, updatePetName]);

  const handleStartEdit = useCallback(() => {
    setEditName(pet.name);
    setIsEditing(true);
  }, [pet.name]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe animate-pulse">Loading...</div>
      </div>
    );
  }

  const moodDescription = MOOD_DESCRIPTIONS[pet.mood] || "is here";

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-silver/20">
        <Logo onClick={() => router.push("/")} />
        <span className="text-xs text-taupe">
          {remainingFeedings}/{PET_CONFIG.maxFeedingsPerDay} feedings left
        </span>
      </header>

      {/* Pet Name */}
      <div className="px-6 py-2 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
              className="text-xl font-medium text-chestnut bg-transparent border-b-2 border-chestnut/30 focus:border-chestnut focus:outline-none text-center"
              autoFocus
              maxLength={20}
            />
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-2 text-xl font-medium text-chestnut hover:text-burnt-rose transition-colors"
          >
            {pet.name}
            <svg
              className="w-4 h-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Cat Display */}
      <div className="flex flex-col items-center justify-center px-6 py-4">
        <CatDisplay
          mood={pet.mood}
          isFeeding={isFeeding}
          feedingFood={feedingFood || undefined}
          size="large"
          onFeedingComplete={handleFeedingComplete}
        />
        <p className="mt-2 text-taupe text-center">
          {pet.name} {moodDescription}
        </p>
        {moodCountdown && (
          <p className="mt-1 text-xs text-silver text-center">
            Mood drops in {moodCountdown}
          </p>
        )}
      </div>

      {/* Inventory */}
      <div className="px-6 py-2">
        <h2 className="text-sm font-medium text-taupe mb-2 uppercase tracking-wide">
          Your Inventory
        </h2>
        <div className="space-y-2">
          {FOOD_TYPES.map((food) => (
            <FoodItem
              key={food}
              food={food}
              mode="inventory"
              quantity={inventory[food]}
              disabled={!canFeedPet || inventory[food] <= 0 || isFeeding}
              onAction={() => handleFeed(food)}
            />
          ))}
        </div>
        {!canFeedPet && (
          <p className="text-xs text-taupe text-center mt-2">
            No more feedings today. Come back tomorrow!
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 space-y-2">
        {(allTasksComplete || isPlanningMode) && (
          <Link
            href="/shop"
            className="block w-full py-3 text-center font-medium text-dust-grey bg-chestnut rounded-lg hover:bg-burnt-rose transition-colors"
          >
            Visit Shop
          </Link>
        )}
        <Link
          href="/"
          className="block w-full py-3 text-center font-medium text-chestnut bg-transparent border border-chestnut/30 rounded-lg hover:bg-chestnut/5 transition-colors"
        >
          Back to Today
        </Link>
      </div>
    </main>
  );
}
