/**
 * TinyBase storage system for Rubik's Cube Timer
 * Uses IndexedDB for persistent storage with reactive capabilities
 */

import { createStore } from "tinybase";
import { createIndexedDbPersister } from "tinybase/persisters/persister-indexed-db";

// Type definitions for our data structure
export interface TimeRecord {
	id: string;
	time: number;
	scramble: string;
	date: number; // timestamp
	penalty?: "DNF" | "+2";
}

export interface AchievementRecord {
	id: string;
	achieved_at: number; // timestamp
	shown: boolean;
}

export interface DailyProgressRecord {
	date: string; // YYYY-MM-DD
	solve_count: number;
	total_time: number;
	best_time: number | null;
	goal_met: boolean;
}

export interface UserStatsRecord {
	id: "current";
	best_time: number | null;
	best_ao5: number | null;
	best_ao12: number | null;
	best_ao50: number | null;
	best_ao100: number | null;
	total_solve_count: number;
	last_solve_date: string | null;
	solve_streak: number;
}

// Global store instance
let store: any = null;
let persister: any = null;

/**
 * Initialize the TinyBase store with IndexedDB persistence
 */
export async function initializeStore() {
	if (store) return store;

	// Create the store
	store = createStore();

	// Set default values
	store.setValues({
		user_level: "Absolute Beginner",
		last_update_time: Date.now(),
		shown_levelups: "[]",
		daily_goal: 10,
		streak_goal: 7,
		current_streak: 0,
		longest_streak: 0,
		streak_start_date: null,
	});

	// Initialize default user stats if not exists
	if (!store.getRow("user_stats", "current")) {
		store.setRow("user_stats", "current", {
			best_time: null,
			best_ao5: null,
			best_ao12: null,
			best_ao50: null,
			best_ao100: null,
			total_solve_count: 0,
			last_solve_date: null,
			solve_streak: 0,
		});
	}

	// Set up IndexedDB persistence
	try {
		persister = createIndexedDbPersister(store, "cube-timer-db");
		await persister.load();
		await persister.startAutoSave();
	} catch (error) {
		console.warn("Failed to initialize IndexedDB persistence:", error);
	}

	return store;
}

/**
 * Get the store instance (must be initialized first)
 */
export function getStore() {
	if (!store) {
		throw new Error("Store not initialized. Call initializeStore() first.");
	}
	return store;
}

// Time management functions
export function addTime(timeRecord: TimeRecord): void {
	const store = getStore();
	const { id, penalty, ...data } = timeRecord;

	store.setRow("times", id, {
		...data,
		penalty: penalty || undefined,
	});

	// Update user stats
	updateUserStats();

	// Only update daily progress if it's not a DNF
	if (timeRecord.penalty !== "DNF") {
		updateDailyProgress(timeRecord.time);
	}
}

export function deleteTime(timeId: string): void {
	const store = getStore();
	store.delRow("times", timeId);
	updateUserStats();
}

export function updateTimePenalty(timeId: string, penalty: "DNF" | "+2" | undefined): void {
	const store = getStore();
	if (penalty) {
		store.setCell("times", timeId, "penalty", penalty);
	} else {
		store.delCell("times", timeId, "penalty");
	}
	updateUserStats();
}

export function getAllTimes(): TimeRecord[] {
	const store = getStore();
	const timesTable = store.getTable("times");

	return Object.entries(timesTable)
		.map(([id, data]: [string, any]) => ({
			id,
			time: data.time,
			scramble: data.scramble,
			date: data.date,
			penalty: (data.penalty as "DNF" | "+2") || undefined,
		}))
		.sort((a, b) => b.date - a.date);
}

// Achievement management
export function recordAchievement(achievementId: string): boolean {
	const store = getStore();

	// Check if already achieved
	if (store.getRow("achievements", achievementId)) {
		return false;
	}

	store.setRow("achievements", achievementId, {
		achieved_at: Date.now(),
		shown: false,
	});

	return true;
}

export function markAchievementShown(achievementId: string): void {
	const store = getStore();
	store.setCell("achievements", achievementId, "shown", true);
}

export function hasAchievementBeenShown(achievementId: string): boolean {
	const store = getStore();
	const achievement = store.getRow("achievements", achievementId);
	return achievement?.shown || false;
}

export function getAchievements(): AchievementRecord[] {
	const store = getStore();
	const achievementsTable = store.getTable("achievements");

	return Object.entries(achievementsTable).map(([id, data]: [string, any]) => ({
		id,
		achieved_at: data.achieved_at,
		shown: data.shown,
	}));
}

