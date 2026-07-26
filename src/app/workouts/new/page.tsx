"use client";

import { useState, useEffect, Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Search,
  X,
  Check,
  Clock,
  Dumbbell,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getAllExercises, isTimedExercise, saveCustomExercise } from "@/lib/exercises";
import { getMuscleGroupLabel as getMuscleLabel } from "@/lib/utils";
import { Exercise, Set, Workout, MuscleGroup, Equipment, Difficulty } from "@/types";
import { addWorkout, getProgress, saveProgress } from "@/lib/storage";

interface WorkoutExercise {
  exercise: Exercise;
  sets: Set[];
}

function NewWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromTemplate = searchParams.get("from_template") === "true";
  const [workoutName, setWorkoutName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Custom exercise creation
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  // customExerciseName removed - auto-generated from Ukrainian name
  const [customExerciseNameUk, setCustomExerciseNameUk] = useState("");
  const [customExerciseMuscle, setCustomExerciseMuscle] = useState<MuscleGroup>("chest");
  const [customExerciseEquipment, setCustomExerciseEquipment] = useState<Equipment>("bodyweight");
  const [customExerciseDifficulty, setCustomExerciseDifficulty] = useState<Difficulty>("beginner");
  const [customExerciseIsTimed, setCustomExerciseIsTimed] = useState(false);

  const muscleGroups: MuscleGroup[] = [
    "chest", "back", "shoulders", "biceps", "triceps",
    "quadriceps", "hamstrings", "glutes", "calves", "forearms", "core", "cardio"
  ];

  const equipmentTypes: Equipment[] = [
    "bodyweight", "dumbbells", "barbell", "machine", "cable", "resistance_band", "kettlebell"
  ];

  const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

  // Load exercises from template on mount
  useEffect(() => {
    if (fromTemplate) {
      const templateData = sessionStorage.getItem("template_exercises");
      const templateName = sessionStorage.getItem("template_name");
      if (templateData) {
        try {
          const templateExercises = JSON.parse(templateData);
          const allExercisesList = getAllExercises();
          const loadedExercises: WorkoutExercise[] = templateExercises
            .map((te: any) => {
              const exercise = allExercisesList.find(e => e.id === te.exerciseId);
              if (!exercise) return null;

              const isTimed = te.unit === "seconds" || isTimedExercise(te.exerciseId);
              const sets: Set[] = [];
              for (let i = 0; i < te.sets; i++) {
                sets.push({
                  id: `set-${Date.now()}-${i}`,
                  type: "working",
                  weight: te.weight || 0,
                  reps: isTimed ? 0 : (te.reps || 10),
                  duration: isTimed ? (te.duration || 60) : undefined,
                  isCompleted: false,
                });
              }

              return { exercise, sets };
            })
            .filter(Boolean);

          setWorkoutExercises(loadedExercises);
          if (templateName) {
            setWorkoutName(templateName);
          }
          sessionStorage.removeItem("template_exercises");
          sessionStorage.removeItem("template_name");
        } catch (e) {
          console.error("Failed to load template:", e);
        }
      }
    }
  }, [fromTemplate]);

  const allExercisesList = getAllExercises();
  const filteredExercises = allExercisesList.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.nameUk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExercise = (exercise: Exercise) => {
    const isTimed = exercise.isTimed;
    const newSet: Set = {
      id: `set-${Date.now()}`,
      type: "working",
      weight: 0,
      reps: isTimed ? 0 : 0,
      duration: isTimed ? 60 : undefined,
      isCompleted: false,
    };

    setWorkoutExercises([
      ...workoutExercises,
      { exercise, sets: [newSet] },
    ]);
    setShowExercisePicker(false);
    setSearchQuery("");
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...workoutExercises];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    const isTimed = updated[exerciseIndex].exercise.isTimed;
    const newSet: Set = {
      id: `set-${Date.now()}`,
      type: "working",
      weight: lastSet?.weight || 0,
      reps: isTimed ? 0 : (lastSet?.reps || 0),
      duration: isTimed ? (lastSet?.duration || 60) : undefined,
      isCompleted: false,
    };
    updated[exerciseIndex].sets.push(newSet);
    setWorkoutExercises(updated);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof Set,
    value: any
  ) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setWorkoutExercises(updated);
  };

  const removeExercise = (exerciseIndex: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== exerciseIndex));
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...workoutExercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter((_, i) => i !== setIndex);
    if (updated[exerciseIndex].sets.length === 0) {
      removeExercise(exerciseIndex);
    } else {
      setWorkoutExercises(updated);
    }
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    updateSet(exerciseIndex, setIndex, "isCompleted", !workoutExercises[exerciseIndex].sets[setIndex].isCompleted);
  };

  const startWorkout = () => {
    setIsWorkoutActive(true);
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const finishWorkout = () => {
    let totalVolume = 0;
    workoutExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted && set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
        }
      });
    });

    const workout: Workout = {
      id: `workout-${Date.now()}`,
      name: workoutName || "Тренування",
      date: new Date().toISOString().split("T")[0],
      duration: Math.floor(elapsedTime / 60),
      exercises: workoutExercises.map((we) => ({
        exerciseId: we.exercise.id,
        sets: we.sets,
      })),
      totalVolume,
      isNewRecord: false,
    };

    addWorkout(workout);

    const progress = getProgress();
    progress.xp += 50;
    progress.workoutsThisWeek += 1;
    saveProgress(progress);

    router.push("/workouts");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSets = workoutExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = workoutExercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );

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
    setShowCustomExerciseModal(false);
    // Auto-add the newly created exercise
    addExercise(newExercise);
  };

  return (
    <div className="min-h-screen bg-black p-4 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <Link href="/workouts" className="touch-target">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Назва тренування"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              className="text-xl font-bold text-white bg-transparent border-none outline-none w-full placeholder-gray-600"
            />
          </div>
        </div>

        {/* Timer */}
        {isWorkoutActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-gray-850 border border-gray-800 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-lime" />
              <span className="text-2xl font-mono font-bold text-white">
                {formatTime(elapsedTime)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">
                {completedSets}/{totalSets} підходів
              </p>
              <p className="text-xs text-gray-500">
                {workoutExercises.length} вправ
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-4 mb-6">
        <AnimatePresence>
          {workoutExercises.map((workoutExercise, exerciseIndex) => {
            const isTimed = workoutExercise.exercise.isTimed;
            return (
              <motion.div
                key={workoutExercise.exercise.id + "-" + exerciseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-lime" />
                      <h3 className="font-medium text-white">
                        {workoutExercise.exercise.nameUk}
                      </h3>
                      {isTimed && (
                        <span className="text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded">⏱</span>
                      )}
                    </div>
                    <button
                      onClick={() => removeExercise(exerciseIndex)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sets Header */}
                  <div className={`grid gap-2 mb-2 text-xs text-gray-500 ${isTimed ? 'grid-cols-4' : 'grid-cols-4'}`}>
                    <div className="text-center">Підхід</div>
                    <div className="text-center">{isTimed ? "Час" : "Вага (кг)"}</div>
                    <div className="text-center">{isTimed ? "" : "Повтори"}</div>
                    <div className="text-center">✓</div>
                  </div>

                  {/* Sets */}
                  <div className="space-y-2">
                    {workoutExercise.sets.map((set, setIndex) => (
                      <div
                        key={set.id}
                        className={`grid gap-2 items-center p-2 rounded-lg ${
                          set.isCompleted ? "bg-lime/10" : "bg-gray-800"
                        } ${isTimed ? 'grid-cols-4' : 'grid-cols-4'}`}
                      >
                        <div className="text-center text-sm text-gray-400">
                          {setIndex + 1}
                        </div>
                        {isTimed ? (
                          <>
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                value={Math.floor((set.duration || 60) / 60)}
                                onChange={(e) => {
                                  const mins = Number(e.target.value);
                                  const secs = (set.duration || 60) % 60;
                                  updateSet(exerciseIndex, setIndex, "duration", mins * 60 + secs);
                                }}
                                min="0"
                                className="w-10 bg-gray-700 rounded px-1 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                              />
                              <span className="text-xs text-gray-500">х</span>
                              <input
                                type="number"
                                value={(set.duration || 60) % 60}
                                onChange={(e) => {
                                  const secs = Number(e.target.value);
                                  const mins = Math.floor((set.duration || 60) / 60);
                                  updateSet(exerciseIndex, setIndex, "duration", mins * 60 + secs);
                                }}
                                min="0"
                                max="59"
                                className="w-10 bg-gray-700 rounded px-1 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                              />
                            </div>
                            <div></div>
                          </>
                        ) : (
                          <>
                            <input
                              type="number"
                              value={set.weight || ""}
                              onChange={(e) =>
                                updateSet(exerciseIndex, setIndex, "weight", Number(e.target.value))
                              }
                              placeholder="0"
                              className="w-full bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                            />
                            <input
                              type="number"
                              value={set.reps || ""}
                              onChange={(e) =>
                                updateSet(exerciseIndex, setIndex, "reps", Number(e.target.value))
                              }
                              placeholder="0"
                              className="w-full bg-gray-700 rounded px-2 py-1 text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-lime"
                            />
                          </>
                        )}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => toggleSetComplete(exerciseIndex, setIndex)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              set.isCompleted
                                ? "bg-lime text-black"
                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          {workoutExercise.sets.length > 1 && (
                            <button
                              onClick={() => removeSet(exerciseIndex, setIndex)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Set Button */}
                  <button
                    onClick={() => addSet(exerciseIndex)}
                    className="w-full mt-3 py-2 border border-dashed border-gray-700 rounded-lg text-sm text-gray-400 hover:border-lime hover:text-lime transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Додати підхід
                  </button>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Add Exercise Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full py-4 border-2 border-dashed border-gray-700 rounded-2xl text-gray-400 hover:border-lime hover:text-lime transition-colors flex items-center justify-center gap-3"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium">Додати вправу</span>
        </button>
      </motion.div>

      {/* Start/Finish Workout Button */}
      {workoutExercises.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {!isWorkoutActive ? (
            <button
              onClick={startWorkout}
              className="w-full bg-gradient-to-r from-lime to-lime/80 text-black font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Dumbbell className="w-6 h-6" />
              <span>Почати тренування</span>
            </button>
          ) : (
            <button
              onClick={finishWorkout}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Check className="w-6 h-6" />
              <span>Завершити тренування</span>
            </button>
          )}
        </motion.div>
      )}

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowExercisePicker(false)}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Пошук вправ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-850 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
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
                {filteredExercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => addExercise(exercise)}
                    className="w-full text-left p-4 bg-gray-850 border border-gray-800 rounded-xl hover:border-lime transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-lime" />
                      <div>
                        <p className="font-medium text-white">{exercise.nameUk}</p>
                        <p className="text-xs text-gray-500">{exercise.name}</p>
                      </div>
                      {exercise.isTimed && (
                        <span className="text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded">⏱</span>
                      )}
                      {exercise.isCustom && (
                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded">Своя</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {getMuscleLabel(exercise.primaryMuscle)}
                      </span>
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {exercise.equipment[0] === "bodyweight" ? "Вага тіла" :
                         exercise.equipment[0] === "barbell" ? "Штанга" :
                         exercise.equipment[0] === "dumbbells" ? "Гантелі" :
                         exercise.equipment[0] === "machine" ? "Тренажер" :
                         exercise.equipment[0] === "cable" ? "Блок" : exercise.equipment[0]}
                      </span>
                      {exercise.isTimed && (
                        <span className="text-[10px] bg-electric/20 text-electric px-2 py-0.5 rounded-full">
                          Часова
                        </span>
                      )}
                    </div>
                  </button>
                ))}
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
            className="fixed inset-0 bg-black/90 z-[70] flex flex-col"
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
                      {getMuscleLabel(m)}
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
                <p className="text-xs text-gray-500 mt-1 ml-[52px]">Для вправ типу планка, біг тощо</p>
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
                Створити та додати
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-gray-400">Завантаження...</div>
      </div>
    }>
      <NewWorkoutContent />
    </Suspense>
  );
}
