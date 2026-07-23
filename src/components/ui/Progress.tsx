"use client";

import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number;
  max?: number;
  accent?: "lime" | "electric" | "gold" | "orange" | "purple";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function Progress({ 
  value, 
  max = 100, 
  accent = "lime", 
  size = "md",
  showLabel = false 
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const gradients = {
    lime: "from-lime via-lime to-electric",
    electric: "from-electric to-electric/70",
    gold: "from-yellow-400 to-yellow-400/70",
    orange: "from-orange-500 to-orange-500/70",
    purple: "from-purple-500 to-purple-500/70",
  };

  const glows = {
    lime: "shadow-[0_0_12px_rgba(57,255,20,0.4)]",
    electric: "shadow-[0_0_12px_rgba(0,212,255,0.4)]",
    gold: "shadow-[0_0_12px_rgba(255,215,0,0.4)]",
    orange: "shadow-[0_0_12px_rgba(255,107,53,0.4)]",
    purple: "shadow-[0_0_12px_rgba(155,89,182,0.4)]",
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-400">{value} / {max}</span>
          <span className="text-xs font-medium text-gray-300">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn("bg-white/[0.04] rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn(
            "h-full bg-gradient-to-r rounded-full animate-progress",
            gradients[accent],
            glows[accent]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
