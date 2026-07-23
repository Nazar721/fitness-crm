"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BadgeProps {
  icon: string;
  name: string;
  description?: string;
  earned?: boolean;
  progress?: number;
  target?: number;
  size?: "sm" | "md" | "lg";
}

export function Badge({
  icon,
  name,
  description,
  earned = false,
  progress,
  target,
  size = "md"
}: BadgeProps) {
  const sizes = {
    sm: "w-12 h-12 text-xl",
    md: "w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  const textSizes = {
    sm: "text-[10px]",
    md: "text-[10px] sm:text-xs",
    lg: "text-sm",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 cursor-pointer"
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center transition-all duration-300",
          sizes[size],
          earned
            ? "bg-gradient-to-br from-lime/20 to-electric/20 border-2 border-lime/40 shadow-lg shadow-lime/20"
            : "bg-white/[0.03] border-2 border-white/[0.06]"
        )}
      >
        <span className={cn(!earned && "grayscale opacity-40")}>{icon}</span>
      </div>
      <div className="text-center">
        <p className={cn(
          "font-medium leading-tight",
          textSizes[size],
          earned ? "text-white" : "text-gray-500"
        )}>
          {name}
        </p>
        {description && (
          <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
        )}
        {progress !== undefined && target !== undefined && !earned && (
          <div className="mt-1.5">
            <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden w-10 sm:w-12 mx-auto">
              <div
                className="h-full bg-gradient-to-r from-gray-500 to-gray-400 rounded-full"
                style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[9px] text-gray-600 mt-0.5">{progress}/{target}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
