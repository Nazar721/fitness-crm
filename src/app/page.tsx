"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { XPBar } from "@/components/gamification/XPBar";
import { EditableWeeklyGoal } from "@/components/gamification/EditableWeeklyGoal";
import { MonthlyCalendar } from "@/components/gamification/MonthlyCalendar";
import { PersonalRecords } from "@/components/records/PersonalRecords";
import { motion } from "framer-motion";
import { 
  Flame, 
  Dumbbell, 
  TrendingUp, 
  Target,
  Trophy,
  Zap,
  ChevronRight,
  BarChart3,
  Clock,
  Sparkles,
  Snowflake,
  Dumbbell as DumbbellIcon2,
  Timer as TimerIcon,
  Repeat,
} from "lucide-react";
import { formatWeight, formatDuration, getLevelFromXP, getLevelLabel } from "@/lib/utils";
import { getProfile, getProgress, getRecentWorkouts, getWorkoutCountThisWeek, getTotalStats } from "@/lib/storage";

const badgeDefinitions = [
  { 
    id: "first_1000", 
    icon: "🏋️", 
    name: "Першa тисяча", 
    target: 1000, 
    description: "Набери 1000 XP",
    hint: "Заробляй XP за тренування, місії та досягнення",
    color: "from-yellow-400/20 to-orange-500/20"
  },
  { 
    id: "iron_monkey", 
    icon: "🦍", 
    name: "Залізна мавпа", 
    target: 20, 
    description: "Зроби 20 тренувань",
    hint: "Кожне тренування рахується",
    color: "from-gray-400/20 to-gray-500/20"
  },
  { 
    id: "early_bird", 
    icon: "🌅", 
    name: "Ранкова пташка", 
    target: 10, 
    description: "10 тренувань до 8:00",
    hint: "Тренуйся рано вранці",
    color: "from-orange-300/20 to-yellow-400/20"
  },
  { 
    id: "sniper", 
    icon: "🎯", 
    name: "Снайпер", 
    target: 30, 
    description: "30 днів streak",
    hint: "Не пропускай жодного дня",
    color: "from-red-400/20 to-pink-500/20"
  },
  { 
    id: "comeback", 
    icon: "🔄", 
    name: "Комбек", 
    target: 1, 
    description: "Повернення після 7+ днів",
    hint: "Навіть після довгої перерви",
    color: "from-blue-400/20 to-cyan-500/20"
  },
  { 
    id: "balancer", 
    icon: "💪", 
    name: "Балансир", 
    target: 7, 
    description: "7 груп м'язів за тиждень",
    hint: "Тренуй всі м'язи рівномірно",
    color: "from-purple-400/20 to-violet-500/20"
  },
  { 
    id: "centurion", 
    icon: "💯", 
    name: "Центуріон", 
    target: 100, 
    description: "100 тренувань",
    hint: "Легенда серед тренувань",
    color: "from-lime/20 to-green-500/20"
  },
  { 
    id: "beast_mode", 
    icon: "🔥", 
    name: "Режим звіра", 
    target: 5, 
    description: "5 тренувань за тиждень",
    hint: "Перевиконуй тижневу ціль",
    color: "from-red-500/20 to-orange-500/20"
  },
  { 
    id: "record_breaker", 
    icon: "⚡", 
    name: "Рекордсмен", 
    target: 10, 
    description: "10 особистих рекордів",
    hint: "Постійно виходь на новий рівень",
    color: "from-cyan-400/20 to-blue-500/20"
  },
];

