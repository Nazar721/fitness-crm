"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Flame,
  BarChart3,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Trophy,
  Zap,
  Calendar,
  Award,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { XPBar } from "@/components/gamification/XPBar";
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
} from "recharts";
import { 
  getWorkouts, 
  getTotalStats, 
  getProgress, 
  getPeriodStats, 
  getTopExercises, 
  getWorkoutHeatmap, 
  getVolumeTrend,
  getRecentPRs,
} from "@/lib/storage";
import { formatDuration, formatWeight } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

function getMuscleBalance(workouts: any[]) {
  const muscleCounts: Record<string, number> = {
    "Груди": 0,
    "Спина": 0,
    "Плечі": 0,
    "Біцепс": 0,
    "Трицепс": 0,
    "Ноги": 0,
    "Корпус": 0,
  };

  workouts.forEach((w) => {
    const name = w.name.toLowerCase();
    if (name.includes("груди") || name.includes("chest")) muscleCounts["Груди"] += 2;
    if (name.includes("спина") || name.includes("back") || name.includes("тяга")) muscleCounts["Спина"] += 2;
    if (name.includes("плечі") || name.includes("shoulders")) muscleCounts["Плечі"] += 1;
    if (name.includes("біцепс") || name.includes("biceps") || name.includes("руки")) muscleCounts["Біцепс"] += 1;
    if (name.includes("трицепс") || name.includes("triceps") || name.includes("руки")) muscleCounts["Трицепс"] += 1;
    if (name.includes("ноги") || name.includes("legs") || name.includes("присід")) muscleCounts["Ноги"] += 2;
    if (name.includes("кардіо") || name.includes("корпус") || name.includes("core")) muscleCounts["Корпус"] += 1;
  });

  const max = Math.max(...Object.values(muscleCounts), 1);
  return Object.entries(muscleCounts).map(([muscle, count]) => ({
    muscle,
    value: Math.round((count / max) * 100) || 10,
  }));
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [muscleBalance, setMuscleBalance] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalVolume: 0 });
  const [progress, setProgress] = useState<any>(null);
  const [thisWeek, setThisWeek] = useState<any>(null);
  const [lastWeek, setLastWeek] = useState<any>(null);
  const [thisMonth, setThisMonth] = useState<any>(null);
  const [lastMonth, setLastMonth] = useState<any>(null);
  const [topExercises, setTopExercises] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [volumeTrend, setVolumeTrend] = useState<any[]>([]);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);

  useEffect(() => {
    const workouts = getWorkouts();
    const totalStats = getTotalStats();
    const pr = getProgress();
    
    setMuscleBalance(getMuscleBalance(workouts));
    setStats(totalStats);
    setProgress(pr);
    setThisWeek(getPeriodStats(0, 1));
    setLastWeek(getPeriodStats(1, 1));
    setThisMonth(getPeriodStats(0, 4));
    setLastMonth(getPeriodStats(4, 4));
    setTopExercises(getTopExercises(5));
    setHeatmap(getWorkoutHeatmap(14));
    setVolumeTrend(getVolumeTrend(12));
    setRecentPRs(getRecentPRs(5));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="pt-6 lg:pt-8 pb-8 space-y-5 lg:space-y-6">
        <div className="h-12 bg-white/[0.03] rounded-xl w-48 mx-auto animate-pulse" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />
          <div className="h-28 bg-white/[0.03] rounded-2xl animate-pulse" />
        </div>
        <div className="h-72 bg-white/[0.03] rounded-2xl animate-pulse" />
      </div>
    );
  }

  const weekChange = lastWeek?.count > 0 
    ? Math.round(((thisWeek?.count - lastWeek?.count) / lastWeek?.count) * 100) 
    : thisWeek?.count > 0 ? 100 : 0;
  const monthChange = lastMonth?.count > 0 
    ? Math.round(((thisMonth?.count - lastMonth?.count) / lastMonth?.count) * 100) 
    : thisMonth?.count > 0 ? 100 : 0;
  const volumeChange = lastWeek?.volume > 0 
    ? Math.round(((thisWeek?.volume - lastWeek?.volume) / lastWeek?.volume) * 100) 
    : thisWeek?.volume > 0 ? 100 : 0;

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
          Прогрес
        </h1>
        <p className="text-gray-400 text-sm lg:text-base mt-2">
          Аналітика твоїх тренувань
        </p>
      </motion.div>

      {/* Period Comparison Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-lime/10">
              <Dumbbell className="w-3.5 h-3.5 text-lime" />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Цей тиждень</span>
          </div>
          <p className="text-2xl font-bold text-white">{thisWeek?.count || 0}</p>
          <div className="flex items-center gap-1 mt-1">
            {weekChange > 0 ? (
              <ArrowUpRight className="w-3 h-3 text-lime" />
            ) : weekChange < 0 ? (
              <ArrowDownRight className="w-3 h-3 text-red-400" />
            ) : (
              <Minus className="w-3 h-3 text-gray-500" />
            )}
            <span className={`text-[10px] font-medium ${weekChange > 0 ? 'text-lime' : weekChange < 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {weekChange > 0 ? '+' : ''}{weekChange}% vs минулий
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Streak</span>
          </div>
          <p className="text-2xl font-bold text-white">{progress?.streak || 0}</p>
          <p className="text-[10px] text-gray-500 mt-1">днів поспіль</p>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-yellow-400/10">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Об'єм тижня</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatWeight(thisWeek?.volume || 0)}</p>
          <div className="flex items-center gap-1 mt-1">
            {volumeChange > 0 ? (
              <ArrowUpRight className="w-3 h-3 text-lime" />
            ) : volumeChange < 0 ? (
              <ArrowDownRight className="w-3 h-3 text-red-400" />
            ) : (
              <Minus className="w-3 h-3 text-gray-500" />
            )}
            <span className={`text-[10px] font-medium ${volumeChange > 0 ? 'text-lime' : volumeChange < 0 ? 'text-red-400' : 'text-gray-500'}`}>
              {volumeChange > 0 ? '+' : ''}{volumeChange}%
            </span>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10">
              <Clock className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Сер. час</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {thisWeek?.avgDuration ? formatDuration(thisWeek.avgDuration) : '—'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1">за тренування</p>
        </Card>
      </motion.div>

      {/* XP Bar */}
      <motion.div variants={item}>
        <XPBar xp={progress?.xp || 0} />
      </motion.div>

      {/* Workout Heatmap */}
      <motion.div variants={item}>
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-lime/10">
              <Calendar className="w-4 h-4 text-lime" />
            </div>
            <h3 className="font-medium text-white">Активність</h3>
            <span className="text-[10px] text-gray-500 ml-auto">Останні 14 тижнів</span>
          </div>
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {Array.from({ length: 14 }).map((_, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, dayIdx) => {
                  const dayData = heatmap[weekIdx * 7 + dayIdx];
                  if (!dayData) return <div key={dayIdx} className="w-3 h-3" />;
                  const intensity = dayData.count === 0 ? 0 : Math.min(dayData.count, 3);
                  const colors = [
                    "bg-white/[0.03]",
                    "bg-lime/20",
                    "bg-lime/50",
                    "bg-lime",
                  ];
                  return (
                    <div
                      key={dayIdx}
                      className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-all hover:scale-150 cursor-pointer`}
                      title={`${dayData.date}: ${dayData.count} тренувань`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
            <span className="text-[10px] text-gray-500">Менше</span>
            {[0, 1, 2, 3].map(level => (
              <div 
                key={level} 
                className={`w-2.5 h-2.5 rounded-sm ${['bg-white/[0.03]', 'bg-lime/20', 'bg-lime/50', 'bg-lime'][level]}`}
              />
            ))}
            <span className="text-[10px] text-gray-500">Більше</span>
          </div>
        </Card>
      </motion.div>

      {/* Volume Trend + Muscle Balance side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* Volume Trend */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-electric/10">
                <TrendingUp className="w-4 h-4 text-electric" />
              </div>
              <h3 className="font-medium text-white">Тренд об'єму</h3>
            </div>
            {volumeTrend.some(v => v.volume > 0) ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrend}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#39FF14" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="week" stroke="#555" fontSize={10} />
                    <YAxis stroke="#555" fontSize={10} width={40} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a20",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value, name) => [
                        name === "volume" ? formatWeight(Number(value)) : value,
                        name === "volume" ? "Об'єм" : "Тренувань"
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#39FF14" 
                      fill="url(#volumeGradient)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="workouts" 
                      stroke="#9B59B6" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center">
                <p className="text-gray-500 text-sm">Почни тренуватись, щоб побачити тренд</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Muscle Balance Radar */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/10">
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-medium text-white">Баланс м'язів</h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={muscleBalance}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="muscle" stroke="#666" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.06)" fontSize={9} />
                  <Radar
                    name="Баланс"
                    dataKey="value"
                    stroke="#9B59B6"
                    fill="#9B59B6"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Exercises + Recent PRs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
        {/* Top Exercises */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-orange-500/10">
                <Award className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="font-medium text-white">Топ вправ</h3>
            </div>
            {topExercises.length > 0 ? (
              <div className="space-y-2">
                {topExercises.map((exercise, i) => {
                  const maxCount = topExercises[0]?.count || 1;
                  const width = (exercise.count / maxCount) * 100;
                  
                  return (
                    <div key={i} className="relative p-3 rounded-xl bg-white/[0.03] overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-gradient-to-r from-lime/10 to-transparent transition-all duration-500"
                        style={{ width: `${width}%` }}
                      />
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-500 w-5">#{i + 1}</span>
                          <div>
                            <p className="text-sm font-medium text-white">{exercise.name}</p>
                            <p className="text-[10px] text-gray-500">{formatWeight(exercise.totalVolume)} загалом</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-lime">{exercise.count}×</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Dumbbell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Ще немає даних</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recent PRs */}
        <motion.div variants={item}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-yellow-400/10">
                <Trophy className="w-4 h-4 text-yellow-400" />
              </div>
              <h3 className="font-medium text-white">Останні рекорди</h3>
            </div>
            {recentPRs.length > 0 ? (
              <div className="space-y-2">
                {recentPRs.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-all">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{pr.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-white">{pr.exercise}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(pr.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-lime">
                        {pr.unit === "seconds" 
                          ? `${Math.floor(pr.value / 60)}хв ${pr.value % 60}с`
                          : pr.value
                        }
                      </p>
                      <p className="text-[10px] text-yellow-400">Новий рекорд!</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Ще немає рекордів</p>
                <p className="text-gray-600 text-xs mt-1">Встанови перший рекорд!</p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
