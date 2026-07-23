"use client";

import { getLevelFromXP, getLevelLabel } from "@/lib/utils";
import { Progress } from "@/components/ui/Progress";

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const { level, nextLevelXP, progress } = getLevelFromXP(xp);
  
  return (
    <div className="bg-gradient-to-br from-[#1a1a20] to-[#141418] border border-white/[0.06] rounded-2xl p-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-float">{getLevelEmoji(level)}</span>
          <div>
            <p className="text-sm font-semibold text-white">{getLevelLabel(level)}</p>
            <p className="text-xs text-gray-400">{xp} XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-gray-500 uppercase tracking-wider">Наступний рівень</p>
          <p className="text-sm font-bold text-lime">{nextLevelXP} XP</p>
        </div>
      </div>
      <Progress value={progress} accent="lime" size="md" />
    </div>
  );
}

function getNextLevelThreshold(level: string): number {
  const thresholds: Record<string, number> = {
    beginner: 0,
    athlete: 500,
    warrior: 2000,
    beast: 5000,
    elite: 10000,
    legend: 20000,
    mythic: 50000,
  };
  return thresholds[level] || 0;
}

function getLevelEmoji(level: string): string {
  const emojis: Record<string, string> = {
    beginner: "🥉",
    athlete: "🥈",
    warrior: "🥇",
    beast: "🔥",
    elite: "💎",
    legend: "👑",
    mythic: "🌟",
  };
  return emojis[level] || "💪";
}
