"use client";

import { useCallback, useEffect, useState } from "react";
import { AchievementChecker } from "@/components/AchievementChecker";
import { AppLayout } from "@/components/AppLayout";

import { PBCelebration } from "@/components/PBCelebration";
import { PWAInstallButton } from "@/components/PWAInstallButton";
import { ScramblePractice } from "@/components/ScramblePractice";
import { ServiceWorkerStatus } from "@/components/ServiceWorkerStatus";
import { Settings } from "@/components/Settings";
import { Statistics } from "@/components/Statistics";
import { type TimeRecord, TimerView } from "@/components/TimerView";
import { TimesList } from "@/components/TimesList";
import { useSettings } from "@/contexts/SettingsContext";
import { useTinybaseStore } from "@/hooks/useTinybaseStore";
import { generateScramble } from "@/lib/cube-wasm";

export type { TimeRecord };

export default function Home() {
	const { scrambleLength } = useSettings();
	const [activeTab, setActiveTab] = useState("timer");
	const [currentScramble, setCurrentScramble] = useState("");
	const [showPBCelebration, setShowPBCelebration] = useState(false);
	const [pbCelebrationData, setPBCelebrationData] = useState<{
		newPBTime: number;
		previousPBTime?: number;
	} | null>(null);

	// Use TinyBase store
	const {
		times,
		sessionStats,
		addNewTime,
		removeTime,
		updateTimeWithPenalty,
		clearAllUserData,
		isLoading,
		error,
	} = useTinybaseStore();

	useEffect(() => {
		// Generate initial scramble
		generateScramble(scrambleLength).then(setCurrentScramble);
	}, [scrambleLength]);

	const handleTimeAdded = useCallback(
		(newTime: TimeRecord) => {
			// Add time to store
			addNewTime(newTime);

			// Check for PB (Personal Best)
			const validTimes = times.filter((t) => t.penalty !== "DNF");
			const newTimes = [newTime, ...times];
			const allValidTimes = newTimes.filter((t) => t.penalty !== "DNF");

			const currentBestTime = Math.min(
				...allValidTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time))
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
				const previousPBTime =
					validTimes.length > 0
						? Math.min(...validTimes.map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time)))
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
		},
		[addNewTime, times]
	);

	const deleteTime = useCallback(
		(id: string) => {
			removeTime(id);
		},
		[removeTime]
	);

	const addPenalty = useCallback(
		(id: string, penalty: "DNF" | "+2") => {
			updateTimeWithPenalty(id, penalty);
		},
		[updateTimeWithPenalty]
	);

	const clearAllTimes = useCallback(async () => {
		await clearAllUserData();
	}, [clearAllUserData]);

	const handleNewScramble = useCallback(async () => {
		const newScramble = await generateScramble(scrambleLength);
		setCurrentScramble(newScramble);
	}, [scrambleLength]);

	const renderContent = () => {
		switch (activeTab) {
			case "timer":
				return (
					<TimerView
						onTimeAdded={handleTimeAdded}
						onDeleteTime={deleteTime}
						currentScramble={currentScramble}
						onScrambleChange={setCurrentScramble}
						scrambleLength={scrambleLength}
						existingTimes={times}
					/>
				);
			case "scramble-practice":
				return (
					<div className="p-6">
						<ScramblePractice />
					</div>
				);
			case "statistics":
				return (
					<div className="p-6">
						<Statistics times={times} />
					</div>
				);
			case "times":
				return (
					<div className="p-6">
						<TimesList
							times={times.map((t) => ({
								...t,
								date: t.date,
							}))}
							onDeleteTime={deleteTime}
							onAddPenalty={addPenalty}
						/>
					</div>
				);
			case "settings":
				return (
					<div className="p-6">
						<Settings
							onClearAllTimes={clearAllTimes}
							onNewScramble={handleNewScramble}
							onImportTimes={() => {}} // Will be handled by TinyBase backup/restore
						/>
					</div>
				);
			default:
				return null;
		}
	};

	// Show loading or error states
	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
					<p>Initializing storage...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center text-red-500">
					<p>Error initializing storage: {error}</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

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
