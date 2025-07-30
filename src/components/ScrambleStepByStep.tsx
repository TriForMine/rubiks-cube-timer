"use client";

import { Pause, Play, RotateCcw, Settings, SkipBack, SkipForward } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cube3DViewer from "@/components/Cube3DViewer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrambleStepByStepProps {
	scramble: string;
	onComplete?: () => void;
	onStepComplete?: (step: number, move: string) => void;
	className?: string;
	autoPlay?: boolean;
	initialSpeed?: number;
}

interface PlaybackSettings {
	speed: number;
	enableRotationControls: boolean;
	showMoveHistory: boolean;
}

const SPEED_OPTIONS = [
	{ label: "0.5x", value: 2000 },
	{ label: "1x", value: 1000 },
	{ label: "1.5x", value: 667 },
	{ label: "2x", value: 500 },
	{ label: "3x", value: 333 },
];

export function ScrambleStepByStep({
	scramble,
	onComplete,
	onStepComplete,
	className = "",
	autoPlay = false,
	initialSpeed = 1000,
}: ScrambleStepByStepProps) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const [settings, setSettings] = useState<PlaybackSettings>({
		speed: initialSpeed,
		enableRotationControls: true,
		showMoveHistory: true,
	});
	const [showSettings, setShowSettings] = useState(false);

	const moves = useMemo(() => {
		return scramble
			.trim()
			.split(/\s+/)
			.filter((move) => move.length > 0);
	}, [scramble]);

	const totalSteps = moves.length;

	const handleAnimationComplete = useCallback(() => {
		setIsPlaying(false);
		onComplete?.();
	}, [onComplete]);

	useEffect(() => {
		if (autoPlay && !isPlaying && currentStep === 0) {
			setIsPlaying(true);
		}
	}, [autoPlay, isPlaying, currentStep]);

	// Auto-play step progression
	useEffect(() => {
		if (!isPlaying || currentStep >= totalSteps) {
			if (currentStep >= totalSteps && isPlaying) {
				setIsPlaying(false);
				handleAnimationComplete();
			}
			return;
		}

		const timer = setTimeout(() => {
			setCurrentStep(currentStep + 1);
		}, settings.speed + 200); // Add small delay between moves

		return () => clearTimeout(timer);
	}, [isPlaying, currentStep, totalSteps, settings.speed, handleAnimationComplete]);

	const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

	return (
		<div className={cn("w-full max-w-4xl mx-auto", className)}>
			{/* 3D Cube Visualization */}
			<div className="mb-6">
				<Cube3DViewer
					width={400}
					height={400}
					scramble={scramble}
					stepByStep={true}
					currentStep={currentStep}
					animationSpeed={settings.speed}
					enableRotationControls={settings.enableRotationControls}
					className="w-full"
					onScrambleComplete={handleAnimationComplete}
					onStepComplete={onStepComplete}
				/>
			</div>

			{/* Progress Bar */}
			<div className="mb-4">
				<div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
					<span>
						Step {currentStep} of {totalSteps}
					</span>
					<span>{progress.toFixed(1)}%</span>
				</div>
				<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
					<div
						className="bg-blue-500 h-2 rounded-full transition-all duration-300"
						style={{ width: `${progress}%` }}
					/>
				</div>
			</div>

			{/* Playback Controls */}
			<div className="flex justify-center items-center gap-2 mb-4">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentStep(0)}
					disabled={currentStep === 0}
				>
					<SkipBack className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
					disabled={currentStep === 0}
				>
					Previous
				</Button>
				<Button
					variant={isPlaying ? "outline" : "default"}
					size="sm"
					onClick={() => setIsPlaying(!isPlaying)}
					disabled={currentStep >= totalSteps}
				>
					{isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
					disabled={currentStep >= totalSteps}
				>
					Next
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setCurrentStep(totalSteps)}
					disabled={currentStep >= totalSteps}
				>
					<SkipForward className="w-4 h-4" />
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setCurrentStep(0);
						setIsPlaying(false);
					}}
				>
					<RotateCcw className="w-4 h-4" />
				</Button>
			</div>

			{/* Current Move Display */}
			{currentStep > 0 && moves[currentStep - 1] && (
				<div className="text-center mb-4">
					<div className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-mono">
						Move {currentStep}: {moves[currentStep - 1]}
					</div>
				</div>
			)}

			{/* Settings Toggle */}
			<div className="flex justify-center mb-4">
				<Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
					<Settings className="w-4 h-4 mr-2" />
					Settings
				</Button>
			</div>

			{/* Settings Panel */}
			{showSettings && (
				<div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
					<h3 className="text-sm font-semibold mb-3">Playback Settings</h3>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label htmlFor="speed-select" className="block text-sm font-medium mb-2">
								Speed
							</label>
							<select
								id="speed-select"
								value={settings.speed}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										speed: Number(e.target.value),
									}))
								}
								className="w-full p-2 border rounded text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
							>
								{SPEED_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="enableRotationControls"
								checked={settings.enableRotationControls}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										enableRotationControls: e.target.checked,
									}))
								}
								className="rounded"
							/>
							<label htmlFor="enableRotationControls" className="text-sm">
								Enable rotation controls
							</label>
						</div>

						<div className="flex items-center space-x-2">
							<input
								type="checkbox"
								id="showHistory"
								checked={settings.showMoveHistory}
								onChange={(e) =>
									setSettings((prev) => ({
										...prev,
										showMoveHistory: e.target.checked,
									}))
								}
								className="rounded"
							/>
							<label htmlFor="showHistory" className="text-sm">
								Show move history
							</label>
						</div>
					</div>
				</div>
			)}

			{/* Move History */}
			{settings.showMoveHistory && totalSteps > 0 && (
				<div className="mb-4">
					<h3 className="text-sm font-semibold mb-2">Move History</h3>
					<div className="flex flex-wrap gap-1">
						{moves.map((move, index) => (
							<button
								type="button"
								key={`move-${index}-${move}`}
								onClick={() => setCurrentStep(index + 1)}
								className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
									index < currentStep
										? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
										: index === currentStep - 1
											? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 ring-2 ring-blue-400"
											: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
								}`}
							>
								{move}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Empty State */}
			{totalSteps === 0 && (
				<div className="text-center p-8 text-gray-500 dark:text-gray-400">
					<div className="text-lg mb-2">No scramble provided</div>
					<div className="text-sm">
						Enter a scramble sequence to see the step-by-step visualization
					</div>
				</div>
			)}
		</div>
	);
}

export default ScrambleStepByStep;
