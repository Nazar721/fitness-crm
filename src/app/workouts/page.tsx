"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import {
  Plus,
  Clock,
  Dumbbell,
  TrendingUp,
  Calendar,
  ChevronRight,
  BookOpen,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkouts } from "@/lib/storage";
import { formatWeight, formatDuration } from "@/lib/utils";

const workoutTemplates = [
  { id: 1, name: "Full Body 3x/тиждень", level: "Початківець", frequency: 3, route: "/workouts/new?template=fullbody3" },
  { id: 2, name: "Upper/Lower Split 4x", level: "Середній", frequency: 4, route: "/workouts/new?template=upperlower4" },
  { id: 3, name: "Push/Pull/Legs (PPL) 6x", level: "Просунутий", frequency: 6, route: "/workouts/new?template=ppl6" },
  { id: 4, name: "StrongLifts 5x5", level: "Сила", frequency: 3, route: "/workouts/new?template=stronglifts" },
];

const weeklyTemplates = [
  {
    id: "upper_core_lower",
    name: "Верх / Кор / Низ",
    description: "3-денний спліт: верх тіла, корпус, ноги",
    days: [
      { name: "День 1 — Верх", exercises: ["Жим лежачи", "Тяга верхнього блоку", "Розведення гантелей", "Біцепс-кренки", "Розгинання на трицепс"] },
      { name: "День 2 — Корпус", exercises: ["Планка", "Скручування", "Вис з прямими ногами", "Бічна планка", "Згинання на прес"] },
      { name: "День 3 — Низ", exercises: ["Присідання зі штангою", "Румунська тяга", "Випади", "Розгинання ніг", "Підйом на носки"] },
    ],
  },
  {
    id: "full_body_3x",
    name: "Full Body 3x",
    description: "Повне тіло 3 рази на тиждень",
    days: [
      { name: "День 1", exercises: ["Присідання", "Жим лежачи", "Тяга штанги", "Планка", "Біцепс-кренки"] },
      { name: "День 2", exercises: ["Станова тяга", "Віджимання", "Розведення гантелей", "Згинання ніг", "Прес"] },
      { name: "День 3", exercises: ["Жим стоячи", "Підтягування", "Випади", "Розгинання на трицепс", "Планка"] },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  useEffect(() => {
    const data = getWorkouts();
    setWorkouts(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="pt-6 lg:pt-8 pb-8 space-y-5 lg:space-y-6">
        <div className="h-12 bg-white/[0.03] rounded-xl w-48 mx-auto lg:mx-0 animate-pulse" />
        <div className="h-14 bg-white/[0.03] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <motion.div 
      className="pt-6 lg:pt-8 pb-8 space-y-5 lg:space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="text-center lg:text-left">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Тренування
        </h1>
        <p className="text-gray-400 text-sm lg:text-base mt-2">
          Твої тренування та програми
        </p>
      </motion.div>

      {/* Quick Start Button */}
      <motion.div variants={item}>
        <Link href="/workouts/new">
          <button className="w-full bg-gradient-to-r from-lime to-electric text-black font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-all hover:shadow-lg hover:shadow-lime/20 active:scale-[0.98]">
            <Plus className="w-6 h-6" strokeWidth={2.5} />
            <span>Почати тренування</span>
          </button>
        </Link>
      </motion.div>

      {/* Exercise Database Link */}
      <motion.div variants={item}>
        <Link href="/exercises">
          <Card hover className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-electric/10">
                <BookOpen className="w-5 h-5 text-electric" />
              </div>
              <div>
                <p className="font-medium text-white">База вправ</p>
                <p className="text-xs text-gray-500">120+ вправ з метаданими</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Card>
        </Link>
      </motion.div>

      {/* Workout Templates */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-lime/10">
            <Dumbbell className="w-4 h-4 text-lime" />
          </div>
          Готові програми
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {workoutTemplates.map((template) => (
            <Link key={template.id} href={template.route}>
              <Card hover className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-white">{template.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {template.level} • {template.frequency}x/тиждень
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Weekly Templates */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-electric/10">
            <Zap className="w-4 h-4 text-electric" />
          </div>
          Шаблони на тиждень
        </h2>
        <div className="space-y-2">
          {weeklyTemplates.map((template) => (
            <Card key={template.id}>
              <div
                className="cursor-pointer"
                onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${expandedTemplate === template.id ? "rotate-90" : ""}`} />
                </div>
              </div>
              {expandedTemplate === template.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 pt-3 border-t border-white/[0.04] space-y-2"
                >
                  {template.days.map((day, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/[0.02]">
                      <p className="text-xs font-medium text-lime mb-1">{day.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {day.exercises.map((ex, j) => (
                          <span key={j} className="text-[10px] bg-white/[0.05] text-gray-400 px-1.5 py-0.5 rounded">
                            {ex}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Link href="/workouts/new">
                    <button className="w-full mt-2 py-2 rounded-lg bg-lime/10 text-lime text-xs font-medium hover:bg-lime/20 transition-colors">
                      Використати шаблон
                    </button>
                  </Link>
                </motion.div>
              )}
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Workout History */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <div className="p-2 rounded-xl bg-electric/10">
            <Calendar className="w-4 h-4 text-electric" />
          </div>
          Історія тренувань
        </h2>
        {workouts.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Ще немає тренувань</p>
              <p className="text-gray-500 text-xs mt-1">Почни своє перше тренування!</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {workouts.map((workout) => (
              <Card key={workout.id} hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{workout.name}</h3>
                      {workout.isNewRecord && (
                        <span className="text-[10px] font-semibold bg-yellow-400/10 text-yellow-400 px-2 py-0.5 rounded-full">
                          Рекорд
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(workout.date).toLocaleDateString("uk-UA", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-600 mt-1" />
                </div>
                
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-400">{workout.duration} хв</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                    <span className="text-xs text-gray-400">{formatWeight(workout.totalVolume || 0)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