// User level management
export function updateUserLevel(level: string): void {
	const store = getStore();
	store.setValue("user_level", level);
	store.setValue("last_update_time", Date.now());
}

export function getUserLevel(): string {
	const store = getStore();
	return store.getValue("user_level") || "Absolute Beginner";
}

export function markLevelUpShown(level: string): void {
	const store = getStore();
	const shownLevelups = JSON.parse(store.getValue("shown_levelups") || "[]");
	if (!shownLevelups.includes(level)) {
		shownLevelups.push(level);
		store.setValue("shown_levelups", JSON.stringify(shownLevelups));
	}
}

export function hasLevelUpBeenShown(level: string): boolean {
	const store = getStore();
	const shownLevelups = JSON.parse(store.getValue("shown_levelups") || "[]");
	return shownLevelups.includes(level);
}

// Statistics management
function updateUserStats(): void {
	const store = getStore();
	const times = getAllTimes();
	const validTimes = times.filter((t) => t.penalty !== "DNF");

	if (validTimes.length === 0) {
		return;
	}

	const getEffectiveTime = (time: TimeRecord) =>
		time.penalty === "+2" ? time.time + 2000 : time.time;

	const effectiveTimes = validTimes.map(getEffectiveTime);
	const bestTime = Math.min(...effectiveTimes);

	// Calculate averages
	const calculateAverage = (count: number) => {
		if (validTimes.length < count) return null;
		const recentTimes = effectiveTimes.slice(0, count);
		return recentTimes.reduce((sum, time) => sum + time, 0) / count;
	};

	const stats = {
		best_time: bestTime,
		best_ao5: calculateAverage(5),
		best_ao12: calculateAverage(12),
		best_ao50: calculateAverage(50),
		best_ao100: calculateAverage(100),
		total_solve_count: validTimes.length,
		last_solve_date: times[0] ? new Date(times[0].date).toISOString().split("T")[0] : null,
		solve_streak: calculateSolveStreak(times),
	};

	store.setRow("user_stats", "current", stats);
}

function calculateSolveStreak(times: TimeRecord[]): number {
	if (times.length === 0) return 0;

	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

	const lastSolveDate = times[0] ? new Date(times[0].date).toISOString().split("T")[0] : null;

	if (lastSolveDate !== today && lastSolveDate !== yesterday) {
		return 0;
	}

	// Count consecutive days with solves
	let streak = 0;
	const solvesByDate = new Map<string, number>();

	times.forEach((time) => {
		const date = new Date(time.date).toISOString().split("T")[0];
		solvesByDate.set(date, (solvesByDate.get(date) || 0) + 1);
	});

	const currentDate = new Date();
	while (true) {
		const dateString = currentDate.toISOString().split("T")[0];
		if (solvesByDate.has(dateString)) {
			streak++;
			currentDate.setDate(currentDate.getDate() - 1);
		} else {
			break;
		}
	}

	return streak;
}

export function getUserStats(): UserStatsRecord {
	const store = getStore();
	const stats = store.getRow("user_stats", "current");
	return (
		stats || {
			id: "current",
			best_time: null,
			best_ao5: null,
			best_ao12: null,
			best_ao50: null,
			best_ao100: null,
			total_solve_count: 0,
			last_solve_date: null,
			solve_streak: 0,
		}
	);
}

// Daily progress management
export function updateDailyProgress(time: number): void {
	const store = getStore();
	const today = new Date().toISOString().split("T")[0];
	const dailyGoal = store.getValue("daily_goal") || 10;

	const existing = store.getRow("daily_progress", today);

	const newSolveCount = (existing?.solve_count || 0) + 1;
	const newTotalTime = (existing?.total_time || 0) + time;
	const currentBestTime = existing?.best_time;
	const newBestTime =
		currentBestTime === null || currentBestTime === undefined || time < currentBestTime
			? time
			: currentBestTime;

	store.setRow("daily_progress", today, {
		solve_count: newSolveCount,
		total_time: newTotalTime,
		best_time: newBestTime,
		goal_met: newSolveCount >= dailyGoal,
	});

	// Update streak
	updateStreak();
}

