"use client";

import { Flame, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
	type DailyProgress as DailyProgressType,
	getCurrentStreakStatus,
	loadDailySettings,
} from "@/lib/storage";
import { cn } from "@/lib/utils";

interface DailyProgressProps {
	className?: string;
	sessionStats?: {
		count: number;
		bestTime: number | null;
		avgTime: number | null;
		dailyProgress: DailyProgressType | null;
		currentStreak: number;
	};
}

export function DailyProgress({ className, sessionStats }: DailyProgressProps) {
	const [streakStatus, setStreakStatus] = useState({
		currentStreak: 0,
		isActive: false,
		daysUntilBreak: 0,
		todayProgress: null as DailyProgressType | null,
	});
	const [dailySettings, setDailySettings] = useState({
		dailyGoal: 10,
		streakGoal: 7,
	});

	useEffect(() => {
		const loadData = () => {
			const settings = loadDailySettings();
			setDailySettings(settings);

			if (sessionStats) {
				// Use sessionStats if available (real-time data)
				const todayProgress = sessionStats.dailyProgress;
				const isActive = sessionStats.currentStreak > 0;

				// Calculate days until break based on today's progress
				let daysUntilBreak = 0;
				if (todayProgress && todayProgress.solveCount >= settings.dailyGoal) {
					daysUntilBreak = 0; // Goal met today
				} else if (isActive) {
					daysUntilBreak = 1; // Need to solve today to maintain streak
				}

				setStreakStatus({
					currentStreak: sessionStats.currentStreak,
					isActive: isActive,
					daysUntilBreak: daysUntilBreak,
					todayProgress: sessionStats.dailyProgress,
				});
			} else {
				// Fallback to fetching data
				setStreakStatus(getCurrentStreakStatus());
			}
		};

		loadData();

		// Only set up interval if we don't have sessionStats (fallback mode)
		if (!sessionStats) {
			const interval = setInterval(loadData, 60000);
			return () => clearInterval(interval);
		}
	}, [sessionStats]);

	const todayProgress = streakStatus.todayProgress;
	const progressPercentage = todayProgress
		? Math.min((todayProgress.solveCount / dailySettings.dailyGoal) * 100, 100)
		: 0;

	const getStreakStatusColor = () => {
		if (!streakStatus.isActive) return "text-muted-foreground";
		if (streakStatus.daysUntilBreak === 0) return "text-green-600 dark:text-green-400";
		return "text-orange-600 dark:text-orange-400";
	};

	const getStreakStatusText = () => {
		if (!streakStatus.isActive && streakStatus.currentStreak === 0) {
			return "Start your streak!";
		}
		if (!streakStatus.isActive) {
			return "Streak broken";
		}
		if (streakStatus.daysUntilBreak === 0) {
			return "Active today";
		}
		return "Solve today!";
	};

	return (
		<div className={cn("space-y-3", className)}>
			{/* Daily Goal Progress - Compact */}
			<div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10 rounded-lg p-3 border border-blue-200/20 dark:border-blue-800/20">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<Target className="w-3 h-3 text-blue-600 dark:text-blue-400" />
						<span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
							Today's Goal
						</span>
						{todayProgress?.goalMet && (
							<div className="flex items-center gap-1 px-2 py-0.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full">
								<svg
									className="w-2.5 h-2.5"
									fill="currentColor"
									viewBox="0 0 20 20"
									aria-label="Checkmark"
								>
									<title>Goal completed checkmark</title>
									<path
										fillRule="evenodd"
										d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-xs font-semibold">Done!</span>
							</div>
						)}
					</div>
					<span className="text-xs font-medium text-blue-600 dark:text-blue-400">
						{todayProgress?.solveCount || 0}/{dailySettings.dailyGoal}
					</span>
				</div>
				<Progress value={progressPercentage} className="h-1.5 bg-blue-100 dark:bg-blue-900" />
			</div>

			{/* Current Streak - Compact */}
			<div className="bg-gradient-to-r from-orange-50/30 to-red-50/30 dark:from-orange-950/10 dark:to-red-950/10 rounded-lg p-3 border border-orange-200/20 dark:border-orange-800/20">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<Flame className="w-3 h-3 text-orange-600 dark:text-orange-400" />
						<span className="text-xs font-semibold text-orange-900 dark:text-orange-100">
							Streak
						</span>
					</div>
					<div className="text-right">
						<div className="text-xs font-bold text-orange-600 dark:text-orange-400">
							{streakStatus.currentStreak} day
							{streakStatus.currentStreak !== 1 ? "s" : ""}
						</div>
						<div className={cn("text-xs", getStreakStatusColor())}>{getStreakStatusText()}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
