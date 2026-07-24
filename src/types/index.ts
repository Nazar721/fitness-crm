// Exercise metadata
export interface Exercise {
  id: string;
  name: string;
  nameUk: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  difficulty: Difficulty;
  type: ExerciseType;
  isUnilateral: boolean;
}

export type MuscleGroup = 
  | "chest" 
  | "back" 
  | "shoulders" 
  | "biceps" 
  | "triceps" 
  | "quadriceps" 
  | "hamstrings" 
  | "glutes" 
  | "calves" 
  | "forearms" 
  | "core"
  | "cardio"
  | "mobility";

export type Equipment = 
  | "bodyweight" 
  | "dumbbells" 
  | "barbell" 
  | "machine" 
  | "cable" 
  | "resistance_band" 
  | "kettlebell";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ExerciseType = "strength" | "isolation" | "cardio" | "mobility";

// Workout types
export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number; // in minutes
  exercises: WorkoutExercise[];
  notes?: string;
  rating?: number; // 1-5
  totalVolume: number; // kg
  isNewRecord?: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise?: Exercise;
  sets: Set[];
  isSuperset?: boolean;
  supersetGroupId?: string;
  isCircuit?: boolean;
  circuitGroupId?: string;
  notes?: string;
}

export interface Set {
  id: string;
  type: SetType;
  weight?: number;
  reps?: number;
  rpe?: number;
  tempo?: string;
  duration?: number; // in seconds for timed exercises
  distance?: number; // in meters for cardio
  isCompleted: boolean;
  isDropSet?: boolean;
  isWarmup?: boolean;
}

export type SetType = "working" | "warmup" | "dropset" | "failure";

// User profile
export type Gender = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  age?: number;
  height?: number; // cm
  currentWeight?: number; // kg
  goalWeight?: number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  fitnessLevel: FitnessLevel;
  goal: FitnessGoal;
  availableEquipment: Equipment[];
  injuries: Injury[];
  measurements: Measurement[];
}

export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export type FitnessGoal = "strength" | "endurance" | "cutting" | "maintenance";

export interface Injury {
  id: string;
  bodyPart: string;
  description: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export interface Measurement {
  date: string;
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  thigh?: number;
  bicep?: number;
  calf?: number;
  neck?: number;
}

// Gamification
export interface UserProgress {
  xp: number;
  level: Level;
  streak: number;
  maxStreak: number;
  streakFreezes: number;
  workoutsThisWeek: number;
  weeklyGoal: number;
}

export type Level = 
  | "beginner" 
  | "athlete" 
  | "warrior" 
  | "beast" 
  | "elite" 
  | "legend" 
  | "mythic";

export interface Badge {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  icon: string;
  earnedAt?: string;
  progress?: number;
  target: number;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  progress: number;
  target: number;
  type: MissionType;
}

export type MissionType = "workout" | "nutrition" | "streak" | "social";

// Records
export interface PersonalRecord {
  exerciseId: string;
  type: "1rm" | "maxReps" | "volume" | "endurance";
  value: number;
  date: string;
  previousValue?: number;
}

// Bodyweight records for tracking basic exercises
export type BodyRecordExercise = "pull_ups" | "push_ups" | "dips" | "plank" | "burpees" | "squats" | "sit_ups" | "hanging_leg_raises" | "hanging_crunches";

export interface BodyRecord {
  exerciseId: BodyRecordExercise;
  value: number;
  date: string;
  previousValue?: number;
  unit: "reps" | "seconds";
}

export interface BodyRecordHistory {
  exerciseId: BodyRecordExercise;
  entries: BodyRecordEntry[];
}

export interface BodyRecordEntry {
  value: number;
  date: string;
  unit: "reps" | "seconds";
}

// Analytics
export interface WeeklyStats {
  weekStart: string;
  workouts: number;
  totalVolume: number;
  avgRpe: number;
  muscleGroupBalance: Record<MuscleGroup, number>;
}

// Training programs
export interface TrainingProgram {
  id: string;
  name: string;
  nameUk: string;
  description: string;
  level: FitnessLevel;
  frequency: number; // days per week
  duration: number; // weeks
  workouts: WorkoutTemplate[];
}

export interface WorkoutTemplate {
  name: string;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: string; // e.g., "8-12" or "30s"
    rest?: number; // seconds
  }[];
}

// User-created workout templates
export interface UserWorkoutTemplate {
  id: string;
  name: string;
  exercises: {
    exerciseId: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight?: number; // default weight in kg
  }[];
  createdAt: string;
}
