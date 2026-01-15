"use client";

import { FoodType, FOOD_CONFIG } from "@/types";
import Image from "next/image";

interface FoodItemProps {
  food: FoodType;
  mode: "shop" | "inventory";
  quantity?: number;
  disabled?: boolean;
  onAction: () => void;
}

export function FoodItem({
  food,
  mode,
  quantity = 0,
  disabled = false,
  onAction,
}: FoodItemProps) {
  const config = FOOD_CONFIG[food];
  const isShop = mode === "shop";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        disabled
          ? "border-silver/20 opacity-50"
          : "border-silver/30 hover:border-chestnut/30 hover:bg-silver/5"
      }`}
    >
      {/* Food Icon */}
      <div className="w-10 h-10 flex-shrink-0">
        <Image
          src={`/cat/foods/food-${food}.svg`}
          alt={config.name}
          width={40}
          height={40}
        />
      </div>

      {/* Food Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-chestnut">{config.name}</p>
        <p className="text-xs text-taupe">
          {isShop ? (
            <>+{config.moodBoost} mood</>
          ) : (
            <>x{quantity} in stock</>
          )}
        </p>
      </div>

      {/* Action Button */}
      <button
        onClick={onAction}
        disabled={disabled}
        className={`min-w-[90px] px-4 py-2 text-sm font-medium rounded-lg transition-all ${
          disabled
            ? "bg-silver/20 text-taupe cursor-not-allowed"
            : "bg-chestnut text-dust-grey hover:bg-burnt-rose active:scale-95"
        }`}
      >
        {isShop ? (
          <span>{config.xpCost} XP</span>
        ) : (
          <span>Feed</span>
        )}
      </button>
    </div>
  );
}
