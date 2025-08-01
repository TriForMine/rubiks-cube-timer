"use client";

import { Flame, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useTinybaseStore } from "@/hooks/useTinybaseStore";
import { cn } from "@/lib/utils";

interface DailyProgressProps {
	className?: string;
	sessionStats?: {
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
	};
}

export function DailyProgress({ className, sessionStats }: DailyProgressProps) {
	const { dailyGoal, currentStreak, dailyProgress } = useTinybaseStore();

	// Get today's progress
	const today = new Date().toISOString().split("T")[0];
	const todayProgressFromStore = dailyProgress.find((p) => p.date === today);

	// Ensure all values are valid numbers
	const safeDailyGoal = Math.max(1, Number(dailyGoal) || 10);
	const solveCount = Math.max(
		0,
		Number(sessionStats?.dailyProgress?.solveCount) ||
			Number(todayProgressFromStore?.solve_count) ||
			0
	);
	const goalMet = Boolean(
		sessionStats?.dailyProgress?.goalMet || todayProgressFromStore?.goal_met || false
	);
	const streakCount = Math.max(
		0,
		Number(sessionStats?.currentStreak) || Number(currentStreak) || 0
	);

	const progressPercentage = Math.max(0, Math.min((solveCount / safeDailyGoal) * 100, 100));

	const getStreakStatusColor = () => {
		if (streakCount === 0) return "text-muted-foreground";
		if (goalMet) return "text-green-600 dark:text-green-400";
		return "text-orange-600 dark:text-orange-400";
	};

	const getStreakStatusText = () => {
		if (streakCount === 0) {
			return "Start your streak!";
		}
		if (goalMet) {
			return "Goal completed!";
		}
		return "Keep going!";
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
						{goalMet && (
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
						{solveCount}/{safeDailyGoal}
					</span>
				</div>
				<Progress
					value={progressPercentage}
					className="h-1.5 bg-blue-100 dark:bg-blue-900"
					indicatorClassName="bg-blue-600 dark:bg-blue-400"
				/>
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
							{streakCount} day{streakCount !== 1 ? "s" : ""}
						</div>
						<div className={cn("text-xs", getStreakStatusColor())}>{getStreakStatusText()}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
