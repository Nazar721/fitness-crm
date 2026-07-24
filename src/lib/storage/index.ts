import { Workout, UserProfile, UserProgress, Measurement, Injury, PersonalRecord, Badge, BodyRecord, BodyRecordExercise, BodyRecordHistory, BodyRecordEntry, UserWorkoutTemplate } from "@/types";
import { getBodyRecordLabel } from "@/lib/utils";

const STORAGE_KEYS = {
  PROFILE: "fittrack_profile",
  WORKOUTS: "fittrack_workouts",
  PROGRESS: "fittrack_progress",
  MEASUREMENTS: "fittrack_measurements",
  INJURIES: "fittrack_injuries",
  RECORDS: "fittrack_records",
  BADGES: "fittrack_badges",
  BODY_RECORDS: "fittrack_body_records",
  BODY_RECORDS_HISTORY: "fittrack_body_records_history",
  USER_TEMPLATES: "fittrack_user_templates",
} as const;

// ===== Generic helpers =====

function get<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage error:", error);
  }
}

// ===== Profile =====

export function getProfile(): UserProfile {
  return get<UserProfile>(STORAGE_KEYS.PROFILE, {
    id: "local-user",
    name: "",
    email: "",
    fitnessLevel: "beginner",
    goal: "strength",
    availableEquipment: [],
    injuries: [],
    measurements: [],
  });
}

export function saveProfile(profile: UserProfile): void {
  set(STORAGE_KEYS.PROFILE, profile);
}

// ===== Workouts =====

export function getWorkouts(): Workout[] {
  return get<Workout[]>(STORAGE_KEYS.WORKOUTS, []);
}

export function saveWorkouts(workouts: Workout[]): void {
  set(STORAGE_KEYS.WORKOUTS, workouts);
}

export function addWorkout(workout: Workout): void {
  const workouts = getWorkouts();
  workouts.unshift(workout);
  saveWorkouts(workouts);
}

export function deleteWorkout(id: string): void {
  const workouts = getWorkouts().filter(w => w.id !== id);
  saveWorkouts(workouts);
}

// ===== Progress (gamification) =====

export function getProgress(): UserProgress {
  return get<UserProgress>(STORAGE_KEYS.PROGRESS, {
    xp: 0,
    level: "beginner",
    streak: 0,
    maxStreak: 0,
    streakFreezes: 0,
    workoutsThisWeek: 0,
    weeklyGoal: 4,
  });
}

export function saveProgress(progress: UserProgress): void {
  set(STORAGE_KEYS.PROGRESS, progress);
}

export function updateWeeklyGoal(goal: number): void {
  const progress = getProgress();
  saveProgress({ ...progress, weeklyGoal: goal });
}

// ===== Measurements =====

export function getMeasurements(): Measurement[] {
  return get<Measurement[]>(STORAGE_KEYS.MEASUREMENTS, [
    { date: "2024-01-01", weight: 82, chest: 102, waist: 82, thigh: 58, bicep: 36, calf: 38 }
  ]);
}

export function saveMeasurements(measurements: Measurement[]): void {
  set(STORAGE_KEYS.MEASUREMENTS, measurements);
}

// ===== Injuries =====

export function getInjuries(): Injury[] {
  return get<Injury[]>(STORAGE_KEYS.INJURIES, [
    { id: "1", bodyPart: "Коліно", description: "Біль при глибоких присіданнях", startDate: "2024-01-01", isActive: true }
  ]);
}

export function saveInjuries(injuries: Injury[]): void {
  set(STORAGE_KEYS.INJURIES, injuries);
}

// ===== Personal Records =====

export function getPersonalRecords(): PersonalRecord[] {
  return get<PersonalRecord[]>(STORAGE_KEYS.RECORDS, []);
}

export function savePersonalRecords(records: PersonalRecord[]): void {
  set(STORAGE_KEYS.RECORDS, records);
}

// ===== Badges =====

export function getBadges(): Badge[] {
  return get<Badge[]>(STORAGE_KEYS.BADGES, []);
}

export function saveBadges(badges: Badge[]): void {
  set(STORAGE_KEYS.BADGES, badges);
}

// ===== Body Records =====

export function getBodyRecords(): BodyRecord[] {
  return get<BodyRecord[]>(STORAGE_KEYS.BODY_RECORDS, []);
}

export function saveBodyRecords(records: BodyRecord[]): void {
  set(STORAGE_KEYS.BODY_RECORDS, records);
}

export function updateBodyRecord(exerciseId: BodyRecordExercise, value: number, unit: "reps" | "seconds"): BodyRecord {
  const records = getBodyRecords();
  const existing = records.find(r => r.exerciseId === exerciseId);
  
  const newRecord: BodyRecord = {
    exerciseId,
    value,
    date: new Date().toISOString().split("T")[0],
    previousValue: existing?.value,
    unit,
  };

  const updated = records.filter(r => r.exerciseId !== exerciseId);
  updated.push(newRecord);
  saveBodyRecords(updated);

  // Also save to history
  addBodyRecordHistory(exerciseId, value, unit);
  
  return newRecord;
}

