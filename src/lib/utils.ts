import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BodyRecordExercise, FitnessLevel } from "@/types";
import { getCustomRecordExercises, CustomRecordExercise } from "@/lib/storage";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} кг`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
  });
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}г ${mins}хв`;
  }
  return `${mins}хв`;
}

export function calculate1RM(weight: number, reps: number): number {
  // Epley formula
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

export function getLevelFromXP(xp: number): {
  level: string;
  currentXP: number;
  nextLevelXP: number;
  progress: number;
} {
  const levels = [
    { name: "beginner", xp: 0 },
    { name: "athlete", xp: 500 },
    { name: "warrior", xp: 2000 },
    { name: "beast", xp: 5000 },
    { name: "elite", xp: 10000 },
    { name: "legend", xp: 20000 },
    { name: "mythic", xp: 50000 },
  ];

  let currentLevel = levels[0];
  let nextLevel = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] || levels[i];
      break;
    }
  }

  const progress = currentLevel.xp === nextLevel.xp
    ? 100
    : ((xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100;

  return {
    level: currentLevel.name,
    currentXP: xp,
    nextLevelXP: nextLevel.xp,
    progress: Math.min(progress, 100),
  };
}

export function getFitnessLevelFromXP(xp: number): FitnessLevel {
  if (xp >= 2000) return "advanced";
  if (xp >= 500) return "intermediate";
  return "beginner";
}

export function getFitnessLevelLabel(level: FitnessLevel): string {
  const labels: Record<FitnessLevel, string> = {
    beginner: "Початківець",
    intermediate: "Середній",
    advanced: "Просунутий",
  };
  return labels[level] || level;
}

export function getMuscleGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    chest: "Груди",
    back: "Спина",
    shoulders: "Плечі",
    biceps: "Біцепс",
    triceps: "Трицепс",
    quadriceps: "Квадрицепс",
    hamstrings: "Задня поверхня",
    glutes: "Сідниці",
    calves: "Литки",
    forearms: "Передпліччя",
    core: "Прес",
    cardio: "Кардіо",
    mobility: "Мобільність",
  };
  return labels[group] || group;
}

export function getEquipmentLabel(equipment: string): string {
  const labels: Record<string, string> = {
    bodyweight: "Вага тіла",
    dumbbells: "Гантелі",
    barbell: "Штанга",
    machine: "Тренажер",
    cable: "Блок",
    resistance_band: "Резинка",
    kettlebell: "Гиря",
  };
  return labels[equipment] || equipment;
}

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    beginner: "Початківець",
    intermediate: "Середній",
    advanced: "Просунутий",
  };
  return labels[difficulty] || difficulty;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: "🥉 Beginner",
    athlete: "🥈 Athlete",
    warrior: "🥇 Warrior",
    beast: "🔥 Beast",
    elite: "💎 Elite",
    legend: "👑 Legend",
    mythic: "🌟 Mythic",
  };
  return labels[level] || level;
}

export function getXpForAction(action: string): number {
  const xpMap: Record<string, number> = {
    workout_completed: 50,
    new_record: 100,
    daily_mission: 25,
    streak_bonus: 20,
    max_effort: 15,
    perfect_week: 50,
  };
  return xpMap[action] || 0;
}

export function getBodyRecordLabel(exerciseId: BodyRecordExercise): string {
  const labels: Record<BodyRecordExercise, string> = {
    pull_ups: "Підтягування",
    push_ups: "Віджимання",
    dips: "Віджимання на брусах",
    plank: "Планка",
    burpees: "Берпі",
    squats: "Присідання",
    sit_ups: "Скручування",
    hanging_leg_raises: "Вис з прямими ногами",
    hanging_crunches: "Скручування на турніку",
  };
  if (labels[exerciseId]) return labels[exerciseId];
  // Check custom exercises
  const customExercises = getCustomRecordExercises();
  const custom = customExercises.find(e => e.id === exerciseId);
  return custom?.name || exerciseId;
}

export function getBodyRecordUnit(exerciseId: BodyRecordExercise): "reps" | "seconds" {
  if (exerciseId === "plank" || exerciseId === "hanging_leg_raises") return "seconds";
  // Check custom exercises
  const customExercises = getCustomRecordExercises();
  const custom = customExercises.find(e => e.id === exerciseId);
  return custom?.unit || "reps";
}

export function formatBodyRecordValue(value: number, unit: "reps" | "seconds"): string {
  if (unit === "seconds") {
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    if (minutes > 0) return `${minutes}хв ${seconds}с`;
    return `${seconds}с`;
  }
  return `${value}`;
}
