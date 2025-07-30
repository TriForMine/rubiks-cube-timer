"use client";

import {
	ArrowRight,
	Award,
	BarChart3,
	Calendar,
	ChevronDown,
	ChevronRight,
	Flag,
	Flame,
	Lightbulb,
	LineChart,
	PieChart,
	Target,
	Timer,
	TrendingDown,
	TrendingUp,
	Trophy,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { TimeRecord } from "@/app/page";
import { Achievements } from "@/components/Achievements";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
	StatCard,
} from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserProgress } from "@/contexts/UserProgressContext";
import { calculateStatistics, cn, formatTime } from "@/lib/utils";

// Speed tiers based on average times (in milliseconds)
const SPEED_TIERS = {
	ABSOLUTE_BEGINNER: { max: 300000, label: "Absolute Beginner" }, // 5+ minutes
	BEGINNER: { max: 180000, label: "Beginner" }, // 3-5 minutes
	IMPROVING: { max: 120000, label: "Improving" }, // 2-3 minutes
	NOVICE: { max: 90000, label: "Novice" }, // 1:30-2:00
	CASUAL: { max: 60000, label: "Casual" }, // 1:00-1:30
	INTERMEDIATE: { max: 45000, label: "Intermediate" }, // 45-60s
	ADVANCING: { max: 30000, label: "Advancing" }, // 30-45s
	EXPERIENCED: { max: 20000, label: "Experienced" }, // 20-30s
	ADVANCED: { max: 15000, label: "Advanced" }, // 15-20s
	EXPERT: { max: 10000, label: "Expert" }, // 10-15s
	SPEEDCUBER: { max: 7000, label: "Speedcuber" }, // 7-10s
	COMPETITOR: { max: 0, label: "Competitor" }, // Under 7s
};

// Goals based on user level
const getGoals = (averageTime: number) => {
	let tier = "BEGINNER";

	for (const [key, value] of Object.entries(SPEED_TIERS)) {
		if (averageTime <= value.max) {
			tier = key;
		}
	}

	// Define goals based on current tier
	const goalMap: Record<
		string,
		{
			name: string;
			target: number | null;
			type: string;
			description: string;
			targetTime?: number;
		}[]
	> = {
		ABSOLUTE_BEGINNER: [
			{
				name: "Solve the Cube",
				target: null,
				type: "technique",
				description: "Learn to solve the cube with any method",
			},
			{
				name: "Complete 10 Solves",
				target: 10,
				type: "count",
				description: "Get comfortable with the basic solving steps",
			},
			{
				name: "Under 10 Minutes",
				target: 600000,
				type: "time",
				description: "Complete a solve in under 10 minutes",
			},
		],
		BEGINNER: [
			{
				name: "Sub-3:00 Average",
				target: 180000,
				type: "time",
				description: "Get your average time below 3 minutes",
			},
			{
				name: "Complete 25 Solves",
				target: 25,
				type: "count",
				description: "Build muscle memory with 25 total solves",
			},
			{
				name: "Memorize Basic Method",
				target: null,
				type: "technique",
				description: "Solve without looking at instructions",
			},
		],
		IMPROVING: [
			{
				name: "Sub-2:00 Average",
				target: 120000,
				type: "time",
				description: "Get your average time below 2 minutes",
			},
			{
				name: "Complete 50 Solves",
				target: 50,
				type: "count",
				description: "Practice makes perfect - reach 50 solves",
			},
			{
				name: "Learn Basic Cross",
				target: null,
				type: "technique",
				description: "Master solving the cross efficiently",
			},
		],
		NOVICE: [
			{
				name: "Sub-1:30 Average",
				target: 90000,
				type: "time",
				description: "Get your average time below 1:30",
			},
			{
				name: "Complete 75 Solves",
				target: 75,
				type: "count",
				description: "Keep practicing for consistency",
			},
			{
				name: "Cross on Bottom",
				target: null,
				type: "technique",
				description: "Learn to solve with the cross on the bottom",
			},
		],
		CASUAL: [
			{
				name: "Sub-1:00 Average",
				target: 60000,
				type: "time",
				description: "Get your average time below 1 minute",
			},
			{
				name: "Complete 100 Solves",
				target: 100,
				type: "count",
				description: "Build consistency with 100 solves",
			},
			{
				name: "Learn 4 Look Last Layer",
				target: null,
				type: "technique",
				description: "Start learning basic OLL and PLL algorithms",
			},
		],
		INTERMEDIATE: [
			{
				name: "Sub-45s Average",
				target: 45000,
				type: "time",
				description: "Get your average time below 45 seconds",
			},
			{
				name: "Ao5 under 50s",
				target: 50000,
				type: "ao5",
				description: "Get your average of 5 under 50 seconds",
			},
			{
				name: "Improve F2L",
				target: null,
				type: "technique",
				description: "Start learning more efficient F2L techniques",
			},
		],
		ADVANCING: [
			{
				name: "Sub-30s Average",
				target: 30000,
				type: "time",
				description: "Get your average time below 30 seconds",
			},
			{
				name: "Ao12 under 35s",
				target: 35000,
				type: "ao12",
				description: "Get your average of 12 under 35 seconds",
			},
			{
				name: "Complete 2-Look OLL",
				target: null,
				type: "technique",
				description: "Learn all algorithms for 2-Look OLL",
			},
		],
		EXPERIENCED: [
			{
				name: "Sub-20s Average",
				target: 20000,
				type: "time",
				description: "Get your average time below 20 seconds",
			},
			{
				name: "Complete 500 Solves",
				target: 500,
				type: "count",
				description: "Serious practice: 500 solves",
			},
			{
				name: "Full PLL",
				target: null,
				type: "technique",
				description: "Learn all 21 PLL algorithms",
			},
		],
		ADVANCED: [
			{
				name: "Sub-15s Average",
				target: 15000,
				type: "time",
				description: "Get your average time below 15 seconds",
			},
			{
				name: "Ao100 under 17s",
				target: 17000,
				type: "ao100",
				description: "Get your average of 100 under 17 seconds",
			},
			{
				name: "Full OLL",
				target: null,
				type: "technique",
				description: "Learn all 57 OLL algorithms",
			},
		],
		EXPERT: [
			{
				name: "Sub-10s Average",
				target: 10000,
				type: "time",
				description: "Get your average time below 10 seconds",
			},
			{
				name: "Ao100 under 12s",
				target: 12000,
				type: "ao100",
				description: "Get your average of 100 under 12 seconds",
			},
			{
				name: "Advanced F2L",
				target: null,
				type: "technique",
				description: "Master advanced F2L techniques and algorithms",
			},
		],
		SPEEDCUBER: [
			{
				name: "Sub-8s Average",
				target: 8000,
				type: "time",
				description: "Get your average time below 8 seconds",
			},
			{
				name: "5 Sub-7s Solves",
				target: 5,
				type: "subX",
				targetTime: 7000,
				description: "Record 5 solves under 7 seconds",
			},
			{
				name: "Learn ZBLL",
				target: null,
				type: "technique",
				description: "Start learning ZBLL algorithms",
			},
		],
		COMPETITOR: [
			{
				name: "Sub-7s Average",
				target: 7000,
				type: "time",
				description: "Get your average time below 7 seconds",
			},
			{
				name: "Ao5 under 7.5s",
				target: 7500,
				type: "ao5",
				description: "Get your average of 5 under 7.5 seconds",
			},
			{
				name: "Competition Ready",
				target: null,
				type: "technique",
				description: "Practice competition-style solving",
			},
		],
	};

	return goalMap[tier] || goalMap.BEGINNER;
};

