"use client";

import { useEffect, useState } from "react";
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
  Copy,
  LayoutTemplate,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWorkouts, getUserTemplates, saveUserTemplate, deleteUserTemplate } from "@/lib/storage";
import { formatWeight, formatDuration } from "@/lib/utils";
import { exercises } from "@/lib/exercises";
import { UserWorkoutTemplate } from "@/types";

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
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<UserWorkoutTemplate[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateExercises, setTemplateExercises] = useState<TemplateExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  useEffect(() => {
    const data = getWorkouts();
    setWorkouts(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setTemplates(getUserTemplates());
    setLoading(false);
  }, []);

  const handleSaveTemplate = () => {
    if (!templateName.trim() || templateExercises.length === 0) return;

    const exerciseNames = templateExercises.map(te => {
      const ex = exercises.find(e => e.id === te.exerciseId);
      return {
        exerciseId: te.exerciseId,
        exerciseName: ex?.nameUk || ex?.name || te.exerciseId,
        sets: te.sets,
        reps: te.reps,
      };
    });

    saveUserTemplate({ name: templateName.trim(), exercises: exerciseNames });
    setTemplates(getUserTemplates());
    setTemplateName("");
    setTemplateExercises([]);
    setShowCreateTemplate(false);
  };

  const handleDeleteTemplate = (id: string) => {
    deleteUserTemplate(id);
    setTemplates(getUserTemplates());
  };

  const handleUseTemplate = (template: UserWorkoutTemplate) => {
    // Save template exercises to session storage for the new workout page
    sessionStorage.setItem("template_exercises", JSON.stringify(template.exercises));
    router.push("/workouts/new?from_template=true");
  };

  const addExerciseToTemplate = (exerciseId: string) => {
    setTemplateExercises([...templateExercises, { exerciseId, sets: 3, reps: 10 }]);
    setShowExercisePicker(false);
  };

  const removeExerciseFromTemplate = (index: number) => {
    setTemplateExercises(templateExercises.filter((_, i) => i !== index));
  };

  const updateTemplateExercise = (index: number, field: "sets" | "reps", value: number) => {
    const updated = [...templateExercises];
    updated[index] = { ...updated[index], [field]: Math.max(1, value) };
    setTemplateExercises(updated);
  };

  const filteredPickerExercises = exercises.filter(e =>
    !templateExercises.some(te => te.exerciseId === e.id)
  );

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
            onClick={() => setShowCreateTemplate(true)}
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
                      className="p-2 rounded-lg bg-lime/10 text-lime hover:bg-lime/20 transition-colors"
                      title="Використати"
                    >
                      <Copy className="w-4 h-4" />
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
                  {template.exercises.map((te, i) => (
                    <span key={i} className="text-[10px] bg-white/[0.05] text-gray-400 px-1.5 py-0.5 rounded">
                      {te.exerciseName} ({te.sets}x{te.reps})
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Template Modal */}
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
                    setTemplateName("");
                    setTemplateExercises([]);
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
                  Зберегти
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Exercise list */}
              <div className="space-y-3 mb-4">
                {templateExercises.map((te, index) => {
                  const exercise = exercises.find(e => e.id === te.exerciseId);
                  return (
                    <div key={index} className="p-3 rounded-xl bg-gray-850 border border-gray-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-lime" />
                          <span className="font-medium text-white text-sm">
                            {exercise?.nameUk || exercise?.name || te.exerciseId}
                          </span>
                        </div>
                        <button
                          onClick={() => removeExerciseFromTemplate(index)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Підходи:</span>
                          <input
                            type="number"
                            value={te.sets}
                            onChange={(e) => updateTemplateExercise(index, "sets", Number(e.target.value))}
                            min="1"
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Повтори:</span>
                          <input
                            type="number"
                            value={te.reps}
                            onChange={(e) => updateTemplateExercise(index, "reps", Number(e.target.value))}
                            min="1"
                            className="w-16 bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                          />
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
                  onClick={() => setShowExercisePicker(false)}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <span className="font-medium text-white">Обери вправу</span>
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
                    </div>
                  </button>
                ))}
              </div>
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
