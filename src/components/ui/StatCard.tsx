"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent?: "lime" | "electric" | "gold" | "orange" | "purple";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ icon: Icon, label, value, accent = "lime", trend }: StatCardProps) {
  const accentStyles = {
    lime: { text: "text-lime", bg: "bg-lime/10", glow: "shadow-lime/10" },
    electric: { text: "text-electric", bg: "bg-electric/10", glow: "shadow-electric/10" },
    gold: { text: "text-yellow-400", bg: "bg-yellow-400/10", glow: "shadow-yellow-400/10" },
    orange: { text: "text-orange-500", bg: "bg-orange-500/10", glow: "shadow-orange-500/10" },
    purple: { text: "text-purple-500", bg: "bg-purple-500/10", glow: "shadow-purple-500/10" },
  };

  const style = accentStyles[accent];

  return (
    <div className={cn(
      "bg-gradient-to-br from-[#1a1a20] to-[#141418] border border-white/[0.06] rounded-2xl p-4 flex flex-col",
      "shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30",
      "transition-all duration-300 hover:-translate-y-0.5"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("p-1.5 rounded-lg", style.bg)}>
          <Icon className={cn("w-4 h-4", style.text)} />
        </div>
        <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-1.5 py-0.5 rounded-md",
              trend.isPositive ? "text-lime bg-lime/10" : "text-red-400 bg-red-400/10"
            )}
          >
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>
    </div>
  );
}
