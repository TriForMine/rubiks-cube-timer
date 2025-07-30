"use client";

import {
	BadgeCheck,
	BarChart,
	Clock,
	Flame,
	Medal,
	Sparkles,
	Star,
	Swords,
	Trophy,
	Zap,
} from "lucide-react";
import { useMemo } from "react";
import type { TimeRecord } from "@/app/page";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Achievement } from "@/contexts/UserProgressContext";
import { useUserProgress } from "@/contexts/UserProgressContext";
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
