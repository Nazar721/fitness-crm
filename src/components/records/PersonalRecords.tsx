"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { Trophy, Plus, Check, X, TrendingUp, TrendingDown, Minus, BarChart3, ChevronDown, ChevronUp, MinusCircle, PlusCircle } from "lucide-react";
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
import { getBodyRecords, updateBodyRecord, getBodyRecordHistory, getCustomRecordExercises, saveCustomRecordExercise, deleteCustomRecordExercise } from "@/lib/storage";
import {
  getBodyRecordLabel,
  getBodyRecordUnit,
  formatBodyRecordValue
} from "@/lib/utils";

const DEFAULT_RECORD_EXERCISES: { id: BodyRecordExercise; icon: string }[] = [
  { id: "pull_ups", icon: "💪" },
  { id: "push_ups", icon: "🫸" },
  { id: "dips", icon: "🫷" },
  { id: "plank", icon: "🧘" },
  { id: "burpees", icon: "🔥" },
  { id: "squats", icon: "🦵" },
  { id: "sit_ups", icon: "🎯" },
  { id: "hanging_leg_raises", icon: "🦿" },
  { id: "hanging_crunches", icon: "🦾" },
];

const CUSTOM_ICONS = ["🏋️", "⚡", "💥", "🔥", "💪", "🦵", "🎯", "🧘", "🏃", "🚴"];

