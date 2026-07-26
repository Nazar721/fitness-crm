"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Plus, 
  Check, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Award,
  BarChart3
} from "lucide-react";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { BodyRecordExercise } from "@/types";
import { getBodyRecords, updateBodyRecord, getBodyRecordHistory } from "@/lib/storage";
import { 
  getBodyRecordLabel, 
  getBodyRecordUnit, 
  formatBodyRecordValue 
} from "@/lib/utils";

const RECORD_EXERCISES: { id: BodyRecordExercise; icon: string; category: string }[] = [
  { id: "pull_ups", icon: "💪", category: "Сила" },
  { id: "push_ups", icon: "🫸", category: "Сила" },
  { id: "dips", icon: "🫷", category: "Сила" },
  { id: "squats", icon: "🦵", category: "Сила" },
  { id: "sit_ups", icon: "🎯", category: "Корпус" },
  { id: "hanging_leg_raises", icon: "🦿", category: "Корпус" },
  { id: "hanging_crunches", icon: "🦾", category: "Корпус" },
  { id: "burpees", icon: "🔥", category: "Кардіо" },
  { id: "plank", icon: "🧘", category: "Витривалість" },
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

export default function RecordsPage() {
  const [records, setRecords] = useState(() => getBodyRecords());
  const [editingId, setEditingId] = useState<BodyRecordExercise | null>(null);
  const [editValue, setEditValue] = useState("");
  const [histories, setHistories] = useState<Record<string, { name: string; value: number }[]>>({});

  useEffect(() => {
    const h: Record<string, { name: string; value: number }[]> = {};
    RECORD_EXERCISES.forEach(ex => {
      const history = getBodyRecordHistory(ex.id);
      h[ex.id] = history.map(entry => ({
        name: new Date(entry.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }),
        value: entry.value,
      }));
    });
    setHistories(h);
  }, [records]);

  const handleSave = (exerciseId: BodyRecordExercise) => {
    const numValue = parseInt(editValue);
    if (isNaN(numValue) || numValue <= 0) return;

    const unit = getBodyRecordUnit(exerciseId);
    const newRecord = updateBodyRecord(exerciseId, numValue, unit);
    setRecords(prev => {
      const filtered = prev.filter(r => r.exerciseId !== exerciseId);
      filtered.push(newRecord);
      return filtered;
    });
    setEditingId(null);
    setEditValue("");
  };

  const increment = () => {
    const current = parseInt(editValue) || 0;
    setEditValue(String(current + 1));
  };

  const decrement = () => {
    const current = parseInt(editValue) || 0;
    if (current > 0) setEditValue(String(current - 1));
  };

  const getTrend = (exerciseId: BodyRecordExercise) => {
    const record = records.find(r => r.exerciseId === exerciseId);
    if (!record || !record.previousValue) return null;
    const diff = record.value - record.previousValue;
    if (diff === 0) return "same";
    return diff > 0 ? "up" : "down";
  };

  const categories = [...new Set(RECORD_EXERCISES.map(e => e.category))];

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
          Персональні рекорди
        </h1>
        <p className="text-gray-400 text-sm lg:text-base mt-2">
          Відстежуй свої найкращі результати
        </p>
      </motion.div>

      {/* Records Grid */}
      {categories.map(category => (
        <motion.div key={category} variants={item}>
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-yellow-400/10">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="font-medium text-white">{category}</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {RECORD_EXERCISES.filter(e => e.category === category).map((exercise) => {
                const record = records.find(r => r.exerciseId === exercise.id);
                const unit = getBodyRecordUnit(exercise.id);
                const isEditing = editingId === exercise.id;
                const trend = getTrend(exercise.id);
                const chartData = histories[exercise.id] || [];
                const hasChart = chartData.length > 0;

                const latestValue = chartData[chartData.length - 1]?.value || 0;
                const firstValue = chartData[0]?.value || 0;
                const change = latestValue - firstValue;
                const changePercent = firstValue > 0 ? Math.round((change / firstValue) * 100) : 0;

                return (
                  <motion.div
                    key={exercise.id}
                    layout
                    className="relative p-4 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-all overflow-hidden min-w-0"
                  >
                    {isEditing ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{exercise.icon}</span>
                          <span className="text-sm text-gray-300">
                            {getBodyRecordLabel(exercise.id)}
                          </span>
                        </div>
                        {/* Custom stepper input */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={decrement}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={editValue}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              setEditValue(val);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && handleSave(exercise.id)}
                            className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2 text-white text-center text-lg font-bold focus:outline-none focus:border-lime/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            placeholder="0"
                            autoFocus
                          />
                          <button
                            onClick={increment}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSave(exercise.id)}
                            className="flex-1 py-2 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4" />
                            Зберегти
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditValue(""); }}
                            className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="cursor-pointer group"
                        onClick={() => {
                          setEditingId(exercise.id);
                          setEditValue(record?.value?.toString() || "");
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{exercise.icon}</span>
                          <div className="flex items-center gap-2">
                            {change !== 0 && hasChart && (
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                change > 0 ? "bg-lime/10 text-lime" : "bg-red-400/10 text-red-400"
                              }`}>
                                {change > 0 ? "+" : ""}{changePercent}%
                              </span>
                            )}
                            {trend && (
                              <span className={`p-1 rounded-lg ${
                                trend === "up" ? "bg-lime/10" : trend === "down" ? "bg-red-400/10" : "bg-white/5"
                              }`}>
                                {trend === "up" ? (
                                  <TrendingUp className="w-4 h-4 text-lime" />
                                ) : trend === "down" ? (
                                  <TrendingDown className="w-4 h-4 text-red-400" />
                                ) : (
                                  <Minus className="w-4 h-4 text-gray-500" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {getBodyRecordLabel(exercise.id)}
                        </p>
                        {record ? (
                          <div>
                            <p className="text-2xl font-bold text-white">
                              {formatBodyRecordValue(record.value, unit)}
                            </p>
                            {record.previousValue && (
                              <p className="text-xs text-gray-500 mt-1">
                                було: {formatBodyRecordValue(record.previousValue, unit)}
                              </p>
                            )}
                            <p className="text-[10px] text-gray-600 mt-1">
                              {new Date(record.date).toLocaleDateString("uk-UA")}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600 group-hover:text-gray-400 transition-colors">
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Встановити рекорд</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chart */}
                    {hasChart && !isEditing && chartData.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/[0.04]">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BarChart3 className="w-3 h-3 text-gray-600" />
                          <span className="text-[9px] text-gray-600">Прогрес</span>
                        </div>
                        <div className="h-28">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                              <XAxis dataKey="name" stroke="#555" fontSize={9} tickLine={false} />
                              <YAxis stroke="#555" fontSize={9} tickLine={false} width={30} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#1a1a20",
                                  border: "1px solid rgba(255,255,255,0.08)",
                                  borderRadius: "8px",
                                  color: "#fff",
                                  fontSize: "11px",
                                }}
                                formatter={(value) => [formatBodyRecordValue(Number(value), unit), getBodyRecordLabel(exercise.id)]}
                              />
                              <Bar dataKey="value" fill="#39FF14" radius={[4, 4, 0, 0]} maxBarSize={24} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      ))}

      {/* Tips */}
      <motion.div variants={item}>
        <Card variant="glass">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-electric/10">
              <Trophy className="w-5 h-5 text-electric" />
            </div>
            <h3 className="font-medium text-white">Поради</h3>
          </div>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-lime mt-0.5">•</span>
              Оновлюй рекорди після кожного тренування
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lime mt-0.5">•</span>
              Графіки з&apos;являться після першого оновлення рекорду
            </li>
            <li className="flex items-start gap-2">
              <span className="text-lime mt-0.5">•</span>
              Став реалістичні цілі та рухайся до них
            </li>
          </ul>
        </Card>
      </motion.div>
    </motion.div>
  );
}
