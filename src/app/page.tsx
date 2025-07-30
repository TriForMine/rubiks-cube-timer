"use client";

import { useCallback, useEffect, useState } from "react";
import { AchievementChecker } from "@/components/AchievementChecker";
import { AppLayout } from "@/components/AppLayout";
import { Charts } from "@/components/Charts";
import { PBCelebration } from "@/components/PBCelebration";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { ServiceWorkerStatus } from "@/components/ServiceWorkerStatus";
import { Settings } from "@/components/Settings";
import { Statistics } from "@/components/Statistics";
import { type TimeRecord, TimerView } from "@/components/TimerView";
import { TimesList } from "@/components/TimesList";
import { useSettings } from "@/contexts/SettingsContext";
import { generateScramble } from "@/lib/scramble";

export type { TimeRecord };

export default function Home() {
	const { scrambleLength } = useSettings();
	const [activeTab, setActiveTab] = useState("timer");
	const [times, setTimes] = useState<TimeRecord[]>([]);
	const [currentScramble, setCurrentScramble] = useState("");
	const [showPBCelebration, setShowPBCelebration] = useState(false);
	const [pbCelebrationData, setPBCelebrationData] = useState<{
		newPBTime: number;
		previousPBTime?: number;
	} | null>(null);

	useEffect(() => {
		// Load times from localStorage
		const savedTimes = localStorage.getItem("rubiks-times");
		if (savedTimes) {
			const parsedTimes = JSON.parse(savedTimes);
			setTimes(
				parsedTimes.map((time: TimeRecord) => ({
					...time,
					date: new Date(time.date),
				}))
			);
		}

		// Generate initial scramble
		setCurrentScramble(generateScramble(scrambleLength));
	}, [scrambleLength]);

	useEffect(() => {
		// Save times to localStorage whenever times change
		localStorage.setItem("rubiks-times", JSON.stringify(times));
	}, [times]);

	const handleTimeAdded = useCallback((newTime: TimeRecord) => {
		setTimes((prev) => {
			const newTimes = [newTime, ...prev];

			// Check for PB (Personal Best)
			const validTimes = newTimes.filter((t) => t.penalty !== "DNF");
			const currentBestTime = Math.min(
				...validTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
			);

			const newSolveTime =
				newTime.penalty === "DNF"
					? Infinity
					: newTime.penalty === "+2"
						? newTime.time + 2000
						: newTime.time;

			// Check if this is a new PB
			if (newSolveTime !== Infinity && newSolveTime === currentBestTime) {
				// Find previous PB (excluding the current solve)
				const previousTimes = prev.filter((t) => t.penalty !== "DNF");
				const previousPBTime =
					previousTimes.length > 0
						? Math.min(...previousTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time)))
						: undefined;

				// Only show celebration if it's actually an improvement or first solve
				if (!previousPBTime || newSolveTime < previousPBTime) {
					setPBCelebrationData({
						newPBTime: newSolveTime,
						previousPBTime: previousPBTime,
					});
					setShowPBCelebration(true);
				}
			}

			return newTimes;
		});
	}, []);

	const deleteTime = useCallback((id: string) => {
		setTimes((prev) => prev.filter((time) => time.id !== id));
	}, []);

	const addPenalty = useCallback((id: string, penalty: "DNF" | "+2") => {
		setTimes((prev) => prev.map((time) => (time.id === id ? { ...time, penalty } : time)));
	}, []);

	const clearAllTimes = useCallback(() => {
		setTimes([]);
		localStorage.removeItem("rubiks-times");
	}, []);

	const handleNewScramble = useCallback(() => {
		setCurrentScramble(generateScramble(scrambleLength));
	}, [scrambleLength]);

	// Calculate session stats for sidebar
	const sessionStats = {
		count: times.length,
		bestTime:
			times.length > 0
				? Math.min(
						...times
							.filter((t) => t.penalty !== "DNF")
							.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
					)
				: null,
		avgTime:
			times.length > 0
				? times
						.filter((t) => t.penalty !== "DNF")
						.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
						.reduce((sum, time) => sum + time, 0) / times.filter((t) => t.penalty !== "DNF").length
				: null,
	};

	const renderContent = () => {
		switch (activeTab) {
			case "timer":
				return (
					<TimerView
						onTimeAdded={handleTimeAdded}
						currentScramble={currentScramble}
						onScrambleChange={setCurrentScramble}
						scrambleLength={scrambleLength}
						existingTimes={times}
					/>
				);
			case "statistics":
				return (
					<div className="p-6 space-y-6">
						<Statistics times={times} />
						<Charts times={times} />
					</div>
				);
			case "times":
				return (
					<div className="p-6">
						<TimesList times={times} onDeleteTime={deleteTime} onAddPenalty={addPenalty} />
					</div>
				);
			case "settings":
				return (
					<div className="p-6">
						<Settings
							onClearAllTimes={clearAllTimes}
							onNewScramble={handleNewScramble}
							onImportTimes={(importedTimes) => setTimes(importedTimes)}
						/>
					</div>
				);
			default:
				return null;
		}
	};

	return (
		<AppLayout activeTab={activeTab} onTabChange={setActiveTab} sessionStats={sessionStats}>
			{renderContent()}

			{/* PB Celebration Modal */}
			{pbCelebrationData && (
				<PBCelebration
					isVisible={showPBCelebration}
					newPBTime={pbCelebrationData.newPBTime}
					previousPBTime={pbCelebrationData.previousPBTime}
					onClose={() => {
						setShowPBCelebration(false);
						setPBCelebrationData(null);
					}}
				/>
			)}

			{/* PWA Components */}
			<PWAInstallButton />
			<ServiceWorkerStatus />

			{/* Achievement Checker - runs globally */}
			<AchievementChecker times={times} />
		</AppLayout>
	);
}
