"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Snowflake, Flame, Check, X, Minus } from "lucide-react";
import { getWorkouts } from "@/lib/storage";

interface MonthlyCalendarProps {
  weeklyGoal: number;
  freezes: number;
}

interface DayStatus {
  day: number;
  date: Date;
  hasWorkout: boolean;
  isRestDay: boolean;     // Тиждень виконаний, цей день — відпочинок
  isFrozen: boolean;      // Тиждень НЕ виконаний, заморожено
  isMissed: boolean;      // Тиждень НЕ виконаний, пропущено (ламає streak)
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
}

export function MonthlyCalendar({ weeklyGoal, freezes }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);

  const workouts = getWorkouts();
  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    workouts.forEach(w => {
      dates.add(new Date(w.date).toISOString().split("T")[0]);
    });
    return dates;
  }, [workouts]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0
  const today = new Date();

  const days: DayStatus[] = useMemo(() => {
    const result: DayStatus[] = [];

    // Спочатку рахуємо скільки заморозок ми вже "витратили" в попередніх тижнях
    // (щоб правильно розподілити заморожені/пропущені дні)
    let freezesLeft = freezes;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = date.toISOString().split("T")[0];
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today && !isToday;
      const isFuture = date > today;

      let hasWorkout = workoutDates.has(dateStr);

      let isRestDay = false;
      let isFrozen = false;
      let isMissed = false;

      if (isPast && !hasWorkout) {
        // Знаходимо початок тижня (понеділок)
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Рахуємо тренування за цей тиждень
        const workoutsInWeek = workouts.filter(w => {
          const wd = new Date(w.date);
          return wd >= weekStart && wd <= weekEnd;
        }).length;

        if (workoutsInWeek >= weeklyGoal) {
          // Тиждень виконаний — це день відпочинку
          isRestDay = true;
        } else {
          // Тиждень НЕ виконаний — вирішуємо заморозка чи пропуск
          if (freezesLeft > 0) {
            isFrozen = true;
            freezesLeft--;
          } else {
            isMissed = true;
          }
        }
      }

      result.push({ day: d, date, hasWorkout, isRestDay, isFrozen, isMissed, isToday, isPast, isFuture });
    }
    return result;
  }, [year, month, daysInMonth, workoutDates, weeklyGoal, workouts, freezes]);

  const monthNames = [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ];

  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const workoutDays = days.filter(d => d.hasWorkout).length;
  const frozenDays = days.filter(d => d.isFrozen).length;
  const missedDays = days.filter(d => d.isMissed).length;

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const getDayClasses = (day: DayStatus) => {
    if (day.isFuture) return "opacity-30";
    if (day.hasWorkout) return "bg-lime/20 border-lime/40 text-lime shadow-sm shadow-lime/10";
    if (day.isFrozen) return "bg-blue-500/10 border-blue-400/30 text-blue-400";
    if (day.isRestDay) return "bg-white/[0.03] border-white/[0.06] text-gray-500";
    if (day.isToday) return "bg-white/10 border-white/20 text-white ring-2 ring-lime/30";
    if (day.isMissed) return "bg-red-500/5 border-red-400/20 text-red-400/60";
    if (day.isPast) return "bg-white/[0.03] border-white/[0.06] text-gray-600";
    return "bg-white/[0.02] border-white/[0.04] text-gray-500";
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-lime/10">
            <Calendar className="w-5 h-5 text-lime" />
          </div>
          <span className="font-medium text-white">Тренувальний календар</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white w-28 text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map(name => (
          <div key={name} className="text-center text-[10px] text-gray-500 font-medium py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => (
          <motion.button
            key={day.day}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedDay(day)}
            className={`aspect-square rounded-lg border flex items-center justify-center text-xs font-medium transition-all relative ${getDayClasses(day)}`}
          >
            {day.day}
            {day.hasWorkout && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-lime rounded-full" />
            )}
            {day.isFrozen && (
              <Snowflake className="absolute w-2.5 h-2.5 text-blue-400 -top-0.5 -right-0.5" />
            )}
            {day.isRestDay && day.isPast && (
              <Minus className="absolute w-2 h-2 text-gray-600 -top-0.5 -right-0.5" />
            )}
            {day.isMissed && (
              <X className="absolute w-2 h-2 text-red-400/60 -top-0.5 -right-0.5" />
            )}
          </motion.button>
        ))}
      </div>

      {/* Selected day detail */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {selectedDay.date.toLocaleDateString("uk-UA", { day: "numeric", month: "long" })}
                  </span>
                  {selectedDay.isToday && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime/20 text-lime font-medium">Сьогодні</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedDay.hasWorkout ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-lime/10">
                      <Check className="w-3.5 h-3.5 text-lime" />
                      <span className="text-xs text-lime font-medium">Тренування</span>
                    </div>
                  ) : selectedDay.isFrozen ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-400/10">
                      <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-xs text-blue-300 font-medium">Заморожено</span>
                    </div>
                  ) : selectedDay.isRestDay ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                      <Minus className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-400 font-medium">Відпочинок</span>
                    </div>
                  ) : selectedDay.isMissed ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-400/10">
                      <X className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs text-red-300 font-medium">Пропущено</span>
                    </div>
                  ) : selectedDay.isFuture ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">Майбутнє</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-500 font-medium">—</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats footer */}
      <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs text-gray-400">
              <span className="font-semibold text-white">{workoutDays}</span> тренувань
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Snowflake className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-gray-400">
              <span className="font-semibold text-blue-300">{freezes}</span> заморозок
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-lime" />
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-red-400/40" />
          <span className="text-[10px] text-gray-500 ml-1">Тренування / Заморожено / Відпочинок / Пропуск</span>
        </div>
      </div>
    </Card>
  );
}
