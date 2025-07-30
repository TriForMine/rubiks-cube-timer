"use client";

import { Settings, Shuffle, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ScrambleStepByStep } from "@/components/ScrambleStepByStep";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateScramble } from "@/lib/scramble";
import { cn } from "@/lib/utils";

interface ScramblePracticeProps {
	className?: string;
}

interface PracticeSettings {
	scrambleLength: number;
	autoPlay: boolean;
	animationSpeed: number;
	autoRotate: boolean;
}

const DEFAULT_SETTINGS: PracticeSettings = {
	scrambleLength: 20,
	autoPlay: false,
	animationSpeed: 1000,
	autoRotate: true,
};

export function ScramblePractice({ className = "" }: ScramblePracticeProps) {
	const [currentScramble, setCurrentScramble] = useState("");
	const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);
	const [showSettings, setShowSettings] = useState(false);

	// Load settings from localStorage on mount
	useEffect(() => {
		try {
			const savedSettings = localStorage.getItem("scramble-practice-settings");
			if (savedSettings) {
				setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
			}
		} catch (error) {
			console.warn("Failed to load settings:", error);
		}
	}, []);

	// Save settings to localStorage when they change
	useEffect(() => {
		try {
			localStorage.setItem("scramble-practice-settings", JSON.stringify(settings));
		} catch (error) {
			console.warn("Failed to save settings:", error);
		}
	}, [settings]);

	const generateNewScramble = useCallback(() => {
		const newScramble = generateScramble(settings.scrambleLength);
		setCurrentScramble(newScramble);
	}, [settings.scrambleLength]);

	// Generate initial scramble
	useEffect(() => {
		if (!currentScramble) {
			generateNewScramble();
		}
	}, [currentScramble, generateNewScramble]);

	return (
		<div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Scramble Practice</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Learn and practice scrambles with 3D visualization
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
						<Settings className="w-4 h-4 mr-2" />
						Settings
					</Button>
					<Button variant="outline" size="sm" onClick={generateNewScramble}>
						<Shuffle className="w-4 h-4 mr-2" />
						New Scramble
					</Button>
				</div>
			</div>

			{/* Settings Panel */}
			{showSettings && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Practice Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div>
								<label htmlFor="scramble-length" className="block text-sm font-medium mb-2">
									Scramble Length
								</label>
								<input
									id="scramble-length"
									type="range"
									min="15"
									max="30"
									value={settings.scrambleLength}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											scrambleLength: Number(e.target.value),
										}))
									}
									className="w-full"
								/>
								<div className="text-xs text-gray-500 mt-1">{settings.scrambleLength} moves</div>
							</div>

							<div>
								<label htmlFor="animation-speed" className="block text-sm font-medium mb-2">
									Animation Speed
								</label>
								<select
									id="animation-speed"
									value={settings.animationSpeed}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											animationSpeed: Number(e.target.value),
										}))
									}
									className="w-full p-2 border rounded text-sm bg-white dark:bg-gray-700"
								>
									<option value={2000}>0.5x (Slow)</option>
									<option value={1000}>1x (Normal)</option>
									<option value={667}>1.5x (Fast)</option>
									<option value={500}>2x (Very Fast)</option>
								</select>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="autoPlay"
									checked={settings.autoPlay}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											autoPlay: e.target.checked,
										}))
									}
								/>
								<label htmlFor="autoPlay" className="text-sm">
									Auto-play scrambles
								</label>
							</div>

							<div className="flex items-center space-x-2">
								<input
									type="checkbox"
									id="autoRotate"
									checked={settings.autoRotate}
									onChange={(e) =>
										setSettings((prev) => ({
											...prev,
											autoRotate: e.target.checked,
										}))
									}
								/>
								<label htmlFor="autoRotate" className="text-sm">
									Auto-rotate cube
								</label>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* 3D Visualization */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center space-x-2">
						<Target className="w-5 h-5" />
						<span>3D Scramble Visualization</span>
					</CardTitle>
				</CardHeader>
				<CardContent>
					{currentScramble && (
						<ScrambleStepByStep
							scramble={currentScramble}
							autoPlay={settings.autoPlay}
							initialSpeed={settings.animationSpeed}
						/>
					)}
				</CardContent>
			</Card>

			{/* Learning Tips */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Learning Tips</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
						<div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
							<div className="font-medium text-blue-800 dark:text-blue-200 mb-2">
								🎯 For Beginners
							</div>
							<ul className="text-blue-700 dark:text-blue-300 space-y-1">
								<li>• Use slower speeds (0.5x - 1x)</li>
								<li>• Enable auto-play to watch full sequences</li>
								<li>• Start with shorter scrambles (15-20 moves)</li>
								<li>• Use step-by-step controls to learn each move</li>
							</ul>
						</div>
						<div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
							<div className="font-medium text-green-800 dark:text-green-200 mb-2">
								🚀 For Advanced Users
							</div>
							<ul className="text-green-700 dark:text-green-300 space-y-1">
								<li>• Use faster speeds (1.5x - 2x)</li>
								<li>• Practice with longer scrambles (25-30 moves)</li>
								<li>• Focus on pattern recognition</li>
								<li>• Use pause/resume for difficult sequences</li>
							</ul>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default ScramblePractice;