// Achievement definitions moved to standalone Achievements component

// Tips based on user level
const getTipsForLevel = (level: string): string[] => {
	const tipsByLevel: Record<string, string[]> = {
		ABSOLUTE_BEGINNER: [
			"Just focus on completing the cube - don&apos;t worry about speed",
			"Learn the beginner's method one step at a time",
			"Take breaks if you get frustrated - cubing should be fun!",
			"Use online tutorials or YouTube videos as guides",
			"It's okay to look at your notes while solving at first",
		],
		BEGINNER: [
			"Practice the algorithms until you can do them without looking",
			"Try to remember what each algorithm does to the cube",
			"Focus on getting comfortable holding the cube",
			"Learn to read basic cube notation (R, U, L, F, etc.)",
			"Try to solve the cube at least once every day",
		],
		IMPROVING: [
			"Try solving with the cross on the bottom instead of the top",
			"Work on reducing pauses between solving steps",
			"Practice the same algorithm multiple times in a row",
			"Start noticing patterns in how pieces move",
			"Aim to solve consistently under 2 minutes",
		],
		NOVICE: [
			"Start planning how to solve the cross during inspection time",
			"Try to solve the cross in 8 moves or less",
			"Learn some basic finger tricks for smoother turns",
			"Practice turning accuracy - avoid overshooting moves",
			"Consider learning about CFOP (Fridrich) method",
		],
		CASUAL: [
			"Work on planning the entire cross during inspection",
			"Learn 2-look OLL for more efficient last layer solving",
			"Practice lookahead - try to spot your next pieces",
			"Focus on smooth, continuous solving without pauses",
			"Try to solve the cross with your eyes closed",
		],
		INTERMEDIATE: [
			"Begin learning 2-look OLL and 2-look PLL algorithms",
			"Practice solving F2L pairs without looking at them",
			"Work on reducing cube rotations during F2L",
			"Focus on smoother transitions between solve phases",
			"Use a metronome to develop consistent turning speed",
		],
		ADVANCING: [
			"Start learning full PLL (21 algorithms)",
			"Practice advanced F2L cases and solutions",
			"Work on efficient cross solutions (under 8 moves)",
			"Practice lookahead during F2L solving",
			"Analyze your solves to identify areas for improvement",
		],
		EXPERIENCED: [
			"Learn all PLL algorithms and work on recognition",
			"Start learning some OLL algorithms",
			"Focus on F2L efficiency and advanced cases",
			"Practice cross+1 planning during inspection",
			"Work on consistent turning throughout the solve",
		],
		ADVANCED: [
			"Learn full OLL (57 algorithms)",
			"Master PLL recognition and execution",
			"Practice advanced F2L tricks and alternatives",
			"Work on cross+1 planning during inspection",
			"Focus on eliminating pauses completely",
		],
		EXPERT: [
			"Practice cross+1 consistently during inspection",
			"Learn alternative OLL/PLL algorithms for different cases",
			"Practice multiple solution approaches for difficult F2L cases",
			"Work on optimizing TPS (turns per second) while maintaining accuracy",
			"Record and analyze your solves to identify weak points",
		],
		SPEEDCUBER: [
			"Start learning ZBLL or COLL algorithms",
			"Practice advanced F2L tricks for difficult cases",
			"Work on perfect cross+1 planning during inspection",
			"Optimize finger tricks for maximum TPS",
			"Practice competition-style solving conditions",
		],
		COMPETITOR: [
			"Focus on high TPS without sacrificing lookahead",
			"Practice competition nerves management",
			"Learn to recover quickly from mistakes",
			"Work on optimal algorithm selection for every case",
			"Maintain consistent practice schedules like competitive cubers",
		],
	};

	return tipsByLevel[level] || tipsByLevel.BEGINNER;
};

// Progress analysis
const getProgressAnalysis = (times: TimeRecord[]): string => {
	if (times.length < 2) return "Complete more solves to see progress analysis";

	const validTimes = times
		.filter((t) => t.penalty !== "DNF")
		.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));

	if (validTimes.length < 2) return "Complete more valid solves to see progress analysis";

	// Sort by date (most recent first, which should already be the order)
	const sortedTimes = [...times].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);

	// Get recent and older average (splitting in half)
	const halfPoint = Math.floor(sortedTimes.length / 2);
	const recentTimes = sortedTimes.slice(0, halfPoint);
	const olderTimes = sortedTimes.slice(halfPoint);

	// Calculate averages
	const getAvg = (arr: TimeRecord[]) => {
		const valid = arr
			.filter((t) => t.penalty !== "DNF")
			.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));
		if (valid.length === 0) return 0;
		return valid.reduce((a, b) => a + b, 0) / valid.length;
	};

	const recentAvg = getAvg(recentTimes);
	const olderAvg = getAvg(olderTimes);

	if (recentAvg === 0 || olderAvg === 0) return "Need more valid solves to analyze progress";

	const improvement = olderAvg - recentAvg;
	const percentImprovement = (improvement / olderAvg) * 100;

	if (improvement > 0) {
		return `You&apos;ve improved by ${formatTime(improvement)} (${percentImprovement.toFixed(1)}%) compared to your earlier solves. Keep it up!`;
	} else if (improvement < 0) {
		return `Your recent times are slower by ${formatTime(Math.abs(improvement))} (${Math.abs(percentImprovement).toFixed(1)}%). Focus on consistent practice to get back on track.`;
	} else {
		return "Your solving times have remained consistent. Consider learning new techniques to improve further.";
	}
};

// Consistency score calculation (0-100)
const calculateConsistencyScore = (times: TimeRecord[]): number => {
	if (times.length < 3) return 0;

	const validTimes = times
		.filter((t) => t.penalty !== "DNF")
		.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time));

	if (validTimes.length < 3) return 0;

	// Calculate standard deviation
	const avg = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;

	// Guard against division by zero or extremely low average times
	if (avg <= 0) return 0;

	const squareDiffs = validTimes.map((value) => {
		const diff = value - avg;
		return diff * diff;
	});

	const variance = squareDiffs.reduce((a, b) => a + b, 0) / validTimes.length;
	const stdDev = Math.sqrt(variance);

	// Calculate coefficient of variation (CV)
	const cv = (stdDev / avg) * 100;

	// More realistic CV thresholds based on actual speedcubing data
	let excellentCV = 8; // Excellent consistency
	let goodCV = 15; // Good consistency
	let fairCV = 25; // Fair consistency
	let maxCV = 40; // Maximum reasonable CV

	// Adjust thresholds based on solving level (faster solvers can be more consistent)
	if (avg < 15000) {
		// Sub-15 second solvers
		excellentCV = 5;
		goodCV = 10;
		fairCV = 18;
		maxCV = 30;
	} else if (avg < 30000) {
		// Sub-30 second solvers
		excellentCV = 6;
		goodCV = 12;
		fairCV = 20;
		maxCV = 35;
	} else if (avg < 60000) {
		// Sub-1 minute solvers
		excellentCV = 7;
		goodCV = 14;
		fairCV = 22;
		maxCV = 38;
	}

	// Calculate score using a more forgiving curve
	let score = 0;
	if (cv <= excellentCV) {
		score = 90 + (10 * (excellentCV - cv)) / excellentCV; // 90-100%
	} else if (cv <= goodCV) {
		score = 70 + (20 * (goodCV - cv)) / (goodCV - excellentCV); // 70-90%
	} else if (cv <= fairCV) {
		score = 40 + (30 * (fairCV - cv)) / (fairCV - goodCV); // 40-70%
	} else if (cv <= maxCV) {
		score = 10 + (30 * (maxCV - cv)) / (maxCV - fairCV); // 10-40%
	} else {
		score = Math.max(0, 10 * (1 - (cv - maxCV) / maxCV)); // 0-10%
	}

	return Math.min(100, Math.max(0, Math.round(score)));
};

