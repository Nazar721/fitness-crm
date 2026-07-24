"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { motion } from "framer-motion";
import { 
  User, 
  Settings, 
  Dumbbell, 
  Ruler, 
  AlertTriangle,
  Target,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Save,
  X,
  Trash2
} from "lucide-react";
import { getProfile, saveProfile, exportAllData, importAllData, downloadJSON, parseImportJSON, clearAllData, getProgress } from "@/lib/storage";
import { formatWeight, getFitnessLevelFromXP, getFitnessLevelLabel } from "@/lib/utils";
import { UserProfile } from "@/types";

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

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [editStrings, setEditStrings] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [autoLevel, setAutoLevel] = useState<string>("beginner");

  useEffect(() => {
    const data = getProfile();
    const progress = getProgress();
    const level = getFitnessLevelFromXP(progress.xp || 0);
    setAutoLevel(level);
    // Auto-sync fitnessLevel in profile
    if (data && data.fitnessLevel !== level) {
      const updated = { ...data, fitnessLevel: level };
      saveProfile(updated);
      setProfile(updated);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, []);

  const handleSave = () => {
    if (!profile) return;

    // Flush measurement strings into editData
    const mKeys = ["chest", "waist", "hips", "bicep", "calf", "neck"];
    const base = editData.measurements?.[0] || { ...measurements };
    let mChanged = false;
    const flushedM = { ...base };
    for (const k of mKeys) {
      const sv = editStrings[`m_${k}`];
      if (sv !== undefined) {
        const num = sv === "" ? undefined : Number(sv);
        if (num !== undefined && !isNaN(num)) {
          (flushedM as any)[k] = num;
          mChanged = true;
        }
      }
    }
    const finalEditData = mChanged
      ? { ...editData, measurements: [flushedM] }
      : editData;

    const updated = { ...profile, ...finalEditData };
    saveProfile(updated);
    setProfile(updated);
    setEditing(false);
    setEditData({});
    setEditStrings({});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportAllData();
    downloadJSON(data);
  };

  const handleClearAll = () => {
    clearAllData();
    window.location.reload();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await parseImportJSON(file);
      const result = importAllData(data);
      if (result.success) {
        const newProfile = getProfile();
        setProfile(newProfile);
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Помилка імпорту: " + (error as Error).message);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading || !profile) {
    return (
      <div className="pt-6 lg:pt-8 pb-8 space-y-5 lg:space-y-6">
        <div className="h-12 bg-white/[0.03] rounded-xl w-48 mx-auto lg:mx-0 animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white/[0.03] rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const measurements = profile.measurements?.[0] || { chest: 0, waist: 0, hips: 0, bicep: 0, calf: 0 };
  const goalProgress = profile.currentWeight && profile.goalWeight 
    ? Math.round((profile.currentWeight / profile.goalWeight) * 100) 
    : 0;

  return (
    <motion.div 
      className="pt-6 lg:pt-8 pb-8 space-y-5 lg:space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="text-center lg:text-left flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Профіль
          </h1>
          <p className="text-gray-400 text-sm lg:text-base mt-2">
            Налаштування твого профілю
          </p>
        </div>
        <button
          onClick={() => {
            if (editing) {
              handleSave();
            } else {
              const m = profile.measurements?.[0];
              const strings: Record<string, string> = {};
              if (m) {
                for (const k of ["chest", "waist", "hips", "bicep", "calf", "neck"]) {
                  strings[`m_${k}`] = String((m as any)[k] ?? "");
                }
              }
              setEditStrings(strings);
              setEditing(true);
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            editing 
              ? "bg-lime text-black hover:opacity-90" 
              : "bg-white/[0.05] text-gray-300 hover:bg-white/[0.08]"
          }`}
        >
          {editing ? (
            <>
              <Save className="w-4 h-4" />
              Зберегти
            </>
          ) : (
            <>
              <User className="w-4 h-4" />
              Редагувати
            </>
          )}
        </button>
      </motion.div>

      {/* Saved notification */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-lime/10 border border-lime/20 rounded-xl p-3 text-center"
        >
          <span className="text-sm text-lime font-medium">✓ Збережено</span>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div variants={item}>
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-electric flex items-center justify-center shadow-lg shadow-lime/20">
              <span className="text-2xl font-bold text-black">
                {(editing ? editData.name || profile.name : profile.name).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              {editing ? (
                <input
                  type="text"
                  value={editData.name ?? profile.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-xl font-bold text-white bg-white/[0.05] border border-white/[0.1] rounded-lg px-3 py-1.5 w-full focus:outline-none focus:border-lime"
                />
              ) : (
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-medium bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                  {getFitnessLevelLabel(autoLevel as any)}
                </span>
                <span className="text-[10px] font-medium bg-lime/10 text-lime px-2 py-0.5 rounded-full">
                  {profile.goal === "strength" ? "Сила" : 
                   profile.goal === "endurance" ? "Витривалість" : "Здоров'я"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Body Stats */}
      <motion.div variants={item}>
        <Card>
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-electric/10">
              <Ruler className="w-4 h-4 text-electric" />
            </div>
            Параметри тіла
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "age", label: "Вік", value: profile.age, suffix: "років" },
              { key: "height", label: "Зріст", value: profile.height, suffix: "см" },
              { key: "currentWeight", label: "Вага", value: profile.currentWeight, suffix: "кг", isWeight: true },
              { key: "goalWeight", label: "Цільова вага", value: profile.goalWeight, suffix: "кг", isWeight: true, accent: true },
            ].map(({ key, label, value, suffix, isWeight, accent }) => (
              <div key={key} className="p-3 rounded-xl bg-white/[0.02]">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</p>
                {editing ? (
                  <input
                    type="number"
                    value={(editData as any)[key] ?? value ?? ""}
                    onChange={(e) => setEditData({ ...editData, [key]: Number(e.target.value) })}
                    className={`text-lg font-bold mt-1 bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1 w-full focus:outline-none focus:border-lime ${accent ? "text-lime" : "text-white"}`}
                  />
                ) : (
                  <p className={`text-lg font-bold mt-1 ${accent ? "text-lime" : "text-white"}`}>
                    {isWeight && value ? formatWeight(value) : value || "—"} {!isWeight && value ? suffix : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
          {profile.currentWeight && profile.goalWeight && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-2">Прогрес до цілі</p>
              <Progress
                value={profile.currentWeight}
                max={profile.goalWeight}
                accent="lime"
                size="md"
                showLabel
              />
            </div>
          )}

          {/* Gender & Activity Level */}
          <div className="mt-4 pt-4 border-t border-white/[0.04] grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Стать</p>
              {editing ? (
                <div className="flex gap-1">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setEditData({ ...editData, gender: g })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        (editData.gender ?? profile.gender) === g
                          ? "bg-lime text-black"
                          : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.08]"
                      }`}
                    >
                      {g === "male" ? "Чоловік" : "Жінка"}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-semibold text-white">
                  {profile.gender === "male" ? "Чоловік" : profile.gender === "female" ? "Жінка" : "—"}
                </p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02]">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-2">Активність</p>
              {editing ? (
                <select
                  value={editData.activityLevel ?? profile.activityLevel ?? ""}
                  onChange={(e) => setEditData({ ...editData, activityLevel: e.target.value as any })}
                  className="text-sm font-semibold text-white bg-white/[0.05] border border-white/[0.1] rounded-lg px-2 py-1.5 w-full focus:outline-none focus:border-lime appearance-none"
                >
                  <option value="">—</option>
                  <option value="sedentary">Малоактивний</option>
                  <option value="light">Помірний</option>
                  <option value="moderate">Середній</option>
                  <option value="active">Активний</option>
                  <option value="very_active">Дуже активний</option>
                </select>
              ) : (
                <p className="text-sm font-semibold text-white">
                  {profile.activityLevel === "sedentary" ? "Малоактивний" :
                   profile.activityLevel === "light" ? "Помірний" :
                   profile.activityLevel === "moderate" ? "Середній" :
                   profile.activityLevel === "active" ? "Активний" :
                   profile.activityLevel === "very_active" ? "Дуже активний" : "—"}
                </p>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Body Measurements */}
      <motion.div variants={item}>
        <Card>
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime/10">
              <Ruler className="w-4 h-4 text-lime" />
            </div>
            Обміри тіла
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { key: "chest", label: "Груди" },
              { key: "waist", label: "Талія" },
              { key: "neck", label: "Шия" },
              { key: "thigh", label: "Стегно" },
              { key: "bicep", label: "Біцепс" },
              { key: "calf", label: "Литки" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02]">
                <span className="text-sm text-gray-400">{label}</span>
                {editing ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editStrings[`m_${key}`] ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d*\.?\d*$/.test(val)) {
                        setEditStrings({ ...editStrings, [`m_${key}`]: val });
                      }
                    }}
                    onBlur={() => {
                      const val = editStrings[`m_${key}`];
                      const num = val === "" || val === undefined ? undefined : Number(val);
                      const base = editData.measurements?.[0] || { ...measurements };
                      if (num !== undefined && !isNaN(num)) {
                        setEditData({ ...editData, measurements: [{ ...base, [key]: num }] });
                      }
                    }}
                    className="text-sm font-semibold text-white bg-white/[0.05] border border-white/[0.1] rounded px-2 py-1 w-20 text-right focus:outline-none focus:border-lime"
                  />
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {(measurements as any)[key] ? `${(measurements as any)[key]} см` : "—"}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Computed Stats */}
          {profile.height && profile.currentWeight && (
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Статистика</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* BMI */}
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <p className="text-[10px] text-gray-500 uppercase">ІМТ</p>
                  <p className="text-lg font-bold text-white mt-0.5">
                    {(profile.currentWeight / ((profile.height / 100) ** 2)).toFixed(1)}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {(() => {
                      const bmi = profile.currentWeight / ((profile.height / 100) ** 2);
                      if (bmi < 18.5) return "Недостатня вага";
                      if (bmi < 25) return "Норма";
                      if (bmi < 30) return "Надлишкова";
                      return "Ожиріння";
                    })()}
                  </p>
                </div>

                {/* Body Fat % — Navy Method */}
                {measurements.waist && measurements.neck && profile.gender && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">% жиру</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const waist = measurements.waist;
                        const neck = measurements.neck;
                        const h = profile.height;
                        if (profile.gender === "male") {
                          const bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450;
                          return `${Math.max(0, bf).toFixed(1)}%`;
                        } else {
                          const hips = measurements.hips || 0;
                          const bf = 495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(h)) - 450;
                          return `${Math.max(0, bf).toFixed(1)}%`;
                        }
                      })()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Navy method</p>
                  </div>
                )}

                {/* Waist-to-Height Ratio */}
                {measurements.waist && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">Талія/Зріст</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(measurements.waist / profile.height).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {(() => {
                        const whr = measurements.waist / profile.height;
                        if (whr < 0.4) return "Дуже низький";
                        if (whr < 0.5) return "Норма";
                        if (whr < 0.6) return "Підвищений";
                        return "Високий";
                      })()}
                    </p>
                  </div>
                )}

                {/* Waist-to-Hip Ratio */}
                {measurements.waist && measurements.thigh && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">Талія/Стегно</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(measurements.waist / measurements.thigh).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {(() => {
                        const ratio = measurements.waist / measurements.thigh;
                        if (ratio < 0.8) return "Норма";
                        if (ratio < 0.9) return "Підвищений";
                        return "Високий";
                      })()}
                    </p>
                  </div>
                )}

                {/* Chest-to-Waist Ratio */}
                {measurements.chest && measurements.waist && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">Груди/Талія</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(measurements.chest / measurements.waist).toFixed(2)}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {(() => {
                        const ratio = measurements.chest / measurements.waist;
                        if (ratio >= 1.3) return "Атлетична";
                        if (ratio >= 1.1) return "Норма";
                        return "Широка талія";
                      })()}
                    </p>
                  </div>
                )}

                {/* BMR — Mifflin-St Jeor */}
                {profile.age && profile.gender && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">BMR</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const w = profile.currentWeight;
                        const h = profile.height;
                        const a = profile.age;
                        if (profile.gender === "male") {
                          return Math.round(10 * w + 6.25 * h - 5 * a + 5);
                        } else {
                          return Math.round(10 * w + 6.25 * h - 5 * a - 161);
                        }
                      })()} ккал
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">обмін речовин</p>
                  </div>
                )}

                {/* TDEE */}
                {profile.age && profile.gender && profile.activityLevel && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">TDEE</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const w = profile.currentWeight;
                        const h = profile.height;
                        const a = profile.age;
                        let bmr: number;
                        if (profile.gender === "male") {
                          bmr = 10 * w + 6.25 * h - 5 * a + 5;
                        } else {
                          bmr = 10 * w + 6.25 * h - 5 * a - 161;
                        }
                        const multipliers: Record<string, number> = {
                          sedentary: 1.2,
                          light: 1.375,
                          moderate: 1.55,
                          active: 1.725,
                          very_active: 1.9,
                        };
                        return Math.round(bmr * (multipliers[profile.activityLevel] || 1.2));
                      })()} ккал
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">добова потреба</p>
                  </div>
                )}

                {/* Lean Body Mass */}
                {measurements.neck && profile.gender && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">М'язова маса</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const w = profile.currentWeight;
                        const waist = measurements.waist || 0;
                        const neck = measurements.neck;
                        const h = profile.height;
                        if (profile.gender === "male") {
                          const lbm = w * (1 - (495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(h)) - 450) / 100);
                          return `${lbm.toFixed(1)} кг`;
                        } else {
                          const hips = measurements.hips || 0;
                          const lbm = w * (1 - (495 / (1.29579 - 0.35004 * Math.log10(waist + hips - neck) + 0.22100 * Math.log10(h)) - 450) / 100);
                          return `${lbm.toFixed(1)} кг`;
                        }
                      })()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">без жиру</p>
                  </div>
                )}

                {/* Ideal Weight Estimate */}
                <div className="p-3 rounded-xl bg-white/[0.02]">
                  <p className="text-[10px] text-gray-500 uppercase">Ідеальна вага</p>
                  <p className="text-lg font-bold text-lime mt-0.5">
                    {Math.round(2.3 * ((profile.height / 2.54) - 60) + (profile.height / 2.54 - 60 > 0 ? 47 : 42))} кг
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">за Девіном</p>
                </div>

                {/* Progress to goal */}
                {profile.goalWeight && (
                  <div className="p-3 rounded-xl bg-lime/5 border border-lime/10">
                    <p className="text-[10px] text-gray-500 uppercase">До цілі</p>
                    <p className={`text-lg font-bold mt-0.5 ${profile.currentWeight <= profile.goalWeight ? "text-lime" : "text-white"}`}>
                      {Math.abs(profile.currentWeight - profile.goalWeight).toFixed(1)} кг
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {profile.currentWeight <= profile.goalWeight ? "Досягнуто!" : profile.currentWeight > profile.goalWeight ? "Скинути" : "Набрати"}
                    </p>
                  </div>
                )}

                {/* Calories to Goal */}
                {profile.goalWeight && profile.activityLevel && profile.gender && profile.age && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">Калорії для цілі</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const w = profile.currentWeight;
                        const goal = profile.goalWeight;
                        const h = profile.height;
                        const a = profile.age;
                        let bmr: number;
                        if (profile.gender === "male") {
                          bmr = 10 * w + 6.25 * h - 5 * a + 5;
                        } else {
                          bmr = 10 * w + 6.25 * h - 5 * a - 161;
                        }
                        const multipliers: Record<string, number> = {
                          sedentary: 1.2,
                          light: 1.375,
                          moderate: 1.55,
                          active: 1.725,
                          very_active: 1.9,
                        };
                        const tdee = bmr * (multipliers[profile.activityLevel] || 1.2);
                        const deficit = w > goal ? -500 : 300;
                        return `${Math.round(tdee + deficit)} ккал`;
                      })()}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {profile.currentWeight > profile.goalWeight ? "дефіцит -500" : "профіцит +300"}
                    </p>
                  </div>
                )}

                {/* Weeks to Goal */}
                {profile.goalWeight && profile.activityLevel && profile.gender && profile.age && (
                  <div className="p-3 rounded-xl bg-white/[0.02]">
                    <p className="text-[10px] text-gray-500 uppercase">Тижнів до цілі</p>
                    <p className="text-lg font-bold text-white mt-0.5">
                      {(() => {
                        const diff = Math.abs(profile.currentWeight - profile.goalWeight);
                        const weeklyChange = 0.5; // ~0.5 kg per week
                        return Math.ceil(diff / weeklyChange);
                      })()} тиж
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">~0.5 кг/тиждень</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Settings & Export/Import */}
      <motion.div variants={item}>
        <Card>
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/5">
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
            Налаштування
          </h3>
          <div className="space-y-1">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">Експорт даних (JSON)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Upload className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-300">
                  {importing ? "Імпорт..." : "Імпорт даних (JSON)"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />

            <div className="pt-3 mt-3 border-t border-white/[0.04]">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Видалити всі дані</span>
                </div>
                <ChevronRight className="w-4 h-4 text-red-400/50" />
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1a1a20] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-red-500/10">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Видалити всі дані?</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Це незворотно видалить всі тренування, прогрес, профіль та налаштування. Рекомендуємо спочатку зробити експорт даних.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] text-gray-300 font-medium hover:bg-white/[0.08] transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
              >
                Видалити
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
