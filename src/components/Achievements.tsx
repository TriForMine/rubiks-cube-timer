"use client";

import {
	BadgeCheck,
	BarChart,
	Calendar,
	Clock,
	Flame,
	Medal,
	Sparkles,
	Star,
	Swords,
	Target,
	TrendingUp,
	Trophy,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import type { TimeRecord } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Achievement } from "@/contexts/UserProgressContext";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { getCurrentStreakStatus, getWeeklyProgress, loadDailySettings } from "@/lib/storage";
import { cn } from "@/lib/utils";

// Extended achievement type for internal use (includes criteria function)
interface AchievementWithCriteria {
	id: string;
	name: string;
	description: string;
	tier: "bronze" | "silver" | "gold" | "diamond";
	icon: React.ReactNode;
	criteria: (times: TimeRecord[]) => boolean;
}

// Achievement definitions
const ACHIEVEMENTS: AchievementWithCriteria[] = [
	{
		id: "first_solve",
		name: "First Steps",
		description: "Complete your first timed solve",
		icon: <Medal className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) => times.length >= 1,
		tier: "bronze",
	},
	{
		id: "five_solves",
		name: "Getting Started",
		description: "Complete 5 timed solves",
		icon: <Medal className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) => times.length >= 5,
		tier: "bronze",
	},
	{
		id: "fifty_solves",
		name: "Dedicated",
		description: "Complete 50 solves",
		icon: <Medal className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) => times.length >= 50,
		tier: "silver",
	},
	{
		id: "hundred_solves",
		name: "Century",
		description: "Complete 100 solves",
		icon: <Medal className="w-5 h-5 text-gold-500" />,
		criteria: (times: TimeRecord[]) => times.length >= 100,
		tier: "gold",
	},
	{
		id: "sub_five_minutes",
		name: "First Milestone",
		description: "Record a solve under 5 minutes",
		icon: <Clock className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 300000
			),
		tier: "bronze",
	},
	{
		id: "sub_three_minutes",
		name: "Getting Faster",
		description: "Record a solve under 3 minutes",
		icon: <Clock className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 180000
			),
		tier: "bronze",
	},
	{
		id: "sub_minute",
		name: "Sub-Minute Solver",
		description: "Record a solve under 1 minute",
		icon: <Clock className="w-5 h-5 text-blue-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 60000
			),
		tier: "silver",
	},
	{
		id: "sub_thirty",
		name: "Speed Demon",
		description: "Record a solve under 30 seconds",
		icon: <Flame className="w-5 h-5 text-orange-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 30000
			),
		tier: "gold",
	},
	{
		id: "sub_twenty",
		name: "Lightning Fast",
		description: "Record a solve under 20 seconds",
		icon: <Zap className="w-5 h-5 text-yellow-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 20000
			),
		tier: "gold",
	},
	{
		id: "sub_ten",
		name: "Speedcubing Master",
		description: "Record a solve under 10 seconds",
		icon: <Sparkles className="w-5 h-5 text-purple-500" />,
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 10000
			),
		tier: "diamond",
	},
	{
		id: "consistent_five",
		name: "Consistent",
		description: "Complete 5 solves with less than 5 second difference between fastest and slowest",
		icon: <BarChart className="w-5 h-5 text-green-500" />,
		criteria: (times: TimeRecord[]) => {
			if (times.length < 5) return false;
			const last5 = times.slice(0, 5).filter((t) => t.penalty !== "DNF");
			if (last5.length < 5) return false;

			const adjustedTimes = last5.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));
			const min = Math.min(...adjustedTimes);
			const max = Math.max(...adjustedTimes);
			return max - min < 5000; // Less than 5 seconds difference
		},
		tier: "silver",
	},
	{
		id: "no_dnf_streak",
		name: "Flawless",
		description: "Complete 10 consecutive solves without a DNF",
		icon: <BadgeCheck className="w-5 h-5 text-emerald-500" />,
		criteria: (times: TimeRecord[]) => {
			if (times.length < 10) return false;
			return !times.slice(0, 10).some((t) => t.penalty === "DNF");
		},
		tier: "gold",
	},

	// Daily Practice Achievements
	{
		id: "first_daily_goal",
		name: "Daily Dedication",
		description: "Complete your daily goal for the first time",
		icon: <Target className="w-5 h-5 text-blue-500" />,
		criteria: (_times: TimeRecord[]) => {
			const weeklyProgress = getWeeklyProgress();
			return weeklyProgress.some((day) => day.goalMet);
		},
		tier: "bronze",
	},
	{
		id: "three_day_streak",
		name: "Building Habits",
		description: "Maintain a 3-day solving streak",
		icon: <Flame className="w-5 h-5 text-orange-500" />,
		criteria: (_times: TimeRecord[]) => {
			const streakStatus = getCurrentStreakStatus();
			return streakStatus.currentStreak >= 3;
		},
		tier: "bronze",
	},
	{
		id: "seven_day_streak",
		name: "Week Warrior",
		description: "Maintain a 7-day solving streak",
		icon: <Flame className="w-5 h-5 text-orange-600" />,
		criteria: (_times: TimeRecord[]) => {
			const streakStatus = getCurrentStreakStatus();
			return streakStatus.currentStreak >= 7;
		},
		tier: "silver",
	},
	{
		id: "fourteen_day_streak",
		name: "Fortnight Fighter",
		description: "Maintain a 14-day solving streak",
		icon: <Flame className="w-5 h-5 text-red-500" />,
		criteria: (_times: TimeRecord[]) => {
			const streakStatus = getCurrentStreakStatus();
			return streakStatus.currentStreak >= 14;
		},
		tier: "gold",
	},
	{
		id: "thirty_day_streak",
		name: "Monthly Master",
		description: "Maintain a 30-day solving streak",
		icon: <Flame className="w-5 h-5 text-purple-600" />,
		criteria: (_times: TimeRecord[]) => {
			const streakStatus = getCurrentStreakStatus();
			return streakStatus.currentStreak >= 30;
		},
		tier: "diamond",
	},
	{
		id: "perfect_week",
		name: "Perfect Week",
		description: "Meet your daily goal every day for a week",
		icon: <Calendar className="w-5 h-5 text-green-500" />,
		criteria: (_times: TimeRecord[]) => {
			const weeklyProgress = getWeeklyProgress();
			return weeklyProgress.length === 7 && weeklyProgress.every((day) => day.goalMet);
		},
		tier: "gold",
	},
	{
		id: "overachiever",
		name: "Overachiever",
		description: "Complete double your daily goal in a single day",
		icon: <Zap className="w-5 h-5 text-yellow-500" />,
		criteria: (_times: TimeRecord[]) => {
			const dailySettings = loadDailySettings();
			const streakStatus = getCurrentStreakStatus();
			const todayProgress = streakStatus.todayProgress;
			return todayProgress ? todayProgress.solveCount >= dailySettings.dailyGoal * 2 : false;
		},
		tier: "silver",
	},
	{
		id: "consistent_improver",
		name: "Consistent Improver",
		description: "Set a new personal best during a 7+ day streak",
		icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
		criteria: (times: TimeRecord[]) => {
			const streakStatus = getCurrentStreakStatus();
			if (streakStatus.currentStreak < 7) return false;

			// Check if any PB was set in the current streak period
			const today = new Date().toISOString().split("T")[0];
			const streakStartDate = new Date(today);
			streakStartDate.setDate(streakStartDate.getDate() - streakStatus.currentStreak + 1);
			const streakStartString = streakStartDate.toISOString().split("T")[0];

			const timesInStreak = times.filter((t) => {
				const timeDate = t.date.toISOString().split("T")[0];
				return timeDate >= streakStartString;
			});

			if (timesInStreak.length === 0) return false;

			const validTimesInStreak = timesInStreak.filter((t) => t.penalty !== "DNF");
			const bestTimeInStreak = Math.min(
				...validTimesInStreak.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
			);

			const allValidTimes = times.filter((t) => t.penalty !== "DNF");
			const overallBestTime = Math.min(
				...allValidTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
			);

			return bestTimeInStreak === overallBestTime;
		},
		tier: "gold",
	},
	{
		id: "improved_pb",
		name: "Personal Best",
		description: "Beat your previous best time by at least 1 second",
		icon: <Trophy className="w-5 h-5 text-amber-500" />,
		criteria: (times: TimeRecord[]) => {
			if (times.length < 2) return false;

			const validTimes = times
				.filter((t) => t.penalty !== "DNF")
				.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));

			if (validTimes.length < 2) return false;

			const bestTime = Math.min(...validTimes);
			const secondBestTime = validTimes.sort((a, b) => a - b)[1];
			return secondBestTime - bestTime >= 1000; // At least 1 second improvement
		},
		tier: "gold",
	},
	{
		id: "dedicated_session",
		name: "Dedication",
		description: "Complete 25 solves in a single session",
		icon: <Swords className="w-5 h-5 text-indigo-500" />,
		criteria: (times: TimeRecord[]) => times.length >= 25,
		tier: "silver",
	},
];

