"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Clock,
  Dumbbell,
  TrendingUp,
  Calendar,
  ChevronRight,
  BookOpen,
  X,
  Trash2,
  Play,
  LayoutTemplate,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkouts, getUserTemplates, saveUserTemplate, deleteUserTemplate, updateUserTemplate } from "@/lib/storage";
import { formatWeight, formatDuration, getMuscleGroupLabel } from "@/lib/utils";
import { getAllExercises, isTimedExercise, formatDurationShort, saveCustomExercise } from "@/lib/exercises";
import { UserWorkoutTemplate, MuscleGroup, Equipment, Difficulty } from "@/types";

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

interface TemplateExercise {
  exerciseId: string;
  sets: number;
  reps: number;
  weight: number;
  duration: number; // seconds for timed exercises
  unit: "reps" | "seconds";
}

const muscleGroups: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "quadriceps", "hamstrings", "glutes", "calves", "forearms", "core", "cardio"
];

const equipmentTypes: Equipment[] = [
  "bodyweight", "dumbbells", "barbell", "machine", "cable", "resistance_band", "kettlebell"
];

const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

export default function WorkoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<UserWorkoutTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");

  // Custom exercise creation
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  // customExerciseName removed - auto-generated from Ukrainian name
  const [customExerciseNameUk, setCustomExerciseNameUk] = useState("");
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState<MuscleGroup>("chest");
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState<Equipment>("bodyweight");
  const [customExerciseDifficulty, setCustomExerciseDifficulty] = useState<Difficulty>("beginner");
  const [customExerciseIsTimed, setCustomExerciseIsTimed] = useState(false);

  useEffect(() => {
    const data = getWorkouts();
    setWorkouts(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTemplates(getUserTemplates());
    setLoading(false);
  }, []);

  const refreshTemplates = useCallback(() => {
    setTemplates(getUserTemplates());
  }, []);

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateExercises([]);
    setEditingTemplateId(null);
  };

  const openCreateTemplate = () => {
    resetTemplateForm();
    setShowCreateTemplate(true);
  };

  const openEditTemplate = (template: UserWorkoutTemplate) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setTemplateExercises(
      template.exercises.map(te => ({
        exerciseId: te.exerciseId,
        sets: te.sets,
        reps: te.reps,
        weight: te.weight || 0,
        duration: te.duration || 60,
        unit: te.unit || (isTimedExercise(te.exerciseId) ? "seconds" : "reps"),
      }))
    );
    setShowCreateTemplate(true);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || templateExercises.length === 0) return;

    const allExercises = getAllExercises();
    const exerciseData = templateExercises.map(te => {
      const ex = allExercises.find(e => e.id === te.exerciseId);
      const isTimed = te.unit === "seconds";
      return {
        exerciseId: te.exerciseId,
        exerciseName: ex?.nameUk || ex?.name || te.exerciseId,
        sets: te.sets,
        reps: isTimed ? 0 : te.reps,
        weight: te.weight || undefined,
        duration: isTimed ? te.duration : undefined,
        unit: te.unit,
      };
    });

    if (editingTemplateId) {
      updateUserTemplate(editingTemplateId, { name: templateName.trim(), exercises: exerciseData });
    } else {
      saveUserTemplate({ name: templateName.trim(), exercises: exerciseData });
    }

    refreshTemplates();
    resetTemplateForm();
    setShowCreateTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteUserTemplate(id);
    refreshTemplates();
  };

  const handleUseTemplate = (template: UserWorkoutTemplate) => {
    sessionStorage.setItem("template_exercises", JSON.stringify(template.exercises));
    sessionStorage.setItem("template_name", template.name);
    router.push("/workouts/new?from_template=true");
  };

  const addExerciseToTemplate = (exerciseId: string) => {
    const isTimed = isTimedExercise(exerciseId);
    setTemplateExercises([
      ...templateExercises,
      {
        exerciseId,
        sets: 3,
        reps: isTimed ? 0 : 10,
        weight: 0,
        duration: 60,
        unit: isTimed ? "seconds" : "reps",
      },
    ]);
    setShowExercisePicker(false);
    setExerciseSearchQuery("");
  };

  const removeExerciseFromTemplate = (index: number) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== index));
  };

  const updateTemplateExercise = (index: number, field: keyof TemplateExercise, value: any) => {
    const updated = [...templateExercises];
    if (field === "weight") {
      updated[index] = { ...updated[index], [field]: Math.max(0, value) };
    } else if (field === "duration") {
      updated[index] = { ...updated[index], [field]: Math.max(1, value) };
    } else {
      updated[index] = { ...updated[index], [field]: Math.max(1, value) };
    }
    setTemplateExercises(updated);
  };

  const toggleExerciseUnit = (index: number) => {
    const updated = [...templateExercises];
    const current = updated[index];
    if (current.unit === "reps") {
      updated[index] = { ...current, unit: "seconds", duration: current.duration || 60 };
    } else {
      updated[index] = { ...current, unit: "reps", reps: current.reps || 10 };
    }
    setTemplateExercises(updated);
  };

  const allExercises = getAllExercises();
  const filteredPickerExercises = allExercises.filter(e => {
    const notAlreadyAdded = !templateExercises.some(te => te.exerciseId === e.id);
    if (!notAlreadyAdded) return false;
    if (!exerciseSearchQuery) return true;
    const q = exerciseSearchQuery.toLowerCase();
    return e.name.toLowerCase().includes(q) || e.nameUk.toLowerCase().includes(q);
  });

  const handleCreateCustomExercise = () => {
    if (!customExerciseNameUk.trim()) return;
    const newExercise = saveCustomExercise({
      name: customExerciseNameUk.trim(),
      nameUk: customExerciseNameUk.trim(),
      primaryMuscle: customExerciseMuscle,
      secondaryMuscles: [],
      equipment: [customExerciseEquipment],
      difficulty: customExerciseDifficulty,
      type: customExerciseIsTimed ? "cardio" : "strength",
      isUnilateral: false,
      isTimed: customExerciseIsTimed,
    });
    setCustomExerciseNameUk("");
    setCustomExerciseMuscle("chest");
    setCustomExerciseEquipment("bodyweight");
    setCustomExerciseDifficulty("beginner");
    setCustomExerciseIsTimed(false);
    setShowCustomExerciseModal(false);
  };

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
          Твої тренування та шаблони
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
                <p className="text-xs text-gray-500">Переглянь всі доступні вправи</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </Card>
        </Link>
      </motion.div>

      {/* My Templates */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime/10">
              <LayoutTemplate className="w-4 h-4 text-lime" />
            </div>
            Мої шаблони
          </h2>
          <button
            onClick={openCreateTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime/10 text-lime text-xs font-medium hover:bg-lime/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Створити
          </button>
        </div>

        {templates.length === 0 && !showCreateTemplate ? (
          <Card>
            <div className="text-center py-6">
              <LayoutTemplate className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Ще немає шаблонів</p>
              <p className="text-gray-500 text-xs mt-1">Створи шаблон для швидкого старту</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-white">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.exercises.length} вправ
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime text-black text-xs font-medium hover:bg-lime/80 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" fill="currentColor" />
                      Тренуватися
                    </button>
                    <button
                      onClick={() => openEditTemplate(template)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-electric/10 hover:text-electric transition-colors"
                      title="Редагувати"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Видалити"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.exercises.map((te, i) => {
                    const isTimed = te.unit === "seconds" || isTimedExercise(te.exerciseId);
                    const duration = (te as any).duration;
                    return (
                      <span key={i} className="text-[10px] bg-white/[0.05] text-gray-400 px-1.5 py-0.5 rounded">
                        {te.exerciseName} ({te.sets}x{isTimed && duration ? formatDurationShort(duration) : te.reps}{!isTimed && te.weight ? ` ${te.weight}кг` : ''})
                      </span>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create/Edit Template Modal */}
      <AnimatePresence>
        {showCreateTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowCreateTemplate(false);
                    resetTemplateForm();
                  }}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Назва шаблону"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    autoFocus
                    className="text-xl font-bold text-white bg-transparent border-none outline-none w-full placeholder-gray-600"
                  />
                </div>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || templateExercises.length === 0}
                  className={`px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                    templateName.trim() && templateExercises.length > 0
                      ? "bg-lime text-black"
                      : "bg-white/10 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {editingTemplateId ? "Оновити" : "Зберегти"}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Exercise list */}
              <div className="space-y-3 mb-4">
                {templateExercises.map((te, index) => {
                  const exercise = allExercises.find(e => e.id === te.exerciseId);
                  const isTimed = te.unit === "seconds";
                  return (
                    <div key={index} className="p-3 rounded-xl bg-gray-850 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-lime" />
                          <span className="font-medium text-white text-sm">
                            {exercise?.nameUk || exercise?.name || te.exerciseId}
                          </span>
                          {isTimed && (
                            <span className="text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded">
                              ⏱ Час
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleExerciseUnit(index)}
                            className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                            title="Перемкнути між повторами та часом"
                          >
                            {isTimed ? "×повтори" : "×час"}
                          </button>
                          <button
                            onClick={() => removeExerciseFromTemplate(index)}
                            className="text-gray-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Підходи:</span>
                          <input
                            type="number"
                            value={te.sets}
                            onChange={(e) => updateTemplateExercise(index, "sets", Number(e.target.value))}
                            min="1"
                            className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                          />
                        </div>
                        {isTimed ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Час (хв):</span>
                            <input
                              type="number"
                              value={Math.floor((te.duration || 60) / 60)}
                              onChange={(e) => {
                                const mins = Number(e.target.value);
                                const secs = (te.duration || 60) % 60;
                                updateTemplateExercise(index, "duration", mins * 60 + secs);
                              }}
                              min="0"
                              className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                            />
                            <span className="text-xs text-gray-500">сек:</span>
                            <input
                              type="number"
                              value={(te.duration || 60) % 60}
                              onChange={(e) => {
                                const secs = Number(e.target.value);
                                const mins = Math.floor((te.duration || 60) / 60);
                                updateTemplateExercise(index, "duration", mins * 60 + secs);
                              }}
                              min="0"
                              max="59"
                              className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Повтори:</span>
                            <input
                              type="number"
                              value={te.reps}
                              onChange={(e) => updateTemplateExercise(index, "reps", Number(e.target.value))}
                              min="1"
                              className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                            />
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Вага:</span>
                          <input
                            type="number"
                            value={te.weight || ""}
                            onChange={(e) => updateTemplateExercise(index, "weight", Number(e.target.value))}
                            min="0"
                            placeholder="0"
                            className="w-14 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                          />
                          <span className="text-xs text-gray-500">кг</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add exercise button */}
              <button
                onClick={() => setShowExercisePicker(true)}
                className="w-full py-4 border-2 border-dashed border-gray-700 rounded-2xl text-gray-400 hover:border-lime hover:text-lime transition-colors flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium">Додати вправу</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[70] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setShowExercisePicker(false);
                    setExerciseSearchQuery("");
                  }}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Пошук вправ..."
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-850 border border-gray-800 rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
                  />
                </div>
                <button
                  onClick={() => {
                    setShowExercisePicker(false);
                    setShowCustomExerciseModal(true);
                  }}
                  className="text-lime text-xs font-medium whitespace-nowrap"
                >
                  + Свою вправу
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {filteredPickerExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExerciseToTemplate(exercise.id)}
                    className="w-full text-left p-4 bg-gray-850 border border-gray-800 rounded-xl hover:border-lime transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-lime" />
                      <span className="font-medium text-white">{exercise.nameUk}</span>
                      {exercise.isTimed && (
                        <span className="text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded">⏱</span>
                      )}
                      {exercise.isCustom && (
                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded">Своя</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{exercise.name}</p>
                  </button>
                ))}
                {filteredPickerExercises.length === 0 && (
                  <div className="text-center py-8">
                    <Dumbbell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Вправ не знайдено</p>
                    <button
                      onClick={() => {
                        setShowExercisePicker(false);
                        setShowCustomExerciseModal(true);
                      }}
                      className="mt-3 px-4 py-2 bg-lime/10 text-lime text-sm rounded-xl hover:bg-lime/20 transition-colors"
                    >
                      Створити свою вправу
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Exercise Creation Modal */}
      <AnimatePresence>
        {showCustomExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[80] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCustomExerciseModal(false)}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <span className="font-medium text-white">Створити вправу</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Назва українською *</label>
                <input
                  type="text"
                  placeholder="Напр. Розводка гантелями"
                  value={customExerciseNameUk}
                  onChange={(e) => setCustomExerciseNameUk(e.target.value)}
                  className="w-full bg-gray-850 border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">М'язова група</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((m) => (
                    <button
                      key={m}
                      onClick={() => setCustomExerciseMuscle(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customExerciseMuscle === m
                          ? "bg-lime text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getMuscleGroupLabel(m)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Обладнання</label>
                <div className="flex flex-wrap gap-2">
                  {equipmentTypes.map((eq) => (
                    <button
                      key={eq}
                      onClick={() => setCustomExerciseEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customExerciseEquipment === eq
                          ? "bg-electric text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {eq === "bodyweight" ? "Вага тіла" : eq === "dumbbells" ? "Гантелі" : eq === "barbell" ? "Штанга" : eq === "machine" ? "Тренажер" : eq === "cable" ? "Блок" : eq === "resistance_band" ? "Резинка" : "Гиря"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Рівень складності</label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((d) => (
                    <button
                      key={d}
                      onClick={() => setCustomExerciseDifficulty(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customExerciseDifficulty === d
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {d === "beginner" ? "Початківець" : d === "intermediate" ? "Середній" : "Просунутий"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setCustomExerciseIsTimed(!customExerciseIsTimed)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      customExerciseIsTimed ? "bg-lime" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        customExerciseIsTimed ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-white">Вимірюється часом (хвилини/секунди)</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-[52px]">Увімкни для вправ типу планка, біг тощо</p>
              </div>
              <button
                onClick={handleCreateCustomExercise}
                disabled={!customExerciseNameUk.trim()}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
                  customExerciseNameUk.trim()
                    ? "bg-lime text-black hover:bg-lime/80"
                    : "bg-white/10 text-gray-600 cursor-not-allowed"
                }`}
              >
                Створити вправу
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
