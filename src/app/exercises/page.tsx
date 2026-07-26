"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Dumbbell,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2
} from "lucide-react";
import { exercises, getAllExercises, saveCustomExercise, deleteCustomExercise } from "@/lib/exercises";
import { getMuscleGroupLabel as getMuscleLabel, getEquipmentLabel, getDifficultyLabel } from "@/lib/utils";
import { Exercise, MuscleGroup, Equipment, Difficulty } from "@/types";

const muscleGroups: MuscleGroup[] = [
  "chest", "back", "shoulders", "biceps", "triceps",
  "quadriceps", "hamstrings", "glutes", "calves", "forearms", "core", "cardio"
];

const equipmentTypes: Equipment[] = [
  "bodyweight", "dumbbells", "barbell", "machine", "cable", "resistance_band", "kettlebell"
];

const difficulties: Difficulty[] = ["beginner", "intermediate", "advanced"];

export default function ExercisesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customNameUk, setCustomNameUk] = useState("");
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>("chest");
  const [customEquipment, setCustomEquipment] = useState<Equipment>("bodyweight");
  const [customDifficulty, setCustomDifficulty] = useState<Difficulty>("beginner");
  const [customIsTimed, setCustomIsTimed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const allExercises = getAllExercises();

  const filteredExercises = allExercises.filter((exercise) => {
    const matchesSearch = 
      exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.nameUk.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMuscle = !selectedMuscle || exercise.primaryMuscle === selectedMuscle;
    const matchesEquipment = !selectedEquipment || exercise.equipment.includes(selectedEquipment as any);
    const matchesDifficulty = !selectedDifficulty || exercise.difficulty === selectedDifficulty;

    return matchesSearch && matchesMuscle && matchesEquipment && matchesDifficulty;
  });

  const clearFilters = () => {
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedMuscle || selectedEquipment || selectedDifficulty;

  const handleCreateCustom = () => {
    if (!customNameUk.trim()) return;
    saveCustomExercise({
      name: customNameUk.trim(),
      nameUk: customNameUk.trim(),
      primaryMuscle: customMuscle,
      secondaryMuscles: [],
      equipment: [customEquipment],
      difficulty: customDifficulty,
      type: customIsTimed ? "cardio" : "strength",
      isUnilateral: false,
      isTimed: customIsTimed,
    });
    setCustomNameUk("");
    setCustomMuscle("chest");
    setCustomEquipment("bodyweight");
    setCustomDifficulty("beginner");
    setCustomIsTimed(false);
    setShowCustomModal(false);
    setRefreshKey(k => k + 1);
  };

  const handleDeleteCustom = (id: string) => {
    deleteCustomExercise(id);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="min-h-screen pb-24" key={refreshKey}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">База вправ</h1>
            <p className="text-gray-400 text-sm mt-1">
              {allExercises.length} вправ у базі даних
            </p>
          </div>
          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-lime/10 text-lime text-xs font-medium hover:bg-lime/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Створити
          </button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Пошук вправ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-850 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-500 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            hasActiveFilters
              ? "bg-lime/20 text-lime border border-lime/30"
              : "bg-gray-850 text-gray-400 border border-gray-800 hover:border-gray-700"
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Фільтри</span>
          {hasActiveFilters && (
            <span className="bg-lime text-black text-xs px-2 py-0.5 rounded-full">
              {[selectedMuscle, selectedEquipment, selectedDifficulty].filter(Boolean).length}
            </span>
          )}
          {showFilters ? (
            <ChevronUp className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-auto" />
          )}
        </button>
      </motion.div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <Card>
              {/* Muscle Groups */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">М'язова група</h3>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscle(selectedMuscle === muscle ? null : muscle)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedMuscle === muscle
                          ? "bg-lime text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getMuscleLabel(muscle)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Обладнання</h3>
                <div className="flex flex-wrap gap-2">
                  {equipmentTypes.map((equipment) => (
                    <button
                      key={equipment}
                      onClick={() => setSelectedEquipment(selectedEquipment === equipment ? null : equipment)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedEquipment === equipment
                          ? "bg-electric text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getEquipmentLabel(equipment)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Рівень</h3>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedDifficulty === difficulty
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getDifficultyLabel(difficulty)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Очистити фільтри
                </button>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-4"
      >
        <p className="text-sm text-gray-400">
          Знайдено: {filteredExercises.length} вправ
        </p>
      </motion.div>

      {/* Exercise List */}
      <div className="space-y-2">
        {filteredExercises.map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.03 }}
          >
            <Card
              hover
              onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-lime" />
                    <h3 className="font-medium text-white">{exercise.nameUk}</h3>
                    {exercise.isTimed && (
                      <span className="text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded">⏱ Час</span>
                    )}
                    {exercise.isCustom && (
                      <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded">Своя</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{exercise.name}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                      {getMuscleLabel(exercise.primaryMuscle)}
                    </span>
                    <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                    {exercise.isUnilateral && (
                      <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">
                        Одностороння
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {exercise.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustom(exercise.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {expandedExercise === exercise.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedExercise === exercise.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-800 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-500">Обладнання:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {exercise.equipment.map((eq) => (
                            <span
                              key={eq}
                              className="text-xs bg-electric/20 text-electric px-2 py-0.5 rounded-full"
                            >
                              {getEquipmentLabel(eq)}
                            </span>
                          ))}
                        </div>
                      </div>
                      {exercise.secondaryMuscles.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500">Допоміжні м'язи:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {exercise.secondaryMuscles.map((muscle) => (
                              <span
                                key={muscle}
                                className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full"
                              >
                                {getMuscleLabel(muscle)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">Тип:</p>
                        <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                          {exercise.type === "strength" ? "Силова" : 
                           exercise.type === "isolation" ? "Ізольована" :
                           exercise.type === "cardio" ? "Кардіо" : "Мобільність"}
                        </span>
                        {exercise.isTimed && (
                          <span className="text-xs bg-electric/20 text-electric px-2 py-0.5 rounded-full ml-2">
                            Вимірюється часом
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredExercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Dumbbell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Вправ не знайдено</p>
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={clearFilters}
              className="text-lime text-sm hover:underline"
            >
              Очистити фільтри
            </button>
            <span className="text-gray-600">або</span>
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-lime text-sm hover:underline"
            >
              Створити свою вправу
            </button>
          </div>
        </motion.div>
      )}

      {/* Custom Exercise Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex flex-col"
          >
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="touch-target"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
                <span className="font-medium text-white">Створити вправу</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Назва вправи *</label>
                <input
                  type="text"
                  placeholder="Напр. Розводка гантелями"
                  value={customNameUk}
                  onChange={(e) => setCustomNameUk(e.target.value)}
                  autoFocus
                  className="w-full bg-gray-850 border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-lime transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">М'язова група</label>
                <div className="flex flex-wrap gap-2">
                  {muscleGroups.map((m) => (
                    <button
                      key={m}
                      onClick={() => setCustomMuscle(m)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customMuscle === m
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
                      onClick={() => setCustomEquipment(eq)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customEquipment === eq
                          ? "bg-electric text-black"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getEquipmentLabel(eq)}
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
                      onClick={() => setCustomDifficulty(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        customDifficulty === d
                          ? "bg-purple-500 text-white"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                      }`}
                    >
                      {getDifficultyLabel(d)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setCustomIsTimed(!customIsTimed)}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      customIsTimed ? "bg-lime" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        customIsTimed ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-white">Вимірюється часом (хвилини/секунди)</span>
                </label>
                <p className="text-xs text-gray-500 mt-1 ml-[52px]">Для вправ типу планка, біг тощо</p>
              </div>
              <button
                onClick={handleCreateCustom}
                disabled={!customNameUk.trim()}
                className={`w-full py-3 rounded-xl font-medium text-sm transition-colors ${
                  customNameUk.trim()
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
    </div>
  );
}