const defaultMissions = [
  { 
    id: 1, 
    title: "Виконай 5 підходів на грудях", 
    description: "Зроби 5 підходів будь-якої вправи на груди",
    xp: 25, 
    completed: false,
    icon: DumbbellIcon2,
    progress: 0,
    target: 5,
    category: "workout" as const,
  },
  { 
    id: 2, 
    title: "Зроби 100 віджимань", 
    description: "Набери сумарно 100 віджимань за день",
    xp: 30, 
    completed: false,
    icon: Repeat,
    progress: 0,
    target: 100,
    category: "workout" as const,
  },
  { 
    id: 3, 
    title: "Протягни 10 хвилин", 
    description: "Протримайся в планці або статиці 10 хвилин",
    xp: 20, 
    completed: false,
    icon: TimerIcon,
    progress: 0,
    target: 10,
    category: "streak" as const,
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
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [totalStats, setTotalStats] = useState({ totalWorkouts: 0, totalVolume: 0 });
  const [weeklyGoal, setWeeklyGoal] = useState(4);

  useEffect(() => {
    const p = getProfile();
    const pr = getProgress();
    const rw = getRecentWorkouts(3);
    const ww = getWorkoutCountThisWeek();
    const ts = getTotalStats();

    setProfile(p);
    setProgress(pr);
    setRecentWorkouts(rw);
    setWorkoutsThisWeek(ww);
    setTotalStats(ts);
    setWeeklyGoal(pr?.weeklyGoal || 4);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="pt-6 lg:pt-8 pb-8">
        <div className="space-y-5 lg:space-y-6">
          <div className="h-12 bg-white/[0.03] rounded-xl w-64 mx-auto lg:mx-0 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white/[0.03] rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userName = profile?.name || "Користувач";

  return (
    <motion.div 
      className="pt-6 lg:pt-8 pb-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="text-center lg:text-left mb-8 lg:mb-10">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
          Привіт, {userName} <span className="inline-block animate-float">👋</span>
        </h1>
        <p className="text-gray-400 text-sm lg:text-base mt-2">
          Готовий до тренування?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5 lg:space-y-6">
          
          {/* Stats Grid */}
          <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon={Flame}
              label="Streak"
              value={`${progress?.streak || 0} днів`}
              accent="orange"
            />
            <StatCard
              icon={TrendingUp}
              label="Рівень сили"
              value={progress?.level || "beginner"}
              accent="purple"
            />
            <StatCard
              icon={Dumbbell}
              label="Тренування"
              value={`${workoutsThisWeek}/${weeklyGoal}`}
              accent="lime"
            />
            <StatCard
              icon={Target}
              label="Всього"
              value={`${totalStats.totalWorkouts}`}
              accent="electric"
            />
          </motion.div>

          {/* Monthly Calendar with Streak */}
          <motion.div variants={item}>
            <MonthlyCalendar
              weeklyGoal={weeklyGoal}
              freezes={progress?.streakFreezes || 0}
            />
          </motion.div>

          {/* XP Bar */}
          <motion.div variants={item}>
            <XPBar xp={progress?.xp || 0} />
          </motion.div>

          {/* Editable Weekly Goal */}
          <motion.div variants={item}>
            <EditableWeeklyGoal
              current={weeklyGoal}
              completed={workoutsThisWeek}
              onGoalChange={setWeeklyGoal}
            />
          </motion.div>

          {/* Personal Records */}
          <motion.div variants={item}>
            <PersonalRecords />
          </motion.div>

          {/* Recent Workouts */}
          <motion.div variants={item}>
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-white flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-lime/10">
                    <Dumbbell className="w-5 h-5 text-lime" />
                  </div>
                  Останні тренування
                </h3>
                <a href="/workouts" className="text-xs text-gray-400 flex items-center gap-1 hover:text-lime transition-colors">
                  Всі <ChevronRight className="w-3 h-3" />
                </a>
              </div>
              {recentWorkouts.length === 0 ? (
                <div className="text-center py-8">
                  <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Ще немає тренувань</p>
                  <p className="text-gray-500 text-xs mt-1">Почни перше тренування!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentWorkouts.map((workout, i) => (
                    <motion.div
                      key={workout.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer group border border-white/[0.03] hover:border-white/[0.06]"
                    >
                      <div>
                        <p className="font-medium text-white text-sm group-hover:text-lime transition-colors">{workout.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(workout.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{formatDuration(workout.duration)}</p>
                        <p className="text-xs text-gray-500">{formatWeight(workout.totalVolume || 0)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN - Sidebar */}
        <div className="lg:col-span-1 space-y-5 lg:space-y-6">
          
          {/* Badges */}
          <motion.div variants={item}>
            <Card>
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-lime/10">
                  <Trophy className="w-5 h-5 text-lime" />
                </div>
                Досягнення
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {badgeDefinitions.map((badge, i) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, type: "spring" as const, stiffness: 300 }}
                    className="group cursor-pointer"
                    title={badge.description}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${badge.color} border-2 border-white/[0.06] group-hover:border-lime/30 transition-all duration-300 relative`}>
                        <span className="text-xl sm:text-2xl grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{badge.icon}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-300 text-center leading-tight font-medium">{badge.name}</p>
                      <p className="text-[9px] text-gray-600 text-center">{badge.hint}</p>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-0.5">
                        <div 
                          className="h-full bg-gradient-to-r from-lime/60 to-lime rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min((0 / badge.target) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[9px] text-gray-500">0/{badge.target}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Daily Missions */}
          <motion.div variants={item}>
            <Card>
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-electric/10">
                  <Zap className="w-5 h-5 text-electric" />
                </div>
                Добові місії
                <span className="ml-auto text-[10px] text-gray-500 font-normal">
                  {defaultMissions.filter(m => m.completed).length}/{defaultMissions.length}
                </span>
              </h3>
              <div className="space-y-2">
                {defaultMissions.map((mission) => {
                  const MissionIcon = mission.icon;
                  const progress = mission.progress / mission.target;
                  const isComplete = mission.completed;
                  
                  return (
                    <motion.div
                      key={mission.id}
                      whileHover={{ scale: 1.01 }}
                      className={`relative overflow-hidden p-3 rounded-xl border transition-all ${
                        isComplete 
                          ? 'bg-lime/5 border-lime/20' 
                          : 'bg-white/[0.03] border-white/[0.04] hover:bg-white/[0.05]'
                      }`}
                    >
                      {/* Progress bar background */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-electric/10 to-transparent transition-all duration-500"
                        style={{ width: `${progress * 100}%` }}
                      />
                      
                      <div className="relative flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          isComplete ? 'bg-lime/20' : 'bg-electric/10'
                        }`}>
                          <MissionIcon className={`w-4 h-4 ${
                            isComplete ? 'text-lime' : 'text-electric'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            isComplete ? 'text-lime' : 'text-white'
                          }`}>{mission.title}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate">{mission.description}</p>
                          <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isComplete ? 'bg-lime' : 'bg-electric'
                              }`}
                              style={{ width: `${progress * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                            isComplete 
                              ? 'text-lime bg-lime/10' 
                              : 'text-yellow-400 bg-yellow-400/10'
                          }`}>
                            +{mission.xp} XP
                          </span>
                          <span className="text-[9px] text-gray-600">
                            {mission.progress}/{mission.target}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={item} className="hidden lg:block">
            <Card variant="glass">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/5">
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                Швидкий огляд
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-lime/10">
                      <Dumbbell className="w-3.5 h-3.5 text-lime" />
                    </div>
                    <span className="text-xs text-gray-400">Всього тренувань</span>
                  </div>
                  <span className="text-sm font-bold text-white">{totalStats.totalWorkouts}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-orange-500/10">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                    </div>
                    <span className="text-xs text-gray-400">Найкращий streak</span>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{progress?.maxStreak || 0} днів</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-yellow-400/10">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    </div>
                    <span className="text-xs text-gray-400">XP</span>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">{progress?.xp || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10">
                      <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-xs text-gray-400">Рівень</span>
                  </div>
                  <span className="text-sm font-bold text-purple-400">{getLevelLabel(progress?.level || 'beginner')}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-electric/10">
                      <Target className="w-3.5 h-3.5 text-electric" />
                    </div>
                    <span className="text-xs text-gray-400">Тиждень</span>
                  </div>
                  <span className="text-sm font-bold text-electric">{workoutsThisWeek}/{weeklyGoal}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <span className="text-xs text-gray-400">Середній час</span>
                  </div>
                  <span className="text-sm font-bold text-cyan-400">
                    {totalStats.totalWorkouts > 0 ? 
                      formatDuration(Math.round(recentWorkouts.reduce((sum, w) => sum + w.duration, 0) / Math.max(recentWorkouts.length, 1))) : 
                      '—'
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-400/10">
                      <Snowflake className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-xs text-gray-400">Заморозки</span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{progress?.streakFreezes || 0}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