// Calculate sub-X times
const calculateSubXStats = (
	times: TimeRecord[],
	threshold: number
): { count: number; percentage: number } => {
	if (times.length === 0) return { count: 0, percentage: 0 };

	const validTimes = times.filter((t) => t.penalty !== "DNF");
	if (validTimes.length === 0) return { count: 0, percentage: 0 };

	const subXcount = validTimes.filter(
		(t) => (t.penalty === "+2" ? t.time + 2000 : t.time) < threshold
	).length;

	return {
		count: subXcount,
		percentage: (subXcount / validTimes.length) * 100,
	};
};

// Calculate sub-8s average (specifically for advanced users)
const calculateSub8sAverage = (
	times: TimeRecord[]
): { count: number; percentage: number; avgTime: number | null } => {
	if (times.length === 0) return { count: 0, percentage: 0, avgTime: null };

	const validTimes = times.filter((t) => t.penalty !== "DNF");
	if (validTimes.length === 0) return { count: 0, percentage: 0, avgTime: null };

	const sub8sTimes = validTimes.filter((t) => (t.penalty === "+2" ? t.time + 2000 : t.time) < 8000);

	const count = sub8sTimes.length;
	if (count === 0) return { count: 0, percentage: 0, avgTime: null };

	const totalTime = sub8sTimes.reduce(
		(sum, t) => sum + (t.penalty === "+2" ? t.time + 2000 : t.time),
		0
	);

	return {
		count,
		percentage: (count / validTimes.length) * 100,
		avgTime: count > 0 ? totalTime / count : null,
	};
};

// Success rate trends
const calculateSuccessRateOverTime = (
	times: TimeRecord[]
): { improving: boolean; rate: number } => {
	if (times.length < 10) return { improving: false, rate: 0 };

	const halfPoint = Math.floor(times.length / 2);
	const recentTimes = times.slice(0, halfPoint);
	const olderTimes = times.slice(halfPoint);

	const recentSuccess = recentTimes.filter((t) => t.penalty !== "DNF").length / recentTimes.length;
	const olderSuccess = olderTimes.filter((t) => t.penalty !== "DNF").length / olderTimes.length;

	return {
		improving: recentSuccess > olderSuccess,
		rate: recentSuccess * 100,
	};
};

interface StatisticsProps {
	times: TimeRecord[];
}

