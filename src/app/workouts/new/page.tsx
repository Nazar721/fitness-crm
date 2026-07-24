"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";
import { exercises } from "@/lib/exercises";
import { getMuscleGroupLabel } from "@/lib/utils";
import { Exercise, Set, Workout } from "@/types";
import { addWorkout, getProgress, saveProgress } from "@/lib/storage";

interface WorkoutExercise {
  exercise: Exercise;
  sets: Set[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState("");
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.nameUk.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addExercise = (exercise: Exercise) => {
    const newSet: Set = {
      id: `set-${Date.now()}`,
      type: "working",
      weight: 0,
      reps: 0,
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
    const newSet: Set = {
      id: `set-${Date.now()}`,
      type: "working",
      weight: lastSet?.weight || 0,
      reps: lastSet?.reps || 0,
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
    // Start timer
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    // Store interval for cleanup
    return () => clearInterval(interval);
  };

  const finishWorkout = () => {
    // Calculate total volume
    let totalVolume = 0;
    workoutExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.isCompleted && set.weight && set.reps) {
          totalVolume += set.weight * set.reps;
        }
      });
    });

    // Create workout object
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

    // Save to localStorage
    addWorkout(workout);

    // Update progress (XP, streak)
    const progress = getProgress();
    progress.xp += 50;
    progress.workoutsThisWeek += 1;
    saveProgress(progress);

    // Redirect to workouts list
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
          {workoutExercises.map((workoutExercise, exerciseIndex) => (
            <motion.div
              key={workoutExercise.exercise.id}
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
                  </div>
                  <button
                    onClick={() => removeExercise(exerciseIndex)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Header */}
                <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-gray-500">
                  <div className="text-center">Підхід</div>
                  <div className="text-center">Вага (кг)</div>
                  <div className="text-center">Повтори</div>
                  <div className="text-center">✓</div>
                </div>

                {/* Sets */}
                <div className="space-y-2">
                  {workoutExercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-4 gap-2 items-center p-2 rounded-lg ${
                        set.isCompleted ? "bg-lime/10" : "bg-gray-800"
                      }`}
                    >
                      <div className="text-center text-sm text-gray-400">
                        {setIndex + 1}
                      </div>
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
          ))}
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
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {getMuscleGroupLabel(exercise.primaryMuscle)}
                      </span>
                      <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {exercise.equipment[0] === "bodyweight" ? "Вага тіла" :
                         exercise.equipment[0] === "barbell" ? "Штанга" :
                         exercise.equipment[0] === "dumbbells" ? "Гантелі" :
                         exercise.equipment[0] === "machine" ? "Тренажер" :
                         exercise.equipment[0] === "cable" ? "Блок" : exercise.equipment[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
