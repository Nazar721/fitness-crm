"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Calendar, Pencil, Check, Minus, Plus } from "lucide-react";
import { updateWeeklyGoal } from "@/lib/storage";

interface EditableWeeklyGoalProps {
  current: number;
  completed: number;
  onGoalChange: (newGoal: number) => void;
}

export function EditableWeeklyGoal({ current, completed, onGoalChange }: EditableWeeklyGoalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(current);
  const progress = Math.round((completed / current) * 100);

  const handleSave = () => {
    const clamped = Math.max(1, Math.min(14, editValue));
    updateWeeklyGoal(clamped);
    onGoalChange(clamped);
    setIsEditing(false);
  };

  const increment = () => {
    const newVal = Math.min(14, editValue + 1);
    setEditValue(newVal);
  };

  const decrement = () => {
    const newVal = Math.max(1, editValue - 1);
    setEditValue(newVal);
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-lime/10">
            <Calendar className="w-5 h-5 text-lime" />
          </div>
          <span className="font-medium text-white">Тижнева ціль</span>
        </div>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={decrement}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-lg font-bold text-lime w-8 text-center">{editValue}</span>
            <button
              onClick={increment}
              className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditValue(current); setIsEditing(true); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-white transition-all text-xs"
          >
            <span className="font-semibold text-lime">{completed}/{current}</span>
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="h-full bg-gradient-to-r from-lime to-electric rounded-full glow-lime"
        />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {progress >= 100 
          ? "🎉 Тиждень виконано! +50 XP бонус" 
          : `Залишилось ${current - completed} тренувань`}
      </p>
    </Card>
  );
}
