"use client";

import {
	Clock,
	Download,
	Flame,
	Info,
	Keyboard,
	Palette,
	RefreshCw,
	Settings as SettingsIcon,
	Shield,
	Sliders,
	Target,
	Trash2,
	Upload,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { useTinybaseStore } from "@/hooks/useTinybaseStore";
import { cn } from "@/lib/utils";

interface SettingsProps {
	onClearAllTimes: () => void;
	onImportTimes?: () => void;
	onNewScramble?: () => void;
}

export function Settings({ onClearAllTimes, onNewScramble }: SettingsProps) {
	const { scrambleLength, showMilliseconds, timeFormat, updateSetting } = useSettings();
	const {
		times,
		achievements,
		dailyGoal,
		streakGoal,
		setDailyGoal,
		setStreakGoal,
		exportAllData,
		importAllData,
		clearAllUserData,
		isInitialized,
	} = useTinybaseStore();

	const [showConfirmClear, setShowConfirmClear] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [backupInfo, setBackupInfo] = useState<{
		totalTimes: number;
		totalAchievements: number;
		dailyProgressDays: number;
		userLevel: string;
		currentStreak: number;
	} | null>(null);
	const backupInputRef = useRef<HTMLInputElement>(null);

	// Get backup preview info
	useEffect(() => {
		if (isInitialized) {
			try {
				const preview = exportAllData();
				setBackupInfo({
					totalTimes: preview.metadata.totalTimes,
					totalAchievements: preview.metadata.totalAchievements,
					dailyProgressDays: preview.metadata.dailyProgressDays,
					userLevel: preview.metadata.userLevel,
					currentStreak: preview.metadata.currentStreak,
				});
			} catch (error) {
				console.error("Failed to get backup preview:", error);
			}
		}
	}, [isInitialized, exportAllData]);

	const handleExportData = async () => {
		try {
			setIsExporting(true);
			const backupData = exportAllData();

			const blob = new Blob([JSON.stringify(backupData, null, 2)], {
				type: "application/json",
			});

			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `cube-timer-backup-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			alert("Failed to export data");
			console.error("Export error:", error);
		} finally {
			setIsExporting(false);
		}
	};

	const handleImportClick = () => {
		backupInputRef.current?.click();
	};

	const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsImporting(true);

		try {
			const text = await file.text();
			const backupData = JSON.parse(text);

			if (!backupData.version || !backupData.tables || !backupData.values) {
				throw new Error("Invalid backup format");
			}

			await importAllData(backupData);

			// Show detailed import success message
			const { metadata } = backupData;
			alert(
				`Data imported successfully!\n\n` +
					`Imported:\n` +
					`• ${metadata.totalTimes} solve times\n` +
					`• ${metadata.totalAchievements} achievements\n` +
					`• ${metadata.dailyProgressDays} days of progress\n` +
					`• User level: ${metadata.userLevel}\n` +
					`• Current streak: ${metadata.currentStreak}`
			);
		} catch (error) {
			alert("Failed to import data. Please check the file format.");
			console.error("Import error:", error);
		} finally {
			setIsImporting(false);
			event.target.value = "";
		}
	};

	const handleClearAllData = async () => {
		if (showConfirmClear) {
			await clearAllUserData();
			setShowConfirmClear(false);
		} else {
			setShowConfirmClear(true);
			setTimeout(() => setShowConfirmClear(false), 5000);
		}
	};

	const SettingCard = ({
		icon: Icon,
		title,
		description,
		children,
		className,
	}: {
		icon: React.ComponentType<{ className?: string }>;
		title: string;
		description: string;
		children: React.ReactNode;
		className?: string;
	}) => (
		<Card className={cn("shadow-lg border-border/50 overflow-hidden", className)}>
			<CardHeader className="pb-4">
				<div className="flex items-center gap-3">
					<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl border border-primary/20">
						<Icon className="w-5 h-5 text-primary" />
					</div>
					<div>
						<CardTitle className="text-lg font-bold">{title}</CardTitle>
						<p className="text-sm text-muted-foreground">{description}</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	);

	return (
		<div className="space-y-8 p-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20">
					<SettingsIcon className="w-6 h-6 text-primary" />
				</div>
				<div>
					<h1 className="text-2xl font-bold">Settings</h1>
					<p className="text-muted-foreground">Customize your speedcubing experience</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Timer Settings */}
				<SettingCard
					icon={Sliders}
					title="Timer Configuration"
					description="Adjust timer behavior and scramble settings"
				>
					<div className="space-y-6">
						{/* Scramble Length */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label htmlFor="scramble-length" className="text-sm font-semibold text-foreground">
									Scramble Length
								</label>
								<div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
									<span className="text-sm font-mono font-bold text-primary">{scrambleLength}</span>
									<span className="text-xs text-muted-foreground">moves</span>
								</div>
							</div>

							<div className="relative">
								<input
									id="scramble-length"
									type="range"
									min="15"
									max="30"
									value={scrambleLength}
									onChange={(e) => updateSetting("scrambleLength", Number(e.target.value))}
									className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((scrambleLength - 15) / (30 - 15)) * 100}%, hsl(var(--muted)) ${((scrambleLength - 15) / (30 - 15)) * 100}%, hsl(var(--muted)) 100%)`,
									}}
								/>
								<div className="flex justify-between text-xs text-muted-foreground mt-2">
									<span>15 (Short)</span>
									<span>22 (Standard)</span>
									<span>30 (Long)</span>
								</div>
							</div>
						</div>

						{/* Quick Scramble Button */}
						<Button onClick={onNewScramble} variant="outline" size="lg" className="w-full group">
							<RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" />
							Generate New Scramble
						</Button>
					</div>
				</SettingCard>

				{/* Display Settings */}
				<SettingCard
					icon={Palette}
					title="Display Options"
					description="Customize how times and information are shown"
				>
					<div className="space-y-6">
						{/* Time Format */}
						<div className="space-y-3">
							<label htmlFor="time-format" className="text-sm font-semibold text-foreground">
								Time Format
							</label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									className={cn(
										"p-3 rounded-lg border-2 transition-all duration-200 text-left",
										timeFormat === "seconds"
											? "border-primary bg-primary/10 text-primary"
											: "border-border hover:border-border/80 hover:bg-muted/50"
									)}
									onClick={() => updateSetting("timeFormat", "seconds")}
								>
									<div className="font-mono font-bold">12.34</div>
									<div className="text-xs text-muted-foreground">Seconds</div>
								</button>
								<button
									type="button"
									className={cn(
										"p-3 rounded-lg border-2 transition-all duration-200 text-left",
										timeFormat === "milliseconds"
											? "border-primary bg-primary/10 text-primary"
											: "border-border hover:border-border/80 hover:bg-muted/50"
									)}
									onClick={() => updateSetting("timeFormat", "milliseconds")}
								>
									<div className="font-mono font-bold">12.345</div>
									<div className="text-xs text-muted-foreground">Milliseconds</div>
								</button>
							</div>
						</div>

						{/* Show Milliseconds Toggle */}
						<div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
							<div>
								<div className="font-semibold text-sm">Show Milliseconds</div>
								<div className="text-xs text-muted-foreground">
									Display precise timing information
								</div>
							</div>
							<button
								type="button"
								className={cn(
									"relative w-11 h-6 rounded-full transition-colors duration-200",
									showMilliseconds ? "bg-primary" : "bg-muted"
								)}
								onClick={() => updateSetting("showMilliseconds", !showMilliseconds)}
							>
								<div
									className={cn(
										"absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
										showMilliseconds ? "translate-x-5" : "translate-x-0.5"
									)}
								/>
							</button>
						</div>
					</div>
				</SettingCard>

				{/* Data Management */}
				<SettingCard
					icon={Shield}
					title="Data Management"
					description="Complete backup, restore, and manage all your data"
				>
					<div className="space-y-4">
						{/* Backup Preview */}
						{backupInfo && (
							<div className="p-4 bg-muted/30 rounded-lg border">
								<h4 className="font-semibold text-sm mb-2">What will be exported:</h4>
								<div className="grid grid-cols-2 gap-2 text-xs">
									<div className="flex justify-between">
										<span>Solve Times:</span>
										<span className="font-mono">{backupInfo.totalTimes}</span>
									</div>
									<div className="flex justify-between">
										<span>Achievements:</span>
										<span className="font-mono">{backupInfo.totalAchievements}</span>
									</div>
									<div className="flex justify-between">
										<span>Daily Progress:</span>
										<span className="font-mono">{backupInfo.dailyProgressDays} days</span>
									</div>
									<div className="flex justify-between">
										<span>Current Streak:</span>
										<span className="font-mono">{backupInfo.currentStreak}</span>
									</div>
								</div>
								<div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
									<div>
										User Level: <span className="font-medium">{backupInfo.userLevel}</span>
									</div>
									<div className="mt-1">✓ All settings, statistics, and progress data included</div>
								</div>
							</div>
						)}

						<Button
							onClick={handleExportData}
							disabled={isExporting}
							variant="default"
							size="lg"
							className="w-full group"
						>
							<Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform duration-200" />
							{isExporting ? "Exporting..." : "Export Complete Backup"}
						</Button>

						<div>
							<input
								ref={backupInputRef}
								type="file"
								accept=".json"
								onChange={handleImportData}
								disabled={isImporting}
								className="hidden"
							/>
							<Button
								onClick={handleImportClick}
								disabled={isImporting}
								variant="secondary"
								size="lg"
								className="w-full"
							>
								<Upload className="w-5 h-5 mr-2" />
								{isImporting ? "Importing..." : "Import Backup"}
							</Button>
						</div>

						<div className="border-t pt-4">
							<Button
								onClick={handleClearAllData}
								variant={showConfirmClear ? "destructive" : "outline"}
								size="lg"
								className="w-full"
							>
								<Trash2 className="w-5 h-5 mr-2" />
								{showConfirmClear ? "Click to Confirm" : "Clear All Data"}
							</Button>

							{showConfirmClear && (
								<div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
									<p className="text-sm text-destructive font-medium text-center">
										⚠️ This will permanently delete all your data!
									</p>
									<div className="text-xs text-destructive/80 mt-1 text-center">
										Times • Achievements • Statistics • Progress • Settings
									</div>
								</div>
							)}
						</div>

						{/* Import/Export Info */}
						<div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
							<div className="text-xs text-blue-700 dark:text-blue-300">
								<div className="font-medium mb-1">📦 Complete Data Backup Includes:</div>
								<div className="grid grid-cols-2 gap-1">
									<div>• All solve times & penalties</div>
									<div>• Personal best records</div>
									<div>• Achievement progress</div>
									<div>• Daily solve tracking</div>
									<div>• Streak counters</div>
									<div>• User level & settings</div>
									<div>• Statistics & averages</div>
									<div>• Progress history</div>
								</div>
							</div>
						</div>
					</div>
				</SettingCard>

				{/* Daily Practice Settings */}
				<SettingCard
					icon={Target}
					title="Daily Practice"
					description="Set daily goals and streak targets"
				>
					<div className="space-y-6">
						{/* Daily Goal */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label htmlFor="daily-goal" className="text-sm font-semibold text-foreground">
									Daily Solve Goal
								</label>
								<div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
									<span className="text-sm font-mono font-bold text-primary">{dailyGoal}</span>
									<span className="text-xs text-muted-foreground">solves</span>
								</div>
							</div>

							<div className="relative">
								<input
									id="daily-goal"
									type="range"
									min="5"
									max="50"
									value={dailyGoal}
									onChange={(e) => setDailyGoal(Number(e.target.value))}
									className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((dailyGoal - 5) / (50 - 5)) * 100}%, hsl(var(--muted)) ${((dailyGoal - 5) / (50 - 5)) * 100}%, hsl(var(--muted)) 100%)`,
									}}
								/>
								<div className="flex justify-between text-xs text-muted-foreground mt-2">
									<span>5 (Light)</span>
									<span>20 (Standard)</span>
									<span>50 (Intensive)</span>
								</div>
							</div>
						</div>

						{/* Streak Goal */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<label htmlFor="streak-goal" className="text-sm font-semibold text-foreground">
									Streak Target
								</label>
								<div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
									<Flame className="w-3 h-3 text-orange-500" />
									<span className="text-sm font-mono font-bold text-primary">{streakGoal}</span>
									<span className="text-xs text-muted-foreground">days</span>
								</div>
							</div>

							<div className="relative">
								<input
									id="streak-goal"
									type="range"
									min="3"
									max="30"
									value={streakGoal}
									onChange={(e) => setStreakGoal(Number(e.target.value))}
									className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
									style={{
										background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((streakGoal - 3) / (30 - 3)) * 100}%, hsl(var(--muted)) ${((streakGoal - 3) / (30 - 3)) * 100}%, hsl(var(--muted)) 100%)`,
									}}
								/>
								<div className="flex justify-between text-xs text-muted-foreground mt-2">
									<span>3 (Beginner)</span>
									<span>14 (Challenge)</span>
									<span>30 (Master)</span>
								</div>
							</div>
						</div>
					</div>
				</SettingCard>

				{/* Keyboard Shortcuts */}
				<SettingCard
					icon={Keyboard}
					title="Keyboard Shortcuts"
					description="Quick reference for keyboard controls"
				>
					<div className="space-y-3">
						{[
							{ key: "SPACE", action: "Start/Stop Timer", icon: Clock },
							{ key: "N", action: "New Scramble", icon: RefreshCw },
							{ key: "DEL", action: "Delete Last Time", icon: Trash2 },
						].map((shortcut) => (
							<div
								key={shortcut.key}
								className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<shortcut.icon className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm font-medium">{shortcut.action}</span>
								</div>
								<div className="bg-muted px-3 py-1.5 rounded-md border">
									<code className="text-xs font-mono font-bold">{shortcut.key}</code>
								</div>
							</div>
						))}
					</div>
				</SettingCard>
			</div>

			{/* About Section */}
			<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl border border-blue-500/20">
								<Info className="w-5 h-5 text-blue-500" />
							</div>
							<div>
								<h3 className="font-bold text-lg">CubeTimer v0.1.0</h3>
								<p className="text-sm text-muted-foreground">
									Professional speedcubing timer with TinyBase storage
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Zap className="w-4 h-4 text-primary" />
							<span>Powered by TinyBase & IndexedDB</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