export function getBodyRecord(exerciseId: BodyRecordExercise): BodyRecord | undefined {
  return getBodyRecords().find(r => r.exerciseId === exerciseId);
}

// ===== Body Records History =====

function getBodyRecordsHistory(): BodyRecordHistory[] {
  return get<BodyRecordHistory[]>(STORAGE_KEYS.BODY_RECORDS_HISTORY, []);
}

function saveBodyRecordsHistory(history: BodyRecordHistory[]): void {
  set(STORAGE_KEYS.BODY_RECORDS_HISTORY, history);
}

function addBodyRecordHistory(exerciseId: BodyRecordExercise, value: number, unit: "reps" | "seconds"): void {
  const history = getBodyRecordsHistory();
  let exerciseHistory = history.find(h => h.exerciseId === exerciseId);
  
  if (!exerciseHistory) {
    exerciseHistory = { exerciseId, entries: [] };
    history.push(exerciseHistory);
  }

  exerciseHistory.entries.push({
    value,
    date: new Date().toISOString().split("T")[0],
    unit,
  });

  saveBodyRecordsHistory(history);
}

export function getBodyRecordHistory(exerciseId: BodyRecordExercise): BodyRecordEntry[] {
  const history = getBodyRecordsHistory();
  return history.find(h => h.exerciseId === exerciseId)?.entries || [];
}

export function getAllBodyRecordHistories(): BodyRecordHistory[] {
  return getBodyRecordsHistory();
}

// ===== Export/Import =====

export interface ExportData {
  version: string;
  exportDate: string;
  profile: UserProfile;
  workouts: Workout[];
  progress: UserProgress;
  measurements: Measurement[];
  injuries: Injury[];
  records: PersonalRecord[];
  badges: Badge[];
  bodyRecords: BodyRecord[];
  bodyRecordsHistory: BodyRecordHistory[];
}

export function exportAllData(): ExportData {
  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    profile: getProfile(),
    workouts: getWorkouts(),
    progress: getProgress(),
    measurements: getMeasurements(),
    injuries: getInjuries(),
    records: getPersonalRecords(),
    badges: getBadges(),
    bodyRecords: getBodyRecords(),
    bodyRecordsHistory: getAllBodyRecordHistories(),
  };
}

export function importAllData(data: ExportData): { success: boolean; message: string } {
  try {
    if (data.profile) saveProfile(data.profile);
    if (data.workouts) saveWorkouts(data.workouts);
    if (data.progress) saveProgress(data.progress);
    if (data.measurements) saveMeasurements(data.measurements);
    if (data.injuries) saveInjuries(data.injuries);
    if (data.records) savePersonalRecords(data.records);
    if (data.badges) saveBadges(data.badges);
    if (data.bodyRecords) saveBodyRecords(data.bodyRecords);
    if (data.bodyRecordsHistory) saveBodyRecordsHistory(data.bodyRecordsHistory);
    return { success: true, message: "Дані успішно імпортовано!" };
  } catch (error) {
    return { success: false, message: "Помилка імпорту даних" };
  }
}