interface AchievementsProps {
	times: TimeRecord[];
	compact?: boolean;
	className?: string;
}

export function Achievements({ times, compact = false, className }: AchievementsProps) {
	const { recordAchievement, checkAchievement, isLoading } = useUserProgress();

	// Calculate achievements
	const achievements = useMemo(() => {
		const result = ACHIEVEMENTS.map((achievement) => ({
			...achievement,
			achieved: achievement.criteria(times),
		}));

		// Check for newly achieved achievements
		if (!isLoading) {
			result.forEach((achievement) => {
				if (achievement.achieved && !checkAchievement(achievement.id)) {
					const achievementRecord: Achievement = {
						id: achievement.id,
						name: achievement.name,
						description: achievement.description,
						tier: achievement.tier,
						icon: achievement.icon,
					};
					recordAchievement(achievementRecord);
				}
			});
		}

		return result;
	}, [times, recordAchievement, checkAchievement, isLoading]);

	const achievedCount = achievements.filter((a) => a.achieved).length;

	// For compact mode, only show summary
	if (compact) {
		return (
			<Card
				className={cn(
					"border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-950/20",
					className
				)}
			>
				<CardContent className="p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Trophy className="w-5 h-5 text-amber-500" />
							<h3 className="font-semibold">Achievements</h3>
						</div>
						<Badge
							variant="outline"
							className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
						>
							<Star className="w-3 h-3 mr-1" />
							{achievedCount}/{achievements.length}
						</Badge>
					</div>

					{/* Show most recent achievements */}
					{achievedCount > 0 && (
						<div className="mt-3 space-y-2">
							<p className="text-xs text-muted-foreground">Recent achievements:</p>
							<div className="grid grid-cols-2 gap-2">
								{achievements
									.filter((a) => a.achieved)
									.slice(0, 2)
									.map((achievement) => (
										<div
											key={achievement.id}
											className="flex items-center gap-2 text-sm p-2 rounded-md bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50"
										>
											{achievement.icon}
											<span className="text-xs font-medium truncate">{achievement.name}</span>
										</div>
									))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}

	// Full achievements display
	return (
		<Card
			className={cn(
				"shadow-lg border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-950/20",
				className
			)}
		>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl border border-amber-500/20">
							<Trophy className="w-5 h-5 text-amber-500" />
						</div>
						<div>
							<CardTitle className="text-lg font-bold">Achievements</CardTitle>
							<p className="text-sm text-muted-foreground">
								Your cubing milestones and accomplishments
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge
							variant="outline"
							className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
						>
							<Star className="w-3 h-3 mr-1" />
							{achievedCount}/{achievements.length}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{achievements.map((achievement) => (
						<Card
							key={achievement.id}
							className={cn(
								"border transition-all duration-300",
								achievement.achieved
									? "bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20 border-amber-200 dark:border-amber-800"
									: "bg-muted/30 border-border opacity-70"
							)}
						>
							<CardContent className="p-4">
								<div className="flex items-start gap-3">
									<div
										className={cn(
											"flex items-center justify-center w-9 h-9 rounded-lg border",
											achievement.achieved
												? "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800"
												: "bg-muted border-border"
										)}
									>
										{achievement.icon}
									</div>
									<div className="flex-1">
										<div className="flex items-center justify-between">
											<h4
												className={cn(
													"font-bold",
													achievement.achieved
														? "text-amber-700 dark:text-amber-300"
														: "text-muted-foreground"
												)}
											>
												{achievement.name}
											</h4>
											<Badge
												variant={achievement.achieved ? "success" : "outline"}
												className="ml-2"
											>
												{achievement.achieved ? "Achieved" : "Locked"}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
