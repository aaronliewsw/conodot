"use client";

interface LogoProps {
  onClick?: () => void;
}

export function Logo({ onClick }: LogoProps) {
  return (
    <button
      onClick={onClick}
      className="text-2xl font-semibold tracking-tight text-chestnut hover:text-burnt-rose transition-colors duration-200"
    >
      conodot
    </button>
  );
}