export function downloadJSON(data: ExportData, filename?: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `fittrack-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportJSON(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch {
        reject(new Error("Невірний формат файлу"));
      }
    };
    reader.onerror = () => reject(new Error("Помилка читання файлу"));
    reader.readAsText(file);
  });
}

// ===== Workout helpers =====

export function getWorkoutCountThisWeek(): number {
  const workouts = getWorkouts();
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  weekStart.setHours(0, 0, 0, 0);

  return workouts.filter(w => new Date(w.date) >= weekStart).length;
}

export function getRecentWorkouts(limit: number = 3): Workout[] {
  return getWorkouts()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

export function getTodayWorkouts(): Workout[] {
  const today = new Date().toISOString().split("T")[0];
  return getWorkouts().filter(w => w.date === today);
}

export function getTotalStats() {
  const workouts = getWorkouts();
  return {
    totalWorkouts: workouts.length,
    totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
  };
}

// ===== Period comparison =====

export function getPeriodStats(weeksAgo: number, durationWeeks: number = 1) {
  const workouts = getWorkouts();
  const now = new Date();
  
  const end = new Date(now);
  end.setDate(now.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(end.getDate() - durationWeeks * 7);
  
  const periodWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    return d >= start && d < end;
  });

  return {
    count: periodWorkouts.length,
    volume: periodWorkouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0),
    avgDuration: periodWorkouts.length > 0
      ? Math.round(periodWorkouts.reduce((sum, w) => sum + w.duration, 0) / periodWorkouts.length)
      : 0,
  };
}

export function getTopExercises(limit: number = 5) {
  const workouts = getWorkouts();
  const exerciseCounts: Record<string, { name: string; count: number; totalVolume: number }> = {};
  
  workouts.forEach(w => {
    w.exercises?.forEach(we => {
      const name = we.exercise?.nameUk || we.exercise?.name || we.exerciseId;
      if (!exerciseCounts[we.exerciseId]) {
        exerciseCounts[we.exerciseId] = { name, count: 0, totalVolume: 0 };
      }
      exerciseCounts[we.exerciseId].count++;
      const exerciseVolume = we.sets?.reduce((sum, s) => {
        return sum + ((s.weight || 0) * (s.reps || 0));
      }, 0) || 0;
      exerciseCounts[we.exerciseId].totalVolume += exerciseVolume;
    });
  });
  
  return Object.values(exerciseCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getWorkoutHeatmap(weeks: number = 12) {
  const workouts = getWorkouts();
  const now = new Date();
  const heatmap: { date: string; count: number; day: number }[] = [];
  
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const count = workouts.filter(w => w.date === dateStr).length;
    heatmap.push({ date: dateStr, count, day: date.getDay() });
  }
  
  return heatmap;
}

export function getVolumeTrend(weeks: number = 12) {
  const workouts = getWorkouts();
  const now = new Date();
  const trend: { week: string; volume: number; workouts: number; avgVolume: number }[] = [];
  
  for (let w = weeks - 1; w >= 0; w--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - w * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    
    const weekWorkouts = workouts.filter(wd => {
      const d = new Date(wd.date);
      return d >= weekStart && d <= weekEnd;
    });
    
    const volume = weekWorkouts.reduce((sum, wd) => sum + (wd.totalVolume || 0), 0);
    const count = weekWorkouts.length;
    
    const weekNum = Math.ceil(((weekEnd.getTime() - new Date(weekEnd.getFullYear(), 0, 1).getTime()) / 604800000));
    trend.push({
      week: `Т${weekNum}`,
      volume,
      workouts: count,
      avgVolume: count > 0 ? Math.round(volume / count) : 0,
    });
  }
  
  return trend;
}

export function getRecentPRs(limit: number = 5) {
  const records = getBodyRecords();
  const history = getAllBodyRecordHistories();
  const prs: { exercise: string; value: number; unit: "reps" | "seconds"; date: string; icon: string }[] = [];
  
  const icons: Record<string, string> = {
    pull_ups: "💪", push_ups: "🫸", dips: "🫷", plank: "🧘",
    burpees: "🔥", squats: "🦵", sit_ups: "🎯",
    hanging_leg_raises: "🦿", hanging_crunches: "🦾",
  };
  
  history.forEach(h => {
    const entries = h.entries;
    if (entries.length === 0) return;
    
    const latest = entries[entries.length - 1];
    const previous = entries.length > 1 ? entries[entries.length - 2] : null;
    
    if (previous && latest.value > previous.value) {
      prs.push({
        exercise: getBodyRecordLabel(h.exerciseId),
        value: latest.value,
        unit: latest.unit,
        date: latest.date,
        icon: icons[h.exerciseId] || "🏅",
      });
    }
  });
  
  return prs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ===== User Workout Templates =====

export function getUserTemplates(): UserWorkoutTemplate[] {
  return get<UserWorkoutTemplate[]>(STORAGE_KEYS.USER_TEMPLATES, []);
}

export function saveUserTemplate(template: Omit<UserWorkoutTemplate, "id" | "createdAt">): UserWorkoutTemplate {
  const templates = getUserTemplates();
  const newTemplate: UserWorkoutTemplate = {
    ...template,
    id: `tpl-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  templates.unshift(newTemplate);
  set(STORAGE_KEYS.USER_TEMPLATES, templates);
  return newTemplate;
}

export function deleteUserTemplate(id: string): void {
  const templates = getUserTemplates().filter(t => t.id !== id);
  set(STORAGE_KEYS.USER_TEMPLATES, templates);
}

export function updateUserTemplate(id: string, updates: Partial<UserWorkoutTemplate>): void {
  const templates = getUserTemplates().map(t => t.id === id ? { ...t, ...updates } : t);
  set(STORAGE_KEYS.USER_TEMPLATES, templates);
}

// ===== Clear all data =====

export function clearAllData(): void {
  if (typeof window === "undefined") return;
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
  // Write empty defaults so getProfile/getProgress don't fall back to demo data
  saveProfile({
    id: "local-user",
    name: "",
    email: "",
    fitnessLevel: "beginner",
    goal: "strength",
    availableEquipment: [],
    injuries: [],
    measurements: [],
  });
  saveProgress({
    xp: 0,
    level: "beginner",
    streak: 0,
    maxStreak: 0,
    streakFreezes: 0,
    workoutsThisWeek: 0,
    weeklyGoal: 4,
  });
  saveBodyRecords([]);
  saveBodyRecordsHistory([]);
}
