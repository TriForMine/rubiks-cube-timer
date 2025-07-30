"use client";

import { useEffect } from "react";
import type { TimeRecord } from "@/app/page";
import { useUserProgress } from "@/contexts/UserProgressContext";

// Achievement definitions (same as in Achievements.tsx)
const ACHIEVEMENTS = [
	{
		id: "first_solve",
		name: "First Steps",
		description: "Complete your first timed solve",
		criteria: (times: TimeRecord[]) => times.length >= 1,
		tier: "bronze" as const,
	},
	{
		id: "five_solves",
		name: "Getting Started",
		description: "Complete 5 timed solves",
		criteria: (times: TimeRecord[]) => times.length >= 5,
		tier: "bronze" as const,
	},
	{
		id: "fifty_solves",
		name: "Dedicated",
		description: "Complete 50 solves",
		criteria: (times: TimeRecord[]) => times.length >= 50,
		tier: "silver" as const,
	},
	{
		id: "hundred_solves",
		name: "Century",
		description: "Complete 100 solves",
		criteria: (times: TimeRecord[]) => times.length >= 100,
		tier: "gold" as const,
	},
	{
		id: "sub_five_minutes",
		name: "First Milestone",
		description: "Record a solve under 5 minutes",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 300000
			),
		tier: "bronze" as const,
	},
	{
		id: "sub_three_minutes",
		name: "Getting Faster",
		description: "Record a solve under 3 minutes",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 180000
			),
		tier: "bronze" as const,
	},
	{
		id: "sub_minute",
		name: "Sub-Minute Solver",
		description: "Record a solve under 1 minute",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 60000
			),
		tier: "silver" as const,
	},
	{
		id: "sub_thirty",
		name: "Speed Demon",
		description: "Record a solve under 30 seconds",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 30000
			),
		tier: "gold" as const,
	},
	{
		id: "sub_twenty",
		name: "Lightning Fast",
		description: "Record a solve under 20 seconds",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 20000
			),
		tier: "gold" as const,
	},
	{
		id: "sub_ten",
		name: "Speedcubing Master",
		description: "Record a solve under 10 seconds",
		criteria: (times: TimeRecord[]) =>
			times.some(
				(t) => t.penalty !== "DNF" && (t.penalty === "+2" ? t.time + 2000 : t.time) < 10000
			),
		tier: "diamond" as const,
	},
	{
		id: "consistent_five",
		name: "Consistent",
		description: "Complete 5 solves with less than 5 second difference between fastest and slowest",
		criteria: (times: TimeRecord[]) => {
			if (times.length < 5) return false;
			const last5 = times.slice(0, 5).filter((t) => t.penalty !== "DNF");
			if (last5.length < 5) return false;

			const adjustedTimes = last5.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));
			const min = Math.min(...adjustedTimes);
			const max = Math.max(...adjustedTimes);
			return max - min < 5000; // Less than 5 seconds difference
		},
		tier: "silver" as const,
	},
	{
		id: "no_dnf_streak",
		name: "Flawless",
		description: "Complete 10 consecutive solves without a DNF",
		criteria: (times: TimeRecord[]) => {
			if (times.length < 10) return false;
			return !times.slice(0, 10).some((t) => t.penalty === "DNF");
		},
		tier: "gold" as const,
	},
	{
		id: "improved_pb",
		name: "Personal Best",
		description: "Beat your previous best time by at least 1 second",
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
		tier: "gold" as const,
	},
	{
		id: "dedicated_session",
		name: "Dedication",
		description: "Complete 25 solves in a single session",
		criteria: (times: TimeRecord[]) => times.length >= 25,
		tier: "silver" as const,
	},
];

interface AchievementCheckerProps {
	times: TimeRecord[];
}

export function AchievementChecker({ times }: AchievementCheckerProps) {
	const { recordAchievement, checkAchievement, isLoading } = useUserProgress();

	useEffect(() => {
		if (isLoading) return;

		// Check all achievements
		ACHIEVEMENTS.forEach((achievement) => {
			if (achievement.criteria(times) && !checkAchievement(achievement.id)) {
				recordAchievement({
					id: achievement.id,
					name: achievement.name,
					description: achievement.description,
					tier: achievement.tier,
					icon: null, // Will be handled by the context
				});
			}
		});
	}, [times, recordAchievement, checkAchievement, isLoading]);

	// This component doesn't render anything
	return null;
}