function updateStreak(): void {
	const store = getStore();
	const today = new Date().toISOString().split("T")[0];
	const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];

	const currentStreak = store.getValue("current_streak") || 0;
	const longestStreak = store.getValue("longest_streak") || 0;
	const streakStartDate = store.getValue("streak_start_date");

	const todayProgress = store.getRow("daily_progress", today);
	const yesterdayProgress = store.getRow("daily_progress", yesterday);

	if (!todayProgress) return;

	let newStreak = currentStreak;
	let newStartDate = streakStartDate;

	if (currentStreak === 0 || !streakStartDate) {
		// Starting new streak
		newStreak = 1;
		newStartDate = today;
	} else if (yesterdayProgress && todayProgress.solve_count === 1) {
		// Continuing streak (first solve of today)
		newStreak = currentStreak + 1;
	}

	store.setValue("current_streak", newStreak);
	store.setValue("streak_start_date", newStartDate);

	if (newStreak > longestStreak) {
		store.setValue("longest_streak", newStreak);
	}
}

export function getDailyProgress(days: number = 7): DailyProgressRecord[] {
	const store = getStore();
	const progress: DailyProgressRecord[] = [];

	for (let i = days - 1; i >= 0; i--) {
		const date = new Date();
		date.setDate(date.getDate() - i);
		const dateString = date.toISOString().split("T")[0];

		const dayProgress = store.getRow("daily_progress", dateString);
		progress.push({
			date: dateString,
			solve_count: Number(dayProgress?.solve_count || 0),
			total_time: Number(dayProgress?.total_time || 0),
			best_time: dayProgress?.best_time ? Number(dayProgress.best_time) : null,
			goal_met: Boolean(dayProgress?.goal_met || false),
		});
	}

	return progress;
}

// Settings management
export function updateDailyGoal(goal: number): void {
	const store = getStore();
	store.setValue("daily_goal", goal);
}

export function updateStreakGoal(goal: number): void {
	const store = getStore();
	store.setValue("streak_goal", goal);
}

export function getDailyGoal(): number {
	const store = getStore();
	return store.getValue("daily_goal") || 10;
}

export function getStreakGoal(): number {
	const store = getStore();
	return store.getValue("streak_goal") || 7;
}

export function getCurrentStreak(): number {
	const store = getStore();
	return store.getValue("current_streak") || 0;
}

export function getLongestStreak(): number {
	const store = getStore();
	return store.getValue("longest_streak") || 0;
}

// Backup and restore functions
export interface BackupData {
	version: string;
	timestamp: number;
	exportedAt: string;
	metadata: {
		totalTimes: number;
		totalAchievements: number;
		dailyProgressDays: number;
		userLevel: string;
		currentStreak: number;
		longestStreak: number;
		description: string;
	};
	tables: any;
	values: any;
}

export function exportData(): BackupData {
	const store = getStore();
	const tables = store.getTables();
	const values = store.getValues();

	// Calculate metadata for backup info
	const timesCount = Object.keys(tables.times || {}).length;
	const achievementsCount = Object.keys(tables.achievements || {}).length;
	const dailyProgressCount = Object.keys(tables.daily_progress || {}).length;

	return {
		version: "1.0.0",
		timestamp: Date.now(),
		exportedAt: new Date().toISOString(),
		metadata: {
			totalTimes: timesCount,
			totalAchievements: achievementsCount,
			dailyProgressDays: dailyProgressCount,
			userLevel: String(values.user_level || "Absolute Beginner"),
			currentStreak: Number(values.current_streak || 0),
			longestStreak: Number(values.longest_streak || 0),
			description: `Complete cube timer backup with ${timesCount} solves, ${achievementsCount} achievements, and ${dailyProgressCount} days of progress data.`,
		},
		tables,
		values,
	};
}

export async function importData(backup: BackupData): Promise<void> {
	const store = getStore();

	// Validate backup format
	if (!backup.tables || !backup.values || !backup.version) {
		throw new Error("Invalid backup format");
	}

	// Clear existing data
	store.delTables();
	store.delValues();

	// Import data
	store.setTables(backup.tables);
	store.setValues(backup.values);

	// Force persister to save
	if (persister) {
		await persister.save();
	}
}

export async function clearAllData(): Promise<void> {
	const store = getStore();

	// Clear all data
	store.delTables();
	store.delValues();

	// Reset to defaults
	store.setValues({
		user_level: "Absolute Beginner",
		last_update_time: Date.now(),
		shown_levelups: "[]",
		daily_goal: 10,
		streak_goal: 7,
		current_streak: 0,
		longest_streak: 0,
		streak_start_date: null,
	});

	store.setRow("user_stats", "current", {
		best_time: null,
		best_ao5: null,
		best_ao12: null,
		best_ao50: null,
		best_ao100: null,
		total_solve_count: 0,
		last_solve_date: null,
		solve_streak: 0,
	});

	// Force persister to save
	if (persister) {
		await persister.save();
	}
}