export function PersonalRecords() {
  const [records, setRecords] = useState(() => getBodyRecords());
  const [editingId, setEditingId] = useState<BodyRecordExercise | null>(null);
  const [editValue, setEditValue] = useState("");
  const [expandedChart, setExpandedChart] = useState<BodyRecordExercise | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseUnit, setNewExerciseUnit] = useState<"reps" | "seconds">("reps");
  const [newExerciseIcon, setNewExerciseIcon] = useState("🏋️");
  const [customExercises, setCustomExercises] = useState(() => getCustomRecordExercises());

  const allRecordExercises = [...DEFAULT_RECORD_EXERCISES, ...customExercises];

  const handleAddCustomExercise = () => {
    if (!newExerciseName.trim()) return;
    const id = saveCustomRecordExercise({
      name: newExerciseName.trim(),
      unit: newExerciseUnit,
      icon: newExerciseIcon,
    });
    setCustomExercises(getCustomRecordExercises());
    setNewExerciseName("");
    setNewExerciseUnit("reps");
    setNewExerciseIcon("🏋️");
    setShowAddModal(false);
  };

  const handleDeleteCustomExercise = (id: string) => {
    deleteCustomRecordExercise(id);
    setCustomExercises(getCustomRecordExercises());
  };

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

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white flex items-center gap-2">
          <div className="p-2 rounded-xl bg-yellow-400/10">
            <Trophy className="w-5 h-5 text-yellow-400" />
          </div>
          Персональні рекорди
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {allRecordExercises.map((exercise) => {
          const record = records.find(r => r.exerciseId === exercise.id);
          const unit = getBodyRecordUnit(exercise.id);
          const isEditing = editingId === exercise.id;
          const trend = getTrend(exercise.id);
          const history = getBodyRecordHistory(exercise.id);
          const hasChart = history.length > 0;
          const isChartExpanded = expandedChart === exercise.id;

          const chartData = history.map((entry) => ({
            name: new Date(entry.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }),
            value: entry.value,
          }));

          return (
            <motion.div
              key={exercise.id}
              layout
              className="relative p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.05] transition-all overflow-hidden min-w-0"
            >
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{exercise.icon}</span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {getBodyRecordLabel(exercise.id)}
                    </span>
                  </div>
                  {/* Custom stepper input */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={decrement}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="flex-1 flex items-center justify-center">
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
                        className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-lime/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                        autoFocus
                      />
                      <span className="text-[10px] text-gray-500 ml-1 flex-shrink-0">
                        {unit === "seconds" ? "сек" : "раз"}
                      </span>
                    </div>
                    <button
                      onClick={increment}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all flex-shrink-0"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSave(exercise.id)}
                      className="flex-1 py-1.5 rounded-lg bg-lime/20 text-lime hover:bg-lime/30 transition-colors text-xs font-medium"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditValue(""); }}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3 h-3" />
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
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{exercise.icon}</span>
                    {trend && (
                      <span className={`p-0.5 rounded ${
                        trend === "up" ? "bg-lime/10" : trend === "down" ? "bg-red-400/10" : "bg-white/5"
                      }`}>
                        {trend === "up" ? (
                          <TrendingUp className="w-3 h-3 text-lime" />
                        ) : trend === "down" ? (
                          <TrendingDown className="w-3 h-3 text-red-400" />
                        ) : (
                          <Minus className="w-3 h-3 text-gray-500" />
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mb-1 truncate">
                    {getBodyRecordLabel(exercise.id)}
                  </p>
                  {record ? (
                    <div>
                      <p className="text-lg font-bold text-white">
                        {formatBodyRecordValue(record.value, unit)}
                      </p>
                      {record.previousValue && (
                        <p className="text-[9px] text-gray-500">
                          було: {formatBodyRecordValue(record.previousValue, unit)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
                      <Plus className="w-3 h-3" />
                      <span className="text-[10px]">Додати</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mini chart */}
              {hasChart && !isEditing && chartData.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/[0.04]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedChart(isChartExpanded ? null : exercise.id);
                    }}
                    className="flex items-center gap-1 w-full text-left group/btn"
                  >
                    <BarChart3 className="w-3 h-3 text-gray-600 group-hover/btn:text-electric transition-colors" />
                    <span className="text-[9px] text-gray-600 group-hover/btn:text-gray-400 transition-colors">
                      {isChartExpanded ? "Сховати" : "Графік"}
                    </span>
                    {isChartExpanded ? (
                      <ChevronUp className="w-2.5 h-2.5 text-gray-600 ml-auto" />
                    ) : (
                      <ChevronDown className="w-2.5 h-2.5 text-gray-600 ml-auto" />
                    )}
                  </button>
                  {isChartExpanded && (
                    <div className="mt-2 h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" stroke="#555" fontSize={8} tickLine={false} />
                          <YAxis stroke="#555" fontSize={8} tickLine={false} width={25} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a20",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "6px",
                              color: "#fff",
                              fontSize: "10px",
                            }}
                            formatter={(value) => [formatBodyRecordValue(Number(value), unit), getBodyRecordLabel(exercise.id)]}
                          />
                          <Bar dataKey="value" fill="#39FF14" radius={[3, 3, 0, 0]} maxBarSize={16} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        {/* Add custom exercise button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-400 transition-all min-h-[100px]"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px]">Додати вправу</span>
        </motion.button>
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#1a1a20] rounded-2xl p-4 border border-white/[0.08]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white">Нова вправа</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Назва</label>
                <input
                  type="text"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Напр. Підйом ніг"
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-lime/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Одиниця виміру</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewExerciseUnit("reps")}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      newExerciseUnit === "reps"
                        ? "bg-lime/20 text-lime border border-lime/30"
                        : "bg-white/5 text-gray-400 border border-white/[0.06]"
                    }`}
                  >
                    Рази (повторення)
                  </button>
                  <button
                    onClick={() => setNewExerciseUnit("seconds")}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                      newExerciseUnit === "seconds"
                        ? "bg-lime/20 text-lime border border-lime/30"
                        : "bg-white/5 text-gray-400 border border-white/[0.06]"
                    }`}
                  >
                    Секунди (час)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Іконка</label>
                <div className="flex flex-wrap gap-2">
                  {CUSTOM_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewExerciseIcon(icon)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        newExerciseIcon === icon
                          ? "bg-lime/20 border border-lime/30"
                          : "bg-white/5 border border-white/[0.06] hover:bg-white/10"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleAddCustomExercise}
                  disabled={!newExerciseName.trim()}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    newExerciseName.trim()
                      ? "bg-lime text-black hover:bg-lime/80"
                      : "bg-white/10 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Додати
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </Card>
  );
}
