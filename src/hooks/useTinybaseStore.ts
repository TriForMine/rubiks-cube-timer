/**
 * React hook for TinyBase store integration
 * Provides reactive access to cube timer data with clean API
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRow, useTable, useValues } from "tinybase/ui-react";
import {
	type AchievementRecord,
	addTime,
	type BackupData,
	clearAllData,
	type DailyProgressRecord,
	deleteTime,
	exportData,
	getStore,
	hasAchievementBeenShown,
	hasLevelUpBeenShown,
	importData,
	initializeStore,
	markAchievementShown,
	markLevelUpShown,
	recordAchievement,
	type TimeRecord,
	type UserStatsRecord,
	updateDailyGoal,
	updateDailyProgress,
	updateStreakGoal,
	updateTimePenalty,
	updateUserLevel,
} from "@/lib/tinybase-storage";

export interface SessionStats {
	count: number;
	bestTime: number | null;
	avgTime: number | null;
	dailyProgress: {
		date: string;
		solveCount: number;
		totalTime: number;
		bestTime: number | null;
		goalMet: boolean;
	} | null;
	currentStreak: number;
}

export interface TinybaseStoreHook {
	// Data (reactive)
	times: Array<{
		id: string;
		time: number;
		scramble: string;
		date: Date;
		penalty?: "DNF" | "+2";
	}>;
	userStats: UserStatsRecord;
	achievements: AchievementRecord[];
	dailyProgress: DailyProgressRecord[];
	userLevel: string;
	currentStreak: number;
	longestStreak: number;
	dailyGoal: number;
	streakGoal: number;

	// Computed data
	sessionStats: SessionStats;

	// Actions
	addNewTime: (timeRecord: {
		id: string;
		time: number;
		scramble: string;
		date: Date;
		penalty?: "DNF" | "+2";
	}) => void;
	removeTime: (timeId: string) => void;
	updateTimeWithPenalty: (timeId: string, penalty: "DNF" | "+2" | undefined) => void;
	addAchievement: (achievementId: string) => boolean;
	markAchievementAsShown: (achievementId: string) => void;
	checkAchievementShown: (achievementId: string) => boolean;
	setUserLevel: (level: string) => void;
	markLevelUpAsShown: (level: string) => void;
	checkLevelUpShown: (level: string) => boolean;
	recordDailyProgress: (time: number) => void;
	setDailyGoal: (goal: number) => void;
	setStreakGoal: (goal: number) => void;

	// Backup/Restore
	exportAllData: () => BackupData;
	importAllData: (backup: BackupData) => Promise<void>;
	clearAllUserData: () => Promise<void>;

	// Status
	isLoading: boolean;
	isInitialized: boolean;
	error: string | null;
}

export function useTinybaseStore(): TinybaseStoreHook {
	const [isLoading, setIsLoading] = useState(true);
	const [isInitialized, setIsInitialized] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Initialize store
	useEffect(() => {
		let mounted = true;

		const initialize = async () => {
			try {
				setIsLoading(true);
				setError(null);

				await initializeStore();

				if (mounted) {
					setIsInitialized(true);
					setIsLoading(false);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err.message : "Failed to initialize store");
					setIsLoading(false);
				}
			}
		};

		initialize();

		return () => {
			mounted = false;
		};
	}, []);

	// Get store instance (only when initialized)
	const store = useMemo(() => {
		if (!isInitialized) return null;
		try {
			return getStore();
		} catch {
			return null;
		}
	}, [isInitialized]);

	// Reactive data hooks (only when store is available)
	const timesTable = useTable("times", store || undefined);
	const userStatsRow = useRow("user_stats", "current", store || undefined);
	const achievementsTable = useTable("achievements", store || undefined);
	const dailyProgressTable = useTable("daily_progress", store || undefined);
	const storeValues = useValues(store || undefined);

	// Transform data to application format
	const times = useMemo(() => {
		if (!timesTable || !isInitialized) return [];

		return Object.entries(timesTable)
			.map(([id, data]: [string, any]) => ({
				id,
				time: Number(data.time),
				scramble: String(data.scramble),
				date: new Date(Number(data.date)),
				penalty: (data.penalty as "DNF" | "+2") || undefined,
			}))
			.sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [timesTable, isInitialized]);

	const userStats = useMemo((): UserStatsRecord => {
		if (!userStatsRow || !isInitialized) {
			return {
				id: "current",
				best_time: null,
				best_ao5: null,
				best_ao12: null,
				best_ao50: null,
				best_ao100: null,
				total_solve_count: 0,
				last_solve_date: null,
				solve_streak: 0,
			};
		}
		const stats = userStatsRow as any;
		return {
			id: "current",
			best_time: stats.best_time,
			best_ao5: stats.best_ao5,
			best_ao12: stats.best_ao12,
			best_ao50: stats.best_ao50,
			best_ao100: stats.best_ao100,
			total_solve_count: Number(stats.total_solve_count || 0),
			last_solve_date: stats.last_solve_date,
			solve_streak: Number(stats.solve_streak || 0),
		};
	}, [userStatsRow, isInitialized]);

	const achievements = useMemo(() => {
		if (!achievementsTable || !isInitialized) return [];

		return Object.entries(achievementsTable).map(([id, data]: [string, any]) => ({
			id,
			achieved_at: Number(data.achieved_at),
			shown: Boolean(data.shown),
		}));
	}, [achievementsTable, isInitialized]);

	const dailyProgress = useMemo(() => {
		if (!dailyProgressTable || !isInitialized) return [];

		return Object.entries(dailyProgressTable)
			.map(([date, data]: [string, any]) => ({
				date,
				solve_count: Number(data.solve_count || 0),
				total_time: Number(data.total_time || 0),
				best_time: data.best_time ? Number(data.best_time) : null,
				goal_met: Boolean(data.goal_met),
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}, [dailyProgressTable, isInitialized]);

	// Extract values with type safety
	const userLevel = String(storeValues?.user_level || "Absolute Beginner");
	const currentStreak = Number(storeValues?.current_streak || 0);
	const longestStreak = Number(storeValues?.longest_streak || 0);
	const dailyGoal = Number(storeValues?.daily_goal || 10);
	const streakGoal = Number(storeValues?.streak_goal || 7);

	// Session stats calculation
	const sessionStats = useMemo((): SessionStats => {
		const validTimes = times.filter((t) => t.penalty !== "DNF");
		const effectiveTimes = validTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));

		const today = new Date().toISOString().split("T")[0];
		const todayProgress = dailyProgress.find((p) => p.date === today);

		return {
			count: times.length,
			bestTime: effectiveTimes.length > 0 ? Math.min(...effectiveTimes) : null,
			avgTime:
				effectiveTimes.length > 0
					? effectiveTimes.reduce((sum, time) => sum + time, 0) / effectiveTimes.length
					: null,
			dailyProgress: todayProgress
				? {
						date: todayProgress.date,
						solveCount: todayProgress.solve_count,
						totalTime: todayProgress.total_time,
						bestTime: todayProgress.best_time,
						goalMet: todayProgress.goal_met,
					}
				: null,
			currentStreak,
		};
	}, [times, dailyProgress, currentStreak]);

	// Action handlers
	const addNewTime = useCallback(
		(timeRecord: {
			id: string;
			time: number;
			scramble: string;
			date: Date;
			penalty?: "DNF" | "+2";
		}) => {
			if (!isInitialized) return;
			try {
				// Convert Date to timestamp for storage
				const storageRecord: TimeRecord = {
					...timeRecord,
					date: timeRecord.date.getTime(),
				};
				addTime(storageRecord);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to add time");
			}
		},
		[isInitialized]
	);

	const removeTime = useCallback(
		(timeId: string) => {
			if (!isInitialized) return;
			try {
				deleteTime(timeId);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to delete time");
			}
		},
		[isInitialized]
	);

	const updateTimeWithPenalty = useCallback(
		(timeId: string, penalty: "DNF" | "+2" | undefined) => {
			if (!isInitialized) return;
			try {
				updateTimePenalty(timeId, penalty);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to update penalty");
			}
		},
		[isInitialized]
	);

	const addAchievement = useCallback(
		(achievementId: string): boolean => {
			if (!isInitialized) return false;
			try {
				return recordAchievement(achievementId);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to record achievement");
				return false;
			}
		},
		[isInitialized]
	);

	const markAchievementAsShown = useCallback(
		(achievementId: string) => {
			if (!isInitialized) return;
			try {
				markAchievementShown(achievementId);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to mark achievement as shown");
			}
		},
		[isInitialized]
	);

	const checkAchievementShown = useCallback(
		(achievementId: string): boolean => {
			if (!isInitialized) return false;
			try {
				return hasAchievementBeenShown(achievementId);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to check achievement status");
				return false;
			}
		},
		[isInitialized]
	);

	const setUserLevel = useCallback(
		(level: string) => {
			if (!isInitialized) return;
			try {
				updateUserLevel(level);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to update user level");
			}
		},
		[isInitialized]
	);

	const markLevelUpAsShown = useCallback(
		(level: string) => {
			if (!isInitialized) return;
			try {
				markLevelUpShown(level);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to mark level up as shown");
			}
		},
		[isInitialized]
	);

	const checkLevelUpShown = useCallback(
		(level: string): boolean => {
			if (!isInitialized) return false;
			try {
				return hasLevelUpBeenShown(level);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to check level up status");
				return false;
			}
		},
		[isInitialized]
	);

	const recordDailyProgress = useCallback(
		(time: number) => {
			if (!isInitialized) return;
			try {
				updateDailyProgress(time);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to update daily progress");
			}
		},
		[isInitialized]
	);

	const setDailyGoal = useCallback(
		(goal: number) => {
			if (!isInitialized) return;
			try {
				updateDailyGoal(goal);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to update daily goal");
			}
		},
		[isInitialized]
	);

	const setStreakGoal = useCallback(
		(goal: number) => {
			if (!isInitialized) return;
			try {
				updateStreakGoal(goal);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to update streak goal");
			}
		},
		[isInitialized]
	);

	const exportAllData = useCallback((): BackupData => {
		if (!isInitialized) {
			throw new Error("Store not initialized");
		}
		try {
			return exportData();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to export data";
			setError(message);
			throw new Error(message);
		}
	}, [isInitialized]);

	const importAllData = useCallback(
		async (backup: BackupData): Promise<void> => {
			if (!isInitialized) return;
			try {
				await importData(backup);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to import data";
				setError(message);
				throw new Error(message);
			}
		},
		[isInitialized]
	);

	const clearAllUserData = useCallback(async (): Promise<void> => {
		if (!isInitialized) return;
		try {
			await clearAllData();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to clear data");
		}
	}, [isInitialized]);

	return {
		// Data
		times,
		userStats,
		achievements,
		dailyProgress,
		userLevel,
		currentStreak,
		longestStreak,
		dailyGoal,
		streakGoal,
		sessionStats,

		// Actions
		addNewTime,
		removeTime,
		updateTimeWithPenalty,
		addAchievement,
		markAchievementAsShown,
		checkAchievementShown,
		setUserLevel,
		markLevelUpAsShown,
		checkLevelUpShown,
		recordDailyProgress,
		setDailyGoal,
		setStreakGoal,

		// Backup/Restore
		exportAllData,
		importAllData,
		clearAllUserData,

		// Status
		isLoading,
		isInitialized,
		error,
	};
}
