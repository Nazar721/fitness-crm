"use client";

import { Flame, Snowflake } from "lucide-react";
import { motion } from "framer-motion";

interface StreakProps {
  current: number;
  max: number;
  freezes: number;
}

export function Streak({ current, max, freezes }: StreakProps) {
  return (
    <div className="bg-gradient-to-br from-[#1a1a20] to-[#141418] border border-white/[0.06] rounded-2xl p-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div
            className={`p-3 rounded-2xl ${current > 0 ? 'bg-orange-500/10 shadow-lg shadow-orange-500/20' : 'bg-white/5'}`}
            animate={current > 0 ? { 
              scale: [1, 1.1, 1],
            } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame 
              className={`w-8 h-8 ${current > 0 ? 'text-orange-500' : 'text-gray-600'}`} 
            />
          </motion.div>
          <div>
            <p className="text-3xl font-bold text-white">{current}</p>
            <p className="text-xs text-gray-400">днів поспіль</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-400/10">
            <Snowflake className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-blue-300">{freezes} заморозки</span>
          </div>
          <p className="text-[11px] text-gray-500">Рекорд: {max} днів</p>
        </div>
      </div>
      
      {current >= 7 && (
        <div className="mt-3 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-yellow-400/5">
            <span className="text-sm">⚡</span>
            <span className="text-xs text-yellow-300 font-medium">
              +{Math.floor(current / 7) * 20} XP бонус за серію
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
