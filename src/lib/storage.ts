/**
 * Persistent storage utilities for user progress data
 */

import type { TimeRecord } from "@/app/page";

// Storage keys
const STORAGE_KEYS = {
  TIMES: "rubiks-times",
  ACHIEVEMENTS: "rubiks-achievements",
  USER_LEVEL: "rubiks-user-level",
  SHOWN_NOTIFICATIONS: "rubiks-shown-notifications",
  STATISTICS: "rubiks-statistics",
  DAILY_PROGRESS: "rubiks-daily-progress",
};
export interface UserProgress {
  level: string;
  lastUpdateTime: number;
  achievements: string[]; // IDs of achieved achievements
  shownLevelUps: string[]; // List of levels already celebrated
  shownAchievements: string[]; // IDs of achievements already celebrated
}

export interface UserStatistics {
  bestTime: number | null;
  bestAo5: number | null;
  bestAo12: number | null;
  bestAo50: number | null;
  bestAo100: number | null;
  totalSolveCount: number;
  lastSolveDate: string | null;
  solveStreak: number;
}

export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  solveCount: number;
  totalTime: number;
  bestTime: number | null;
  goalMet: boolean;
}

export interface DailySettings {
  dailyGoal: number; // Number of solves per day
  streakGoal: number; // Target streak length
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSolveDate: string | null;
  streakStartDate: string | null;
  dailyProgress: DailyProgress[];
}
/**
 * Load the saved times from local storage
 */
export function loadTimes(): TimeRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const savedTimes = localStorage.getItem(STORAGE_KEYS.TIMES);
    if (savedTimes) {
      return JSON.parse(savedTimes).map((time: TimeRecord) => ({
        ...time,
        date: new Date(time.date),
      }));
    }
  } catch (error) {
    console.error("Error loading times from storage:", error);
  }
  return [];
}

/**
 * Save times to local storage
 */
export function saveTimes(times: TimeRecord[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.TIMES, JSON.stringify(times));
  } catch (error) {
    console.error("Error saving times to storage:", error);
  }
}

/**
 * Load user progress from local storage
 */
export function loadUserProgress(): UserProgress {
  if (typeof window === "undefined") {
    return {
      level: "Absolute Beginner",
      lastUpdateTime: Date.now(),
      achievements: [],
      shownLevelUps: [],
      shownAchievements: [],
    };
  }

  try {
    const savedProgress = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
  } catch (error) {
    console.error("Error loading user progress from storage:", error);
  }

  // Default values if nothing is stored
  return {
    level: "Absolute Beginner",
    lastUpdateTime: Date.now(),
    achievements: [],
    shownLevelUps: [],
    shownAchievements: [],
  };
}

/**
 * Save user progress to local storage
 */
export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(progress));
  } catch (error) {
    console.error("Error saving user progress to storage:", error);
  }
}

/**
 * Update user level in local storage
 */
export function updateUserLevel(level: string): void {
  if (typeof window === "undefined") return;

  try {
    const progress = loadUserProgress();
    progress.level = level;
    progress.lastUpdateTime = Date.now();
    saveUserProgress(progress);
  } catch (error) {
    console.error("Error updating user level in storage:", error);
  }
}

/**
 * Record a new achievement
 */
export function recordAchievement(achievementId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const progress = loadUserProgress();

    // Check if achievement is already recorded
    if (progress.achievements.includes(achievementId)) {
      return false; // Already achieved
    }

    // Add new achievement
    progress.achievements.push(achievementId);
    saveUserProgress(progress);
    return true; // Newly achieved
  } catch (error) {
    console.error("Error recording achievement in storage:", error);
    return false;
  }
}

/**
 * Mark a level up notification as shown
 */
export function markLevelUpShown(level: string): void {
  if (typeof window === "undefined") return;

  try {
    const progress = loadUserProgress();
    if (!progress.shownLevelUps.includes(level)) {
      progress.shownLevelUps.push(level);
      saveUserProgress(progress);
    }
  } catch (error) {
    console.error("Error marking level up as shown:", error);
  }
}

/**
 * Check if a level up notification has been shown
 */
export function hasLevelUpBeenShown(level: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const progress = loadUserProgress();
    return progress.shownLevelUps.includes(level);
  } catch (error) {
    console.error("Error checking if level up has been shown:", error);
    return false;
  }
}

/**
 * Mark an achievement notification as shown
 */
export function markAchievementShown(achievementId: string): void {
  if (typeof window === "undefined") return;

  try {
    const progress = loadUserProgress();
    if (!progress.shownAchievements.includes(achievementId)) {
      progress.shownAchievements.push(achievementId);
      saveUserProgress(progress);
    }
  } catch (error) {
    console.error("Error marking achievement as shown:", error);
  }
}

/**
 * Check if an achievement notification has been shown
 */
export function hasAchievementBeenShown(achievementId: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const progress = loadUserProgress();
    return progress.shownAchievements.includes(achievementId);
  } catch (error) {
    console.error("Error checking if achievement has been shown:", error);
    return false;
  }
}

/**
 * Save user statistics
 */
export function saveUserStatistics(stats: UserStatistics): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.STATISTICS, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving user statistics to storage:", error);
  }
}

/**
 * Load user statistics
 */