export function Statistics({ times }: StatisticsProps) {
	const [activeTab, setActiveTab] = useState("overview");
	const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

	// User progress context
	const {
		userLevel: storedUserLevel,
		updateUserLevel,
		showLevelUpNotification,
		isLoading,
	} = useUserProgress();

	// Filter out DNF times for statistics calculation
	const validTimes = useMemo(
		() =>
			times
				.filter((time) => time.penalty !== "DNF")
				.map((time) => (time.penalty === "+2" ? time.time + 2000 : time.time)),
		[times]
	);

	const stats = useMemo(() => calculateStatistics(validTimes), [validTimes]);

	// Calculate user level based on average time
	const userLevel = useMemo(() => {
		if (!stats.mean || validTimes.length < 5) return SPEED_TIERS.BEGINNER;

		let level = SPEED_TIERS.BEGINNER;
		for (const tier of Object.values(SPEED_TIERS)) {
			if (stats.mean <= tier.max) {
				level = tier;
			}
		}
		return level;
	}, [stats.mean, validTimes.length]);

	// Update stored user level when calculated level changes
	useEffect(() => {
		if (
			!isLoading &&
			userLevel.label !== storedUserLevel &&
			validTimes.length >= 5 &&
			storedUserLevel !== null
		) {
			updateUserLevel(userLevel.label);

			// Show level up notification if it's an improvement
			// Find the level keys first to handle case when level isn't found
			const storedLevelKey = Object.keys(SPEED_TIERS).find(
				(key) => SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === storedUserLevel
			);
			const currentLevelKey = Object.keys(SPEED_TIERS).find(
				(key) => SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === userLevel.label
			);

			// Determine if this is an improvement (current is better than stored)
			// Lower max value means faster/better level (faster times)
			if (storedLevelKey && currentLevelKey) {
				const storedMax = SPEED_TIERS[storedLevelKey as keyof typeof SPEED_TIERS].max;
				const currentMax = SPEED_TIERS[currentLevelKey as keyof typeof SPEED_TIERS].max;

				if (currentMax < storedMax) {
					showLevelUpNotification(userLevel.label);
				}
			}
		}
	}, [
		userLevel.label,
		storedUserLevel,
		validTimes.length,
		updateUserLevel,
		showLevelUpNotification,
		isLoading,
	]);

	// Achievements are now handled globally by the AchievementChecker component

	// Calculate level progression
	const calculateLevelProgress = () => {
		// Helper function to get level by label
		const getLevelByLabel = (label: string) => {
			const levelKey = Object.keys(SPEED_TIERS).find(
				(k) => SPEED_TIERS[k as keyof typeof SPEED_TIERS].label === label
			) as keyof typeof SPEED_TIERS | undefined;

			return levelKey ? SPEED_TIERS[levelKey] : null;
		};

		// Get current level (use stored level if available)
		const currentLevel = storedUserLevel ? getLevelByLabel(storedUserLevel) : userLevel;

		// If current level is not found or we're at the top level already (COMPETITOR)
		if (!currentLevel) return 0;

		const currentKey = Object.keys(SPEED_TIERS).find(
			(k) =>
				SPEED_TIERS[k as keyof typeof SPEED_TIERS].label === (storedUserLevel || userLevel.label)
		);

		if (!currentKey || currentKey === "COMPETITOR") {
			return 100; // Already at top level
		}

		// Find the next level (the level with next lower max time)
		const currentIndex = Object.keys(SPEED_TIERS).indexOf(currentKey);
		if (currentIndex <= 0) return 100; // Safety check

		const nextKey = Object.keys(SPEED_TIERS)[currentIndex - 1];
		const nextLevel = SPEED_TIERS[nextKey as keyof typeof SPEED_TIERS];

		// If we don&apos;t have enough solves or an average yet
		if (!stats.mean || validTimes.length < 5) {
			return 0;
		}

		// Calculate progress between current level max and next level max
		const currentMax = currentLevel.max;
		const nextMax = nextLevel.max;

		// For time progress, lower is better
		const levelDifference = currentMax - nextMax;
		const userProgress = currentMax - stats.mean;

		// Convert to percentage, ensuring it doesn't exceed 100%
		const progressPercent = Math.min((userProgress / levelDifference) * 100, 100);

		return Math.max(0, progressPercent);
	};

	const levelProgress = calculateLevelProgress();

	// Calculate consistency score
	const consistencyScore = useMemo(() => calculateConsistencyScore(times), [times]);

	// Get user goals based on level
	const userGoals = useMemo(() => getGoals(stats.mean || 120000), [stats.mean]);

	// Calculate sub-8s stats for advanced users
	const sub8sStats = useMemo(() => calculateSub8sAverage(times), [times]);

	// Calculate success rate trend
	const successRate = useMemo(() => calculateSuccessRateOverTime(times), [times]);

	// Progress analysis
	const progressAnalysis = useMemo(() => getProgressAnalysis(times), [times]);

	// Get tips based on user level
	const tips = useMemo(() => getTipsForLevel(userLevel.label), [userLevel.label]);

	const getProgressPercentage = (current: number, target: number) => {
		return Math.min((current / target) * 100, 100);
	};

	// Render empty state when no times are available
	if (times.length === 0) {
		return (
			<div className="space-y-6">
				<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
					{/* Background Pattern */}
					<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:40px_40px]" />
					</div>

					<CardHeader className="pb-4 relative">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
								<BarChart3 className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
									Statistics
								</CardTitle>
								<p className="text-sm text-muted-foreground font-medium">
									Performance analytics and insights
								</p>
							</div>
						</div>
					</CardHeader>

					<CardContent className="text-center py-16 relative">
						<div className="max-w-md mx-auto space-y-6">
							<div className="relative">
								<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center border border-border/50">
									<BarChart3 className="w-12 h-12 text-muted-foreground/50" />
								</div>

								{/* Floating decorative elements */}
								<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
									<div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" />
								</div>
								<div className="absolute top-4 right-1/4">
									<div
										className="w-2 h-2 bg-secondary/30 rounded-full animate-bounce"
										style={{ animationDelay: "0.5s" }}
									/>
								</div>
								<div className="absolute top-4 left-1/4">
									<div
										className="w-2 h-2 bg-accent/30 rounded-full animate-bounce"
										style={{ animationDelay: "1s" }}
									/>
								</div>
							</div>

							<div className="space-y-3">
								<h3 className="text-2xl font-bold text-foreground">No Statistics Yet</h3>
								<p className="text-muted-foreground leading-relaxed">
									Complete some solves to unlock detailed performance analytics, averages, and
									progress tracking!
								</p>
							</div>

							<div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
								<div className="flex items-center justify-center gap-2 text-primary font-semibold">
									<Zap className="w-4 h-4" />
									<span>Start solving to see your stats!</span>
								</div>
							</div>

							{/* Beginner tips card */}
							<Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20">
								<CardHeader className="pb-2">
									<div className="flex items-center gap-2">
										<Lightbulb className="w-5 h-5 text-blue-500" />
										<CardTitle className="text-md font-semibold text-blue-700 dark:text-blue-300">
											Getting Started Tips
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
										<li className="flex items-start gap-2">
											<div className="mt-1 min-w-4">
												<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
											</div>
											<span>
												Focus on learning the basic solve method before worrying about speed
											</span>
										</li>
										<li className="flex items-start gap-2">
											<div className="mt-1 min-w-4">
												<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
											</div>
											<span>Try to solve the white cross on the bottom instead of the top</span>
										</li>
										<li className="flex items-start gap-2">
											<div className="mt-1 min-w-4">
												<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
											</div>
											<span>Familiarize yourself with basic cube notation (R, U, L, F, etc.)</span>
										</li>
									</ul>
								</CardContent>
							</Card>
						</div>

						{/* Decorative background elements */}
						<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
						<div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full translate-y-20 -translate-x-20 pointer-events-none" />
					</CardContent>
				</Card>
			</div>
		);
	}

	const dnfCount = times.filter((t) => t.penalty === "DNF").length;
	const plusTwoCount = times.filter((t) => t.penalty === "+2").length;
	const validCount = times.length - dnfCount;

	return (
		<div className="space-y-8">
			{/* Header with Session Overview and User Level */}
			<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
				<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:40px_40px]" />
				</div>

				<CardHeader className="pb-4 relative">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
								<BarChart3 className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
									Statistics
								</CardTitle>
								<p className="text-sm text-muted-foreground font-medium">
									{times.length} total solves • {validCount} valid • Session performance
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 text-sm">
							<div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
								<div className="w-2 h-2 rounded-full bg-green-500" />
								<span className="font-semibold">{validCount} OK</span>
							</div>
							{plusTwoCount > 0 && (
								<div className="flex items-center gap-2 bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
									<span className="font-semibold">+{plusTwoCount}</span>
								</div>
							)}
							{dnfCount > 0 && (
								<div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-800">
									<span className="font-semibold">{dnfCount} DNF</span>
								</div>
							)}
						</div>
					</div>
				</CardHeader>

				<CardContent className="py-4 px-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg border border-purple-200/50 dark:border-purple-800/50">
								<Trophy className="w-5 h-5 text-purple-500" />
							</div>
							<div>
								<div className="text-sm font-medium text-muted-foreground">Cuber Level</div>
								<div className="text-lg font-bold text-purple-600 dark:text-purple-400">
									{storedUserLevel || userLevel.label}
								</div>
								<div className="mt-1">
									<div className="flex items-center justify-between text-xs">
										<span className="text-muted-foreground">Next Level</span>
										<span className="font-medium">
											{(() => {
												// Helper function to get next level name
												const getNextLevelName = (currentLabel: string): string => {
													const currentKey = Object.keys(SPEED_TIERS).find(
														(key) =>
															SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === currentLabel
													);

													// If we're already at the top level (COMPETITOR) or level not found
													if (!currentKey || currentKey === "COMPETITOR") {
														return "Max Level";
													}

													// Find the next level (with lower max time)
													const currentIndex = Object.keys(SPEED_TIERS).indexOf(currentKey);
													if (currentIndex <= 0) return "Max Level";

													const nextKey = Object.keys(SPEED_TIERS)[currentIndex - 1];
													return SPEED_TIERS[nextKey as keyof typeof SPEED_TIERS].label;
												};

												return getNextLevelName(storedUserLevel || userLevel.label);
											})()}
										</span>
									</div>
									<div className="w-full bg-muted rounded-full h-1.5 mt-1">
										<div
											className="bg-gradient-to-r from-purple-500 to-indigo-400 h-1.5 rounded-full transition-all duration-300"
											style={{ width: `${levelProgress}%` }}
										/>
									</div>
								</div>
							</div>
						</div>

						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="p-1 rounded-full bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 cursor-help">
										<Lightbulb className="w-4 h-4 text-purple-500" />
									</div>
								</TooltipTrigger>
								<TooltipContent className="max-w-xs">
									<div>
										<p>
											Your level is based on your average solving time. Keep practicing to advance
											to the next level!
										</p>
										<p className="mt-1 text-xs">
											Current progress: {levelProgress.toFixed(0)}% towards {(() => {
												const currentLabel = storedUserLevel || userLevel.label;
												const currentKey = Object.keys(SPEED_TIERS).find(
													(key) =>
														SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === currentLabel
												);

												// If we're already at the top level (COMPETITOR) or level not found
												if (!currentKey || currentKey === "COMPETITOR") {
													return "Max Level";
												}

												// Find the next level (with lower max time)
												const currentIndex = Object.keys(SPEED_TIERS).indexOf(currentKey);
												if (currentIndex <= 0) return "Max Level";

												const nextKey = Object.keys(SPEED_TIERS)[currentIndex - 1];
												return SPEED_TIERS[nextKey as keyof typeof SPEED_TIERS].label;
											})()}
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</TooltipProvider>
					</div>
				</CardContent>
			</Card>

			{/* Tabs for different stats sections */}
			<Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid grid-cols-4 w-full">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="achievements">Achievements</TabsTrigger>
					<TabsTrigger value="goals">Goals</TabsTrigger>
					<TabsTrigger value="insights">Insights</TabsTrigger>
				</TabsList>

				{/* Overview Tab */}
				<TabsContent value="overview" className="space-y-8 mt-6">
					{/* Key Statistics Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<StatCard
							title="Best Time"
							value={stats.best ? formatTime(stats.best) : "—"}
							icon={<Trophy className="w-4 h-4" />}
							trend="up"
							className="border-green-200/50 dark:border-green-800/50"
						/>
						<StatCard
							title="Average"
							value={stats.mean ? formatTime(stats.mean) : "—"}
							icon={<Target className="w-4 h-4" />}
							className="border-blue-200/50 dark:border-blue-800/50"
						/>
						<StatCard
							title="Total Solves"
							value={stats.count.toString()}
							icon={<Timer className="w-4 h-4" />}
							className="border-purple-200/50 dark:border-purple-800/50"
						/>
						<StatCard
							title="Worst Time"
							value={stats.worst ? formatTime(stats.worst) : "—"}
							icon={<TrendingDown className="w-4 h-4" />}
							trend="down"
							className="border-red-200/50 dark:border-red-800/50"
						/>
					</div>

					{/* Consistency Score */}
					<Card className="shadow-lg border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-r from-indigo-50/30 to-transparent dark:from-indigo-950/20">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl border border-indigo-500/20">
										<LineChart className="w-5 h-5 text-indigo-500" />
									</div>
									<div>
										<h3 className="font-bold text-lg">Consistency Score</h3>
										<p className="text-sm text-muted-foreground">
											How stable are your solve times?
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<div
										className={cn(
											"text-2xl font-bold",
											consistencyScore >= 80
												? "text-green-600 dark:text-green-400"
												: consistencyScore >= 60
													? "text-blue-600 dark:text-blue-400"
													: consistencyScore >= 40
														? "text-amber-600 dark:text-amber-400"
														: "text-red-600 dark:text-red-400"
										)}
									>
										{consistencyScore}%
									</div>
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<div className="p-1 rounded-full bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 cursor-help">
													<Lightbulb className="w-4 h-4 text-indigo-500" />
												</div>
											</TooltipTrigger>
											<TooltipContent className="max-w-xs">
												<p>
													Consistency score measures how uniform your solve times are. Higher scores
													mean less variation between solves.
												</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								</div>
							</div>

							<div className="mt-4">
								<Progress
									value={consistencyScore}
									className="h-2 bg-indigo-100 dark:bg-indigo-950/50"
									indicatorClassName={cn(
										consistencyScore >= 80
											? "bg-gradient-to-r from-green-500 to-emerald-400"
											: consistencyScore >= 60
												? "bg-gradient-to-r from-blue-500 to-indigo-400"
												: consistencyScore >= 40
													? "bg-gradient-to-r from-amber-500 to-orange-400"
													: "bg-gradient-to-r from-red-500 to-rose-400"
									)}
								/>

								<div className="flex justify-between mt-1 text-xs text-muted-foreground">
									<span>Inconsistent</span>
									<span>Somewhat Consistent</span>
									<span>Very Consistent</span>
								</div>
							</div>

							<div className="mt-4 text-sm text-muted-foreground">
								{consistencyScore >= 80 ? (
									<p>
										Your solving times are very consistent! This shows you have strong muscle memory
										and good technique.
									</p>
								) : consistencyScore >= 60 ? (
									<p>
										Good consistency for your level. As you practice, try to execute moves at a
										steady pace without rushing.
									</p>
								) : consistencyScore >= 40 ? (
									<p>
										Normal consistency for your skill level. Don&apos;t worry about small variations
										in time - they&apos;re expected as you learn.
									</p>
								) : (
									<p>
										Your times vary, which is completely normal when learning! Focus on the solving
										process rather than speed for now.
									</p>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Averages Section */}
					<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
						<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
							<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:30px_30px]" />
						</div>

						<CardHeader className="pb-6 relative">
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl border border-orange-500/20">
									<Award className="w-5 h-5 text-orange-500" />
								</div>
								<div>
									<CardTitle className="text-lg font-bold">Rolling Averages</CardTitle>
									<p className="text-sm text-muted-foreground">
										Standard speedcubing averages with progress tracking
									</p>
								</div>
							</div>
						</CardHeader>

						<CardContent className="space-y-6 relative">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{/* Average of 5 */}
								<Card className="shadow-md border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<Award className="w-5 h-5 text-amber-500" />
												<span className="font-bold text-lg">Average of 5</span>
											</div>
											<div
												className={cn(
													"px-3 py-1 rounded-full text-xs font-bold border",
													validTimes.length >= 5
														? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
														: "bg-muted text-muted-foreground border-border"
												)}
											>
												{validTimes.length >= 5 ? "✓ Complete" : `${validTimes.length}/5`}
											</div>
										</div>

										<div className="text-4xl font-bold font-mono text-amber-600 dark:text-amber-400 mb-3">
											{stats.ao5 ? formatTime(stats.ao5) : "—"}
										</div>

										{validTimes.length < 5 && (
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Progress</span>
													<span className="font-semibold">
														{getProgressPercentage(validTimes.length, 5).toFixed(0)}%
													</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${getProgressPercentage(validTimes.length, 5)}%`,
														}}
													/>
												</div>
												<p className="text-sm text-muted-foreground">
													Need {5 - validTimes.length} more solves
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Average of 12 */}
								<Card className="shadow-md border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<Target className="w-5 h-5 text-orange-500" />
												<span className="font-bold text-lg">Average of 12</span>
											</div>
											<div
												className={cn(
													"px-3 py-1 rounded-full text-xs font-bold border",
													validTimes.length >= 12
														? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
														: "bg-muted text-muted-foreground border-border"
												)}
											>
												{validTimes.length >= 12 ? "✓ Complete" : `${validTimes.length}/12`}
											</div>
										</div>

										<div className="text-4xl font-bold font-mono text-orange-600 dark:text-orange-400 mb-3">
											{stats.ao12 ? formatTime(stats.ao12) : "—"}
										</div>

										{validTimes.length < 12 && (
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Progress</span>
													<span className="font-semibold">
														{getProgressPercentage(validTimes.length, 12).toFixed(0)}%
													</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${getProgressPercentage(validTimes.length, 12)}%`,
														}}
													/>
												</div>
												<p className="text-sm text-muted-foreground">
													Need {12 - validTimes.length} more solves
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Average of 50 */}
								<Card className="shadow-md border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<TrendingUp className="w-5 h-5 text-blue-500" />
												<span className="font-bold text-lg">Average of 50</span>
											</div>
											<div
												className={cn(
													"px-3 py-1 rounded-full text-xs font-bold border",
													validTimes.length >= 50
														? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
														: "bg-muted text-muted-foreground border-border"
												)}
											>
												{validTimes.length >= 50 ? "✓ Complete" : `${validTimes.length}/50`}
											</div>
										</div>

										<div className="text-4xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-3">
											{stats.ao50 ? formatTime(stats.ao50) : "—"}
										</div>

										{validTimes.length < 50 && (
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Progress</span>
													<span className="font-semibold">
														{getProgressPercentage(validTimes.length, 50).toFixed(0)}%
													</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${getProgressPercentage(validTimes.length, 50)}%`,
														}}
													/>
												</div>
												<p className="text-sm text-muted-foreground">
													Need {50 - validTimes.length} more solves
												</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Average of 100 */}
								<Card className="shadow-md border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-2">
												<BarChart3 className="w-5 h-5 text-purple-500" />
												<span className="font-bold text-lg">Average of 100</span>
											</div>
											<div
												className={cn(
													"px-3 py-1 rounded-full text-xs font-bold border",
													validTimes.length >= 100
														? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
														: "bg-muted text-muted-foreground border-border"
												)}
											>
												{validTimes.length >= 100 ? "✓ Complete" : `${validTimes.length}/100`}
											</div>
										</div>

										<div className="text-4xl font-bold font-mono text-purple-600 dark:text-purple-400 mb-3">
											{stats.ao100 ? formatTime(stats.ao100) : "—"}
										</div>

										{validTimes.length < 100 && (
											<div className="space-y-2">
												<div className="flex justify-between text-sm">
													<span className="text-muted-foreground">Progress</span>
													<span className="font-semibold">
														{getProgressPercentage(validTimes.length, 100).toFixed(0)}%
													</span>
												</div>
												<div className="w-full bg-muted rounded-full h-2">
													<div
														className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
														style={{
															width: `${getProgressPercentage(validTimes.length, 100)}%`,
														}}
													/>
												</div>
												<p className="text-sm text-muted-foreground">
													Need {100 - validTimes.length} more solves
												</p>
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>

					{/* Sub-8s Average Card for Advanced Users */}
					{userLevel.max < 15000 && (
						<Card className="shadow-lg border-cyan-200/50 dark:border-cyan-800/50 bg-gradient-to-r from-cyan-50/30 to-transparent dark:from-cyan-950/20">
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl border border-cyan-500/20">
											<Zap className="w-5 h-5 text-cyan-500" />
										</div>
										<div>
											<h3 className="font-bold text-lg">Sub-8s Average</h3>
											<p className="text-sm text-muted-foreground">For elite speedcubers only</p>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<div
											className={cn(
												"text-2xl font-bold",
												sub8sStats.count > 0
													? "text-cyan-600 dark:text-cyan-400"
													: "text-muted-foreground"
											)}
										>
											{sub8sStats.avgTime ? formatTime(sub8sStats.avgTime) : "—"}
										</div>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<div className="p-1 rounded-full bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 cursor-help">
														<Lightbulb className="w-4 h-4 text-cyan-500" />
													</div>
												</TooltipTrigger>
												<TooltipContent className="max-w-xs">
													<p>
														This tracks your average time for solves under 8 seconds. Only for very
														advanced speedcubers!
													</p>
												</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								</div>

								<div className="mt-4">
									<div className="flex justify-between items-center text-sm mb-2">
										<span className="text-muted-foreground">Sub-8s Solves</span>
										<div className="flex items-center gap-1">
											<span className="font-semibold">{sub8sStats.count}</span>
											<span className="text-muted-foreground">
												({sub8sStats.percentage.toFixed(1)}%)
											</span>
										</div>
									</div>
									<Progress
										value={sub8sStats.percentage}
										max={100}
										className="h-2 bg-cyan-100 dark:bg-cyan-950/50"
										indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-400"
									/>
								</div>

								<div className="mt-4 text-sm text-muted-foreground">
									{sub8sStats.count === 0 ? (
										<p>
											You haven&apos;t achieved any sub-8s solves yet. This is an elite milestone
											that only top speedcubers reach!
										</p>
									) : sub8sStats.count === 1 ? (
										<p>
											Incredible! You&apos;ve achieved 1 solve under 8 seconds. Can you make it
											consistent?
										</p>
									) : (
										<p>
											Amazing! You&apos;ve achieved {sub8sStats.count} solves under 8 seconds with
											an average of {sub8sStats.avgTime ? formatTime(sub8sStats.avgTime) : "—"}.
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					)}

					{/* Sub-X Times */}
					<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-cyan-500/10 rounded-xl border border-cyan-500/20">
									<Flame className="w-5 h-5 text-cyan-500" />
								</div>
								<div>
									<CardTitle className="text-lg font-bold">Speed Milestones</CardTitle>
									<p className="text-sm text-muted-foreground">
										Track your sub-X solving achievements
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{(() => {
									// Define milestones based on user level - always show 3 relevant milestones
									let milestones: Array<{
										threshold: number;
										label: string;
										color: string;
									}> = [];

									if (userLevel.max >= 120000) {
										// Beginner level: 2:00, 1:30, 1:00
										milestones = [
											{ threshold: 120000, label: "Sub-2:00", color: "green" },
											{ threshold: 90000, label: "Sub-1:30", color: "blue" },
											{ threshold: 60000, label: "Sub-1:00", color: "purple" },
										];
									} else if (userLevel.max >= 60000) {
										// Intermediate level: 1:00, 45s, 30s
										milestones = [
											{ threshold: 60000, label: "Sub-1:00", color: "green" },
											{ threshold: 45000, label: "Sub-45s", color: "blue" },
											{ threshold: 30000, label: "Sub-30s", color: "purple" },
										];
									} else if (userLevel.max >= 30000) {
										// Advanced level: 30s, 20s, 15s
										milestones = [
											{ threshold: 30000, label: "Sub-30s", color: "green" },
											{ threshold: 20000, label: "Sub-20s", color: "blue" },
											{ threshold: 15000, label: "Sub-15s", color: "purple" },
										];
									} else {
										// Expert level: 15s, 10s, 8s
										milestones = [
											{ threshold: 15000, label: "Sub-15s", color: "green" },
											{ threshold: 10000, label: "Sub-10s", color: "blue" },
											{ threshold: 8000, label: "Sub-8s", color: "purple" },
										];
									}

									return milestones.map((milestone, milestoneIndex) => {
										const stats = calculateSubXStats(times, milestone.threshold);
										const isAchieved = stats.count > 0;

										return (
											<Card
												key={`milestone-${milestone.threshold}-${milestoneIndex}`}
												className={cn(
													"bg-gradient-to-r border-l-4",
													isAchieved
														? `from-${milestone.color}-50/50 to-transparent dark:from-${milestone.color}-950/20 border-l-${milestone.color}-500`
														: "from-muted/50 to-transparent border-l-muted"
												)}
											>
												<CardContent className="p-4">
													<div className="flex justify-between items-center mb-2">
														<h3 className="font-bold">{milestone.label} Solves</h3>
														<Badge variant={isAchieved ? "success" : "outline"}>
															{isAchieved ? "Achieved" : "Not Yet"}
														</Badge>
													</div>
													<div className="flex justify-between items-center text-sm">
														<span className="text-muted-foreground">Count</span>
														<span className="font-semibold">{stats.count}</span>
													</div>
													<div className="flex justify-between items-center text-sm">
														<span className="text-muted-foreground">Rate</span>
														<span className="font-semibold">{stats.percentage.toFixed(1)}%</span>
													</div>
												</CardContent>
											</Card>
										);
									});
								})()}
							</div>
						</CardContent>
					</Card>

					{/* Session Summary */}
					<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl border border-green-500/20">
										<Calendar className="w-5 h-5 text-green-500" />
									</div>
									<div>
										<h3 className="font-bold text-lg">Session Summary</h3>
										<p className="text-sm text-muted-foreground">
											Current session performance overview
										</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="text-right">
										<div className="text-2xl font-bold font-mono">{times.length}</div>
										<div className="text-xs text-muted-foreground font-semibold">Total Solves</div>
									</div>
									<div className="w-px h-12 bg-border" />
									<div className="text-right">
										<div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
											{((validCount / times.length) * 100).toFixed(1)}%
										</div>
										<div className="text-xs text-muted-foreground font-semibold">Success Rate</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Achievements Tab */}
				<TabsContent value="achievements" className="space-y-8 mt-6">
					<Achievements times={times} />
				</TabsContent>

				{/* Goals Tab */}
				<TabsContent value="goals" className="space-y-8 mt-6">
					<Card className="shadow-lg border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/30 to-transparent dark:from-emerald-950/20">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl border border-emerald-500/20">
										<Flag className="w-5 h-5 text-emerald-500" />
									</div>
									<div>
										<CardTitle className="text-lg font-bold">Cubing Goals</CardTitle>
										<p className="text-sm text-muted-foreground">
											Personalized goals based on your current level:{" "}
											<span className="font-medium text-emerald-600 dark:text-emerald-400">
												{userLevel.label}
											</span>
										</p>
									</div>
								</div>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 cursor-help">
												<Lightbulb className="w-4 h-4 text-emerald-500" />
											</div>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p>
												These goals are tailored based on your current solve times and skill level.
												Complete them to improve your skills!
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{userGoals.map((goal, goalIndex) => {
								// Calculate progress for time-based goals
								const getTimeProgress = () => {
									if (!stats.mean || goal.type !== "time") return 0;
									if (!goal.target) return 0;

									// For time goals, check if we've achieved the target
									if (stats.mean <= goal.target) {
										return 100; // Goal completed
									}

									// Show progress towards the goal (how close we are)
									// Use a reasonable starting point (e.g., 2x the target) to show meaningful progress
									const startingPoint = goal.target * 2;
									const progress = Math.max(
										0,
										((startingPoint - stats.mean) / (startingPoint - goal.target)) * 100
									);
									return Math.min(progress, 99); // Cap at 99% until actually achieved
								};

								// Calculate progress for count-based goals
								const getCountProgress = () => {
									if (goal.type !== "count") return 0;
									if (!goal.target) return 0;
									return Math.min((times.length / goal.target) * 100, 100);
								};

								// Calculate progress for average-based goals
								const getAverageProgress = () => {
									if (!goal.target) return 0;

									let currentValue: number | null = null;
									if (goal.type === "ao5") currentValue = stats.ao5;
									else if (goal.type === "ao12") currentValue = stats.ao12;
									else if (goal.type === "ao100") currentValue = stats.ao100;
									else return 0;

									if (!currentValue) return 0;

									// For average goals, check if we've achieved the target
									if (currentValue <= goal.target) {
										return 100; // Goal completed
									}

									// Show progress towards the goal
									const startingPoint = goal.target * 2;
									const progress = Math.max(
										0,
										((startingPoint - currentValue) / (startingPoint - goal.target)) * 100
									);
									return Math.min(progress, 99); // Cap at 99% until actually achieved
								};

								// Calculate progress for sub-X solves
								const getSubXProgress = () => {
									if (goal.type !== "subX" || !goal.targetTime) return 0;

									const targetTime = goal.targetTime;
									const subXCount = times.filter(
										(t) =>
											t.penalty !== "DNF" &&
											(t.penalty === "+2" ? t.time + 2000 : t.time) < targetTime
									).length;

									if (!goal.target) return 0;
									return Math.min((subXCount / goal.target) * 100, 100);
								};

								// Determine progress based on goal type
								let progress = 0;
								if (goal.type === "time") progress = getTimeProgress();
								else if (goal.type === "count") progress = getCountProgress();
								else if (["ao5", "ao12", "ao100"].includes(goal.type))
									progress = getAverageProgress();
								else if (goal.type === "subX") progress = getSubXProgress();

								// Determine if goal is completed
								const isComplete = progress >= 100;

								return (
									<Card
										key={`goal-${goal.name}-${goalIndex}`}
										className={cn(
											"border transition-all duration-300",
											isComplete
												? "bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-950/20 border-emerald-200 dark:border-emerald-800"
												: "bg-card border-border"
										)}
									>
										<CardContent className="p-4">
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center gap-2">
													{isComplete ? (
														<div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
															<Badge
																variant="success"
																className="flex items-center justify-center w-4 h-4 p-0 min-w-0 min-h-0"
															>
																✓
															</Badge>
														</div>
													) : (
														<div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30"></div>
													)}
													<h3
														className={cn(
															"font-bold",
															isComplete ? "text-emerald-700 dark:text-emerald-300" : ""
														)}
													>
														{goal.name}
													</h3>
												</div>
												<Badge variant={isComplete ? "success" : "outline"}>
													{isComplete ? "Completed" : `${Math.round(progress)}%`}
												</Badge>
											</div>

											<p className="text-sm text-muted-foreground mb-3">{goal.description}</p>

											{goal.type !== "technique" && (
												<div className="space-y-1">
													<Progress
														value={progress}
														className="h-2"
														indicatorClassName={cn(
															isComplete
																? "bg-gradient-to-r from-emerald-500 to-emerald-400"
																: "bg-gradient-to-r from-blue-500 to-cyan-400"
														)}
													/>
												</div>
											)}
										</CardContent>
									</Card>
								);
							})}
						</CardContent>
						<CardFooter className="bg-emerald-50/30 dark:bg-emerald-950/10 border-t border-emerald-100 dark:border-emerald-900/30 p-4">
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Lightbulb className="w-4 h-4 text-emerald-500" />
								<p>Complete goals to progress your cubing skills and unlock new challenges!</p>
							</div>
						</CardFooter>
					</Card>
				</TabsContent>

				{/* Insights Tab */}
				<TabsContent value="insights" className="space-y-8 mt-6">
					{/* Progress Analysis */}
					<Card className="shadow-lg border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/30 to-transparent dark:from-indigo-950/20">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl border border-indigo-500/20">
									<TrendingUp className="w-5 h-5 text-indigo-500" />
								</div>
								<div>
									<CardTitle className="text-lg font-bold">Progress Analysis</CardTitle>
									<p className="text-sm text-muted-foreground">
										How your performance is changing over time
									</p>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
								<p className="text-indigo-700 dark:text-indigo-300">{progressAnalysis}</p>
							</div>
						</CardContent>
					</Card>

					{/* Success Rate */}
					<Card className="shadow-lg border-emerald-200/50 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/30 to-transparent dark:from-emerald-950/20">
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl border border-emerald-500/20">
									<PieChart className="w-5 h-5 text-emerald-500" />
								</div>
								<div>
									<CardTitle className="text-lg font-bold">Success Rate</CardTitle>
									<p className="text-sm text-muted-foreground">Your solve completion analysis</p>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex flex-col gap-1">
									<span className="text-sm text-muted-foreground">Current Rate</span>
									<span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
										{successRate.rate.toFixed(1)}%
									</span>
								</div>
								<div className="flex flex-col gap-1 items-end">
									<span className="text-sm text-muted-foreground">Trend</span>
									<div className="flex items-center gap-1">
										{successRate.improving ? (
											<>
												<TrendingUp className="w-4 h-4 text-emerald-500" />
												<span className="text-emerald-600 dark:text-emerald-400 font-medium">
													Improving
												</span>
											</>
										) : (
											<>
												<TrendingDown className="w-4 h-4 text-amber-500" />
												<span className="text-amber-600 dark:text-amber-400 font-medium">
													Declining
												</span>
											</>
										)}
									</div>
								</div>
							</div>

							<div className="grid grid-cols-3 gap-3">
								<Card className="bg-green-50/50 dark:bg-green-950/30 border-green-200 dark:border-green-800/50">
									<CardContent className="p-3">
										<div className="text-center">
											<div className="text-sm text-muted-foreground mb-1">Clean Solves</div>
											<div className="text-xl font-bold text-green-600 dark:text-green-400">
												{validCount - plusTwoCount}
											</div>
											<div className="text-xs text-muted-foreground">
												{(((validCount - plusTwoCount) / times.length) * 100).toFixed(1)}%
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-yellow-50/50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800/50">
									<CardContent className="p-3">
										<div className="text-center">
											<div className="text-sm text-muted-foreground mb-1">+2 Penalties</div>
											<div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
												{plusTwoCount}
											</div>
											<div className="text-xs text-muted-foreground">
												{((plusTwoCount / times.length) * 100).toFixed(1)}%
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="bg-red-50/50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50">
									<CardContent className="p-3">
										<div className="text-center">
											<div className="text-sm text-muted-foreground mb-1">DNF Solves</div>
											<div className="text-xl font-bold text-red-600 dark:text-red-400">
												{dnfCount}
											</div>
											<div className="text-xs text-muted-foreground">
												{((dnfCount / times.length) * 100).toFixed(1)}%
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</CardContent>
					</Card>

					{/* Improvement Tips */}
					<Card className="shadow-lg border-blue-200/50 dark:border-blue-800/50 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20">
						<CardHeader>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl border border-blue-500/20">
										<Lightbulb className="w-5 h-5 text-blue-500" />
									</div>
									<div>
										<CardTitle className="text-lg font-bold">Cubing Tips</CardTitle>
										<p className="text-sm text-muted-foreground">
											Personalized tips for your level:{" "}
											<span className="font-medium text-blue-600 dark:text-blue-400">
												{userLevel.label}
											</span>
										</p>
									</div>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Collapsible
								className="space-y-2"
								open={expandedInsight === "tips"}
								onOpenChange={() => setExpandedInsight(expandedInsight === "tips" ? null : "tips")}
							>
								<Card className="bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50">
									<CollapsibleTrigger asChild>
										<CardContent className="p-4 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-2">
													<Lightbulb className="w-4 h-4 text-blue-500" />
													<h3 className="font-semibold text-blue-700 dark:text-blue-300">
														Tips for {userLevel.label} Cubers
													</h3>
												</div>
												{expandedInsight === "tips" ? (
													<ChevronDown className="w-5 h-5 text-blue-500" />
												) : (
													<ChevronRight className="w-5 h-5 text-blue-500" />
												)}
											</div>
										</CardContent>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<div className="px-4 pb-4">
											<ul className="space-y-3">
												{tips.map((tip, tipIndex) => (
													<li
														key={`tip-${tipIndex}-${tip.slice(0, 10)}`}
														className="flex items-start gap-2 text-blue-700 dark:text-blue-300"
													>
														<div className="mt-1 min-w-4">
															<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
														</div>
														<span>{tip}</span>
													</li>
												))}
											</ul>
										</div>
									</CollapsibleContent>
								</Card>
							</Collapsible>

							<div className="mt-4 px-1">
								<h4 className="text-sm font-medium mb-3">Next Steps for Improvement</h4>
								<div className="space-y-2">
									{(storedUserLevel || userLevel.label) === "Absolute Beginner" && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Learn to solve the cube from start to finish without help.
											</p>
										</div>
									)}
									{(storedUserLevel || userLevel.label) === "Beginner" && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Memorize all steps of the beginner method and practice daily.
											</p>
										</div>
									)}
									{(storedUserLevel || userLevel.label) === "Improving" && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Practice the cross on bottom and work on smoother turning.
											</p>
										</div>
									)}
									{["Novice", "Casual"].includes(storedUserLevel || userLevel.label) && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Start learning 4-look last layer (2-look OLL and 2-look PLL).
											</p>
										</div>
									)}
									{["Intermediate", "Advancing"].includes(storedUserLevel || userLevel.label) && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Learn intuitive F2L and work on finger tricks for faster turning.
											</p>
										</div>
									)}
									{["Experienced", "Advanced"].includes(storedUserLevel || userLevel.label) && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Focus on full PLL and then full OLL algorithm sets.
											</p>
										</div>
									)}
									{["Expert", "Speedcuber", "Competitor"].includes(
										storedUserLevel || userLevel.label
									) && (
										<div className="flex items-start gap-2">
											<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
											<p className="text-sm text-muted-foreground">
												Work on advanced techniques like cross+1 planning and optimizing F2L.
											</p>
										</div>
									)}
									<div className="flex items-start gap-2">
										<ArrowRight className="w-4 h-4 text-blue-500 mt-0.5" />
										<p className="text-sm text-muted-foreground">
											Complete more timed solves to gather more accurate statistics.
										</p>
									</div>
								</div>
							</div>
						</CardContent>
						<CardFooter className="bg-blue-50/30 dark:bg-blue-950/10 border-t border-blue-100 dark:border-blue-900/30 p-4">
							<Button
								variant="outline"
								className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/20"
							>
								<a
									href={(() => {
										// Helper function to get level max from label
										const getLevelMax = (label: string): number => {
											const tierKey = Object.keys(SPEED_TIERS).find(
												(key) => SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === label
											) as keyof typeof SPEED_TIERS | undefined;
											if (!tierKey) return 0;

											return tierKey ? SPEED_TIERS[tierKey].max : 300000;
										};

										const currentMax = storedUserLevel
											? getLevelMax(storedUserLevel)
											: userLevel.max;

										if (currentMax >= 90000) {
											return "https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/";
										} else if (currentMax >= 45000) {
											return "https://jperm.net/3x3/beginner";
										} else {
											return "https://jperm.net/3x3/cfop";
										}
									})()}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-2"
								>
									<Lightbulb className="w-4 h-4" />
									<span>
										{(() => {
											// Helper function to get level max from label
											const getLevelMax = (label: string): number => {
												const tierKey = Object.keys(SPEED_TIERS).find(
													(key) => SPEED_TIERS[key as keyof typeof SPEED_TIERS].label === label
												) as keyof typeof SPEED_TIERS | undefined;

												return tierKey ? SPEED_TIERS[tierKey].max : 300000;
											};

											const currentMax = storedUserLevel
												? getLevelMax(storedUserLevel)
												: userLevel.max;

											if (currentMax >= 90000) {
												return "Learn Beginner's Method";
											} else if (currentMax >= 45000) {
												return "Improve Your Method";
											} else {
												return "Learn CFOP Method";
											}
										})()}
									</span>
								</a>
							</Button>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
			{/* Toaster moved to layout */}
		</div>
	);
}
