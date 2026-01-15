"use client";

import { Logo } from "@/components/Logo";
import { CatDisplay } from "@/components/CatDisplay";
import { FoodItem } from "@/components/FoodItem";
import { useStore } from "@/store/useStore";
import { FOOD_TYPES, FoodType } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ShopPage() {
  const router = useRouter();
  const {
    pet,
    inventory,
    progress,
    isLoaded,
    canAffordFood,
    purchaseFood,
  } = useStore();

  const handlePurchase = (food: FoodType) => {
    purchaseFood(food);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dust-grey">
        <div className="text-taupe animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-dust-grey flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-silver/20">
        <Logo onClick={() => router.push("/")} />
        <span className="text-sm font-medium text-chestnut">
          {progress.currentXP} XP
        </span>
      </header>

      {/* Title */}
      <div className="px-6 py-4 text-center">
        <h1 className="text-xl font-medium text-chestnut">Cat Shop</h1>
        <p className="text-sm text-taupe mt-1">Buy food for {pet.name}</p>
      </div>

      {/* Cat Preview */}
      <div className="flex justify-center py-4">
        <CatDisplay mood={pet.mood} size="large" />
      </div>

      {/* Shop Items */}
      <div className="px-6 py-4 flex-1">
        <h2 className="text-sm font-medium text-taupe mb-3 uppercase tracking-wide">
          Food
        </h2>
        <div className="space-y-2">
          {FOOD_TYPES.map((food) => (
            <FoodItem
              key={food}
              food={food}
              mode="shop"
              disabled={!canAffordFood(food)}
              onAction={() => handlePurchase(food)}
            />
          ))}
        </div>
      </div>

      {/* Inventory Display */}
      <div className="px-6 py-4 bg-silver/10 mx-6 rounded-lg mb-4">
        <h2 className="text-sm font-medium text-taupe mb-2 uppercase tracking-wide">
          Your Inventory
        </h2>
        <div className="flex gap-4 text-sm text-taupe">
          <span>Kibble: x{inventory.kibble}</span>
          <span>Fish: x{inventory.fish}</span>
          <span>Steak: x{inventory.steak}</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4">
        <Link
          href="/cat"
          className="block w-full py-3 text-center font-medium text-dust-grey bg-chestnut rounded-lg hover:bg-burnt-rose transition-colors"
        >
          Back to Cat
        </Link>
      </footer>
    </main>
  );
}
