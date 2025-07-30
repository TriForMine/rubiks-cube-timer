"use client";

import { Award, Medal, Trophy } from "lucide-react";
import type React from "react";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import {
	loadUserProgress,
	markAchievementShown,
	markLevelUpShown,
	recordAchievement as recordAchievementInStorage,
	type UserProgress,
	updateUserLevel as updateLevelInStorage,
} from "@/lib/storage";

// Icon mapping for achievement tiers
const TIER_ICONS = {
	bronze: <Medal className="w-5 h-5 text-amber-500" />,
	silver: <Medal className="w-5 h-5 text-slate-400" />,
	gold: <Trophy className="w-5 h-5 text-yellow-500" />,
	diamond: <Award className="w-5 h-5 text-blue-500" />,
};

export interface Achievement {
	id: string;
	name: string;
	description: string;
	tier: "bronze" | "silver" | "gold" | "diamond";
	icon: React.ReactNode;
}

interface UserProgressContextType {
	userLevel: string;
	updateUserLevel: (level: string) => void;
	achievements: string[];
	recordAchievement: (achievement: Achievement) => void;
	checkAchievement: (id: string) => boolean;
	showLevelUpNotification: (level: string) => void;
	isLoading: boolean;
}

const UserProgressContext = createContext<UserProgressContextType | undefined>(undefined);

export function UserProgressProvider({ children }: { children: ReactNode }): React.JSX.Element {
	const [progress, setProgress] = useState<UserProgress>({
		level: "Absolute Beginner",
		lastUpdateTime: Date.now(),
		achievements: [],
		shownLevelUps: [],
		shownAchievements: [],
	});
	const [isLoading, setIsLoading] = useState(true);

	// Load progress from localStorage on initial render
	useEffect(() => {
		try {
			const savedProgress = loadUserProgress();
			setProgress(savedProgress);
		} catch (error) {
			console.error("Error loading user progress:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	// Update user level
	const updateUserLevel = (level: string) => {
		if (level === progress.level) return;

		setProgress((prev) => {
			const updated = {
				...prev,
				level,
				lastUpdateTime: Date.now(),
			};

			// Save to storage
			updateLevelInStorage(level);
			return updated;
		});
	};

	// Record a new achievement
	const recordAchievement = (achievement: Achievement) => {
		// Check if already achieved
		if (progress.achievements.includes(achievement.id)) return;

		// Record in storage
		const isNewAchievement = recordAchievementInStorage(achievement.id);

		if (isNewAchievement) {
			setProgress((prev) => ({
				...prev,
				achievements: [...prev.achievements, achievement.id],
			}));

			// Show notification if not already shown
			if (!progress.shownAchievements.includes(achievement.id)) {
				// Show toast notification
				toast.success(
					<div className="mt-2">
						<p className="font-semibold">{achievement.name}</p>
						<p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
					</div>,
					{
						icon: TIER_ICONS[achievement.tier] || achievement.icon,
						description: "Achievement Unlocked!",
						duration: 5000,
					}
				);

				// Mark as shown
				markAchievementShown(achievement.id);
				setProgress((prev) => ({
					...prev,
					shownAchievements: [...prev.shownAchievements, achievement.id],
				}));
			}
		}
	};

	// Check if an achievement is unlocked
	const checkAchievement = (id: string): boolean => {
		return progress.achievements.includes(id);
	};

	// Show level up notification
	const showLevelUpNotification = (level: string) => {
		// Check if notification already shown for this level
		if (progress.shownLevelUps.includes(level)) return;

		// Show toast notification
		toast.success(
			<div className="mt-2">
				<p>
					Congratulations! You&apos;ve advanced to <strong>{level}</strong> level!
				</p>
				<p className="text-sm text-muted-foreground mt-1">
					Keep practicing to reach the next level!
				</p>
			</div>,
			{
				icon: <Award className="w-5 h-5 text-amber-500" />,
				description: "Level Up!",
				duration: 5000,
			}
		);

		// Mark as shown
		markLevelUpShown(level);
		setProgress((prev) => ({
			...prev,
			shownLevelUps: [...prev.shownLevelUps, level],
		}));
	};

	const value = {
		userLevel: progress.level,
		updateUserLevel,
		achievements: progress.achievements,
		recordAchievement,
		checkAchievement,
		showLevelUpNotification,
		isLoading,
	};

	return <UserProgressContext.Provider value={value}>{children}</UserProgressContext.Provider>;
}

// Custom hook to use the user progress context
export function useUserProgress(): UserProgressContextType {
	const context = useContext(UserProgressContext);
	if (context === undefined) {
		throw new Error("useUserProgress must be used within a UserProgressProvider");
	}
	return context;
}
