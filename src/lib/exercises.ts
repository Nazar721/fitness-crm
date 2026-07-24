import { Exercise } from "@/types";

// Базові вправи - автоматично доступні в додатку
export const BASE_EXERCISES: Exercise[] = [
  // ===== ВІДЖИМАННЯ ВІД ЗЕМЛІ (5) =====
  {
    id: "push-ups",
    name: "Push-ups",
    nameUk: "Віджимання",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders", "core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "wide-grip-push-ups",
    name: "Wide Grip Push-ups",
    nameUk: "Віджимання широким хватом",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "close-grip-push-ups",
    name: "Close Grip Push-ups",
    nameUk: "Віджимання вузьким хватом",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "decline-push-ups",
    name: "Decline Push-ups",
    nameUk: "Віджимання з піднятими ногами",
    primaryMuscle: "chest",
    secondaryMuscles: ["shoulders", "triceps"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "diamond-push-ups",
    name: "Diamond Push-ups",
    nameUk: "Віджимання алмазом",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "core"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },

  // ===== ПІДТЯГУВАННЯ НА ТУРНІКУ (5) =====
  {
    id: "wide-grip-pull-ups",
    name: "Wide Grip Pull-ups",
    nameUk: "Підтягування широким хватом",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "close-grip-pull-ups",
    name: "Close Grip Pull-ups",
    nameUk: "Підтягування вузьким хватом",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "chin-ups",
    name: "Chin-ups",
    nameUk: "Підтягування зворотним хватом",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "neutral-grip-pull-ups",
    name: "Neutral Grip Pull-ups",
    nameUk: "Підтягування паралельним хватом",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "forearms"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "commander-pull-ups",
    name: "Commander Pull-ups",
    nameUk: "Підтягування чергуванням",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps", "core"],
    equipment: ["bodyweight"],
    difficulty: "advanced",
    type: "strength",
    isUnilateral: true,
  },

  // ===== НОГИ (5) =====
  {
    id: "bodyweight-squats",
    name: "Bodyweight Squats",
    nameUk: "Присідання",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "jump-squats",
    name: "Jump Squats",
    nameUk: "Стрибкові присідання",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "calves"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "lunges-bodyweight",
    name: "Lunges",
    nameUk: "Випади",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: true,
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    nameUk: "Болгарські присідання",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "core"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: true,
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    nameUk: "Ягодичний місток",
    primaryMuscle: "glutes",
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },

  // ===== ГАНТЕЛІ (5) =====
  {
    id: "dumbbell-curl-alternating",
    name: "Dumbbell Curl Alternating",
    nameUk: "Підйом гантелей на біцепс по черзі",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    type: "isolation",
    isUnilateral: true,
  },
  {
    id: "hammer-curls",
    name: "Hammer Curls",
    nameUk: "Молотки з гантелями",
    primaryMuscle: "biceps",
    secondaryMuscles: ["forearms"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    type: "isolation",
    isUnilateral: false,
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    nameUk: "Жим гантелей стоячи",
    primaryMuscle: "shoulders",
    secondaryMuscles: ["triceps"],
    equipment: ["dumbbells"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "lateral-raises",
    name: "Lateral Raises",
    nameUk: "Махи гантелями в сторони",
    primaryMuscle: "shoulders",
    secondaryMuscles: [],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    type: "isolation",
    isUnilateral: false,
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell Row",
    nameUk: "Тяга гантелі в нахилі",
    primaryMuscle: "back",
    secondaryMuscles: ["biceps"],
    equipment: ["dumbbells"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: true,
  },
];

// Додаткові вправи - користувач може додавати вручну
export const EXTRA_EXERCISES: Exercise[] = [
  {
    id: "dips",
    name: "Dips",
    nameUk: "Віджимання на брусах",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    nameUk: "Жим штанги лежачи",
    primaryMuscle: "chest",
    secondaryMuscles: ["triceps", "shoulders"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "barbell-squat",
    name: "Barbell Squat",
    nameUk: "Присідання зі штангою",
    primaryMuscle: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "core"],
    equipment: ["barbell"],
    difficulty: "intermediate",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "conventional-deadlift",
    name: "Conventional Deadlift",
    nameUk: "Станова тяга",
    primaryMuscle: "back",
    secondaryMuscles: ["hamstrings", "glutes", "forearms"],
    equipment: ["barbell"],
    difficulty: "advanced",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "crunches",
    name: "Crunches",
    nameUk: "Прес класичний",
    primaryMuscle: "core",
    secondaryMuscles: [],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "isolation",
    isUnilateral: false,
  },
  {
    id: "plank",
    name: "Plank",
    nameUk: "Планка",
    primaryMuscle: "core",
    secondaryMuscles: ["shoulders"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "strength",
    isUnilateral: false,
  },
  {
    id: "burpees",
    name: "Burpees",
    nameUk: "Берпі",
    primaryMuscle: "cardio",
    secondaryMuscles: ["chest", "quadriceps", "core"],
    equipment: ["bodyweight"],
    difficulty: "intermediate",
    type: "cardio",
    isUnilateral: false,
  },
  {
    id: "running-outdoor",
    name: "Running",
    nameUk: "Біг",
    primaryMuscle: "cardio",
    secondaryMuscles: ["quadriceps", "hamstrings"],
    equipment: ["bodyweight"],
    difficulty: "beginner",
    type: "cardio",
    isUnilateral: false,
  },
];

// Повний список = базові + додані користувачем
export const exercises: Exercise[] = [...BASE_EXERCISES, ...EXTRA_EXERCISES];

export function getExercisesByMuscleGroup(muscleGroup: string): Exercise[] {
  return exercises.filter(
    (e) => e.primaryMuscle === muscleGroup || e.secondaryMuscles.includes(muscleGroup as any)
  );
}

export function getExercisesByEquipment(equipment: string): Exercise[] {
  return exercises.filter((e) => e.equipment.includes(equipment as any));
}

export function getExercisesByDifficulty(difficulty: string): Exercise[] {
  return exercises.filter((e) => e.difficulty === difficulty);
}

export function searchExercises(query: string): Exercise[] {
  const lowerQuery = query.toLowerCase();
  return exercises.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.nameUk.toLowerCase().includes(lowerQuery) ||
      e.primaryMuscle.toLowerCase().includes(lowerQuery)
  );
}

export function filterExercises(
  muscleGroup?: string,
  equipment?: string,
  difficulty?: string
): Exercise[] {
  return exercises.filter((e) => {
    if (muscleGroup && e.primaryMuscle !== muscleGroup) return false;
    if (equipment && !e.equipment.includes(equipment as any)) return false;
    if (difficulty && e.difficulty !== difficulty) return false;
    return true;
  });
}