export function loadUserStatistics(): UserStatistics {
  if (typeof window === "undefined") {
    return {
      bestTime: null,
      bestAo5: null,
      bestAo12: null,
      bestAo50: null,
      bestAo100: null,
      totalSolveCount: 0,
      lastSolveDate: null,
      solveStreak: 0,
    };
  }

  try {
    const savedStats = localStorage.getItem(STORAGE_KEYS.STATISTICS);
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.error("Error loading user statistics from storage:", error);
  }

  // Default values if nothing is stored
  return {
    bestTime: null,
    bestAo5: null,
    bestAo12: null,
    bestAo50: null,
    bestAo100: null,
    totalSolveCount: 0,
    lastSolveDate: null,
    solveStreak: 0,
  };
}

/**
 * Get today's date in YYYY-MM-DD format
 */
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

/**
 * Load daily settings
 */
export function loadDailySettings(): DailySettings {
  if (typeof window === "undefined") {
    return {
      dailyGoal: 10,
      streakGoal: 7,
    };
  }

  try {
    const saved = localStorage.getItem(
      `${STORAGE_KEYS.DAILY_PROGRESS}-settings`,
    );
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading daily settings:", error);
  }

  return {
    dailyGoal: 10,
    streakGoal: 7,
  };
}

/**
 * Save daily settings
 */
export function saveDailySettings(settings: DailySettings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      `${STORAGE_KEYS.DAILY_PROGRESS}-settings`,
      JSON.stringify(settings),
    );
  } catch (error) {
    console.error("Error saving daily settings:", error);
  }
}

/**
 * Load streak data
 */
export function loadStreakData(): StreakData {
  if (typeof window === "undefined") {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSolveDate: null,
      streakStartDate: null,
      dailyProgress: [],
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading streak data:", error);
  }

  return {
    currentStreak: 0,
    longestStreak: 0,
    lastSolveDate: null,
    streakStartDate: null,
    dailyProgress: [],
  };
}

/**
 * Save streak data
 */
export function saveStreakData(data: StreakData): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving streak data:", error);
  }
}

/**
 * Update daily progress when a new solve is completed
 */
export function updateDailyProgress(time: number): StreakData {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const streakData = loadStreakData();
  const settings = loadDailySettings();

  // Find or create today's progress
  let todayProgress = streakData.dailyProgress.find((p) => p.date === today);
  if (!todayProgress) {
    todayProgress = {
      date: today,
      solveCount: 0,
      totalTime: 0,
      bestTime: null,
      goalMet: false,
    };
    streakData.dailyProgress.push(todayProgress);
  }

  // Update today's progress
  todayProgress.solveCount++;
  todayProgress.totalTime += time;
  if (!todayProgress.bestTime || time < todayProgress.bestTime) {
    todayProgress.bestTime = time;
  }
  todayProgress.goalMet = todayProgress.solveCount >= settings.dailyGoal;

  // Update streak logic
  if (streakData.lastSolveDate === null) {
    // First solve ever
    streakData.currentStreak = 1;
    streakData.streakStartDate = today;
  } else if (streakData.lastSolveDate === today) {
    // Already solved today, no streak change
  } else if (streakData.lastSolveDate === yesterday) {
    // Solved yesterday, continue streak
    streakData.currentStreak++;
  } else {
    // Gap in solving, reset streak
    streakData.currentStreak = 1;
    streakData.streakStartDate = today;
  }

  streakData.lastSolveDate = today;

  // Update longest streak
  if (streakData.currentStreak > streakData.longestStreak) {
    streakData.longestStreak = streakData.currentStreak;
  }

  // Keep only last 30 days of progress
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split("T")[0];

  streakData.dailyProgress = streakData.dailyProgress
    .filter((p) => p.date >= cutoffDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  saveStreakData(streakData);
  return streakData;
}

/**
 * Get current streak status
 */
export function getCurrentStreakStatus(): {
  currentStreak: number;
  isActive: boolean;
  daysUntilBreak: number;
  todayProgress: DailyProgress | null;
} {
  const today = getTodayString();
  const yesterday = getYesterdayString();
  const streakData = loadStreakData();

  const todayProgress =
    streakData.dailyProgress.find((p) => p.date === today) || null;

  // Check if streak is still active
  let isActive = false;
  let daysUntilBreak = 0;

  if (streakData.lastSolveDate === today) {
    isActive = true;
    daysUntilBreak = 0;
  } else if (streakData.lastSolveDate === yesterday) {
    isActive = true;
    daysUntilBreak = 1; // Need to solve today to maintain streak
  } else {
    isActive = false;
    daysUntilBreak = 0;
  }

  return {
    currentStreak: streakData.currentStreak,
    isActive,
    daysUntilBreak,
    todayProgress,
  };
}

/**
 * Get weekly progress (last 7 days)
 */
export function getWeeklyProgress(): DailyProgress[] {
  const streakData = loadStreakData();
  const weeklyProgress: DailyProgress[] = [];

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split("T")[0];

    const existingProgress = streakData.dailyProgress.find(
      (p) => p.date === dateString,
    );
    weeklyProgress.push(
      existingProgress || {
        date: dateString,
        solveCount: 0,
        totalTime: 0,
        bestTime: null,
        goalMet: false,
      },
    );
  }

  return weeklyProgress;
}

/**
 * Clear all stored data
 */
export function clearAllUserData(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.TIMES);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    localStorage.removeItem(STORAGE_KEYS.USER_LEVEL);
    localStorage.removeItem(STORAGE_KEYS.SHOWN_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.STATISTICS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_PROGRESS);
    localStorage.removeItem(`${STORAGE_KEYS.DAILY_PROGRESS}-settings`);
  } catch (error) {
    console.error("Error clearing user data from storage:", error);
  }
}
