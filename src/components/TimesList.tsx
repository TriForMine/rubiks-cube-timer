"use client";

import {
	Calendar,
	ChevronDown,
	Clock,
	Eye,
	EyeOff,
	Filter,
	Search,
	Target,
	Timer,
	Trash2,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useState } from "react";
import type { TimeRecord } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/contexts/SettingsContext";
import { cn, formatTimeWithSettings, getTimeColor } from "@/lib/utils";

interface TimesListProps {
	times: TimeRecord[];
	onDeleteTime: (id: string) => void;
	onAddPenalty: (id: string, penalty: "DNF" | "+2") => void;
}

export function TimesList({ times, onDeleteTime, onAddPenalty }: TimesListProps) {
	const { showMilliseconds, timeFormat } = useSettings();
	const [expandedTime, setExpandedTime] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterPenalty, setFilterPenalty] = useState<"all" | "clean" | "penalty">("all");
	const [showDetails, setShowDetails] = useState(true);

	const best = times.length > 0 ? Math.min(...times.map((t) => t.time)) : null;

	const formatTimeWithPenalty = (time: TimeRecord) => {
		if (time.penalty === "DNF") {
			return "DNF";
		}

		const baseTime = time.penalty === "+2" ? time.time + 2000 : time.time;
		const formatted = formatTimeWithSettings(baseTime, showMilliseconds, timeFormat);

		return time.penalty === "+2" ? `${formatted}+` : formatted;
	};

	const getEffectiveTime = (time: TimeRecord) => {
		if (time.penalty === "DNF") return Infinity;
		return time.penalty === "+2" ? time.time + 2000 : time.time;
	};

	const handleTimeClick = (id: string) => {
		setExpandedTime(expandedTime === id ? null : id);
	};

	const handlePenaltyToggle = (time: TimeRecord) => {
		if (time.penalty === "DNF") {
			onAddPenalty(time.id, "+2");
			setTimeout(() => onAddPenalty(time.id, undefined as unknown as "DNF" | "+2"), 50);
		} else if (time.penalty === "+2") {
			onAddPenalty(time.id, "DNF");
		} else {
			onAddPenalty(time.id, "+2");
		}
	};

	// Filter times based on search and penalty filter
	const filteredTimes = times.filter((time) => {
		const matchesSearch =
			time.scramble.toLowerCase().includes(searchTerm.toLowerCase()) ||
			formatTimeWithPenalty(time).toLowerCase().includes(searchTerm.toLowerCase());

		const matchesFilter =
			filterPenalty === "all" ||
			(filterPenalty === "clean" && !time.penalty) ||
			(filterPenalty === "penalty" && time.penalty);

		return matchesSearch && matchesFilter;
	});

	// Calculate statistics
	const validTimes = times.filter((t) => t.penalty !== "DNF");
	const dnfCount = times.filter((t) => t.penalty === "DNF").length;
	const plusTwoCount = times.filter((t) => t.penalty === "+2").length;

	if (times.length === 0) {
		return (
			<div className="space-y-6">
				<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
					<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:40px_40px]" />
					</div>

					<CardHeader className="pb-4 relative">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
								<Clock className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Times History</CardTitle>
								<p className="text-sm text-muted-foreground">Your solve records and statistics</p>
							</div>
						</div>
					</CardHeader>

					<CardContent className="text-center py-16 relative">
						<div className="max-w-md mx-auto space-y-6">
							<div className="relative">
								<div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center border border-border/50">
									<Timer className="w-12 h-12 text-muted-foreground/50" />
								</div>
							</div>

							<div className="space-y-3">
								<h3 className="text-2xl font-bold text-foreground">No Times Yet</h3>
								<p className="text-muted-foreground leading-relaxed">
									Start solving to build your times history! Every solve will be recorded here with
									detailed statistics.
								</p>
							</div>

							<div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
								<div className="flex items-center justify-center gap-2 text-primary font-semibold">
									<Target className="w-4 h-4" />
									<span>Complete your first solve to get started!</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header with Statistics */}
			<Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
				<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:30px_30px]" />
				</div>

				<CardHeader className="pb-4 relative">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
								<Clock className="w-6 h-6 text-blue-500" />
							</div>
							<div>
								<CardTitle className="text-xl font-bold">Times History</CardTitle>
								<p className="text-sm text-muted-foreground">
									{times.length} total solves • {validTimes.length} valid •{" "}
									{dnfCount + plusTwoCount} penalties
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<div className="flex items-center gap-3 text-sm">
								<div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
									<div className="w-2 h-2 rounded-full bg-green-500" />
									<span className="font-semibold">{validTimes.length} OK</span>
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
					</div>
				</CardHeader>
			</Card>

			{/* Controls */}
			<Card className="shadow-md border-border/50">
				<CardContent className="p-4">
					<div className="flex flex-col sm:flex-row gap-4 items-center">
						{/* Search */}
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<input
								type="text"
								placeholder="Search times or scrambles..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
							/>
						</div>

						{/* Filter */}
						<div className="flex items-center gap-2">
							<Filter className="w-4 h-4 text-muted-foreground" />
							<select
								value={filterPenalty}
								onChange={(e) => setFilterPenalty(e.target.value as "all" | "clean" | "penalty")}
								className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
							>
								<option value="all">All Times</option>
								<option value="clean">Clean Times</option>
								<option value="penalty">With Penalties</option>
							</select>
						</div>

						{/* Toggle Details */}
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowDetails(!showDetails)}
							className="flex items-center gap-2"
						>
							{showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
							{showDetails ? "Hide" : "Show"} Details
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Times List */}
			<div className="space-y-3">
				{filteredTimes.map((time, index) => (
					<Card
						key={time.id}
						className={cn(
							"transition-all duration-200 hover:shadow-md cursor-pointer border-l-4 overflow-hidden",
							expandedTime === time.id
								? "shadow-lg bg-accent/30 border-l-primary"
								: "hover:bg-accent/20 border-l-transparent",
							time.penalty === "DNF" && "border-l-red-500/50",
							time.penalty === "+2" && "border-l-yellow-500/50",
							!time.penalty && getEffectiveTime(time) === best && "border-l-green-500/50"
						)}
					>
						<CardContent className="p-4">
							<button
								type="button"
								className="flex items-center justify-between w-full text-left"
								onClick={() => handleTimeClick(time.id)}
							>
								<div className="flex items-center gap-4">
									{/* Rank Badge */}
									<div
										className={cn(
											"flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border-2",
											getEffectiveTime(time) === best
												? "bg-gradient-to-br from-yellow-400 to-yellow-500 text-yellow-900 border-yellow-300"
												: index < 3
													? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary border-primary/20"
													: "bg-muted text-muted-foreground border-border"
										)}
									>
										{getEffectiveTime(time) === best ? (
											<Trophy className="w-3 h-3" />
										) : (
											`#${index + 1}`
										)}
									</div>

									{/* Time Display */}
									<div className="flex items-center gap-3">
										<span
											className={cn(
												"font-mono text-2xl font-bold tabular-nums",
												time.penalty === "DNF"
													? "text-red-500 dark:text-red-400"
													: getTimeColor(getEffectiveTime(time), best)
											)}
										>
											{formatTimeWithPenalty(time)}
										</span>

										{time.penalty && (
											<div
												className={cn(
													"px-2 py-1 rounded-md text-xs font-bold border",
													time.penalty === "DNF"
														? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
														: "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
												)}
											>
												{time.penalty}
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center gap-4">
									{showDetails && (
										<div className="text-right">
											<div className="text-sm font-medium text-foreground">
												{(time.date instanceof Date
													? time.date
													: new Date(time.date)
												).toLocaleDateString()}
											</div>
											<div className="text-xs text-muted-foreground">
												{(time.date instanceof Date
													? time.date
													: new Date(time.date)
												).toLocaleTimeString()}
											</div>
										</div>
									)}

									<div className="inline-flex items-center justify-center h-8 w-8">
										<ChevronDown
											className={cn(
												"w-4 h-4 transition-transform duration-200",
												expandedTime === time.id && "rotate-180"
											)}
										/>
									</div>
								</div>
							</button>

							{/* Expanded Details */}
							{expandedTime === time.id && (
								<div className="mt-6 pt-6 border-t border-border space-y-6 animate-fade-in">
									{/* Scramble */}
									<div className="space-y-3">
										<div className="flex items-center gap-2">
											<Target className="w-4 h-4 text-muted-foreground" />
											<h4 className="font-semibold text-sm">Scramble</h4>
										</div>
										<div className="bg-muted/50 p-4 rounded-xl border">
											<div className="flex flex-wrap gap-1 font-mono text-sm">
												{time.scramble.split(" ").map((move, moveIndex) => (
													<span
														key={`${time.id}-move-${moveIndex}-${move}`}
														className="px-2 py-1 bg-background rounded border text-center min-w-[2rem]"
													>
														{move}
													</span>
												))}
											</div>
										</div>
									</div>

									{/* Time Details */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4 text-muted-foreground" />
												<h4 className="font-semibold text-sm">Date & Time</h4>
											</div>
											<div className="bg-muted/30 p-3 rounded-lg">
												<div className="text-sm font-medium">
													{(time.date instanceof Date
														? time.date
														: new Date(time.date)
													).toLocaleDateString()}
												</div>
												<div className="text-xs text-muted-foreground">
													{(time.date instanceof Date
														? time.date
														: new Date(time.date)
													).toLocaleTimeString()}
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<TrendingUp className="w-4 h-4 text-muted-foreground" />
												<h4 className="font-semibold text-sm">Performance</h4>
											</div>
											<div className="bg-muted/30 p-3 rounded-lg">
												<div className="text-sm">
													{best && getEffectiveTime(time) === best ? (
														<span className="text-green-600 dark:text-green-400 font-semibold">
															Personal Best! 🏆
														</span>
													) : best ? (
														<span className="text-muted-foreground">
															+
															{formatTimeWithSettings(
																getEffectiveTime(time) - best,
																showMilliseconds,
																timeFormat
															)}{" "}
															from PB
														</span>
													) : (
														<span className="text-muted-foreground">First solve</span>
													)}
												</div>
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="flex flex-wrap gap-3 pt-2">
										<Button
											variant="outline"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												handlePenaltyToggle(time);
											}}
										>
											{time.penalty === "DNF"
												? "Remove DNF"
												: time.penalty === "+2"
													? "Remove +2"
													: "Add +2"}
										</Button>

										<Button
											variant={time.penalty === "DNF" ? "destructive" : "outline"}
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												onAddPenalty(time.id, "DNF");
											}}
										>
											{time.penalty === "DNF" ? "DNF Applied" : "Mark as DNF"}
										</Button>

										<div className="flex-1" />

										<Button
											variant="destructive"
											size="sm"
											onClick={(e) => {
												e.stopPropagation();
												if (confirm("Are you sure you want to delete this time?")) {
													onDeleteTime(time.id);
												}
											}}
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete
										</Button>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>

			{/* Footer Info */}
			{filteredTimes.length !== times.length && (
				<Card className="shadow-sm border-border/50">
					<CardContent className="p-4 text-center">
						<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
							<Filter className="w-4 h-4" />
							<span>
								Showing {filteredTimes.length} of {times.length} times
								{searchTerm && ` matching "${searchTerm}"`}
								{filterPenalty !== "all" && ` with ${filterPenalty} filter`}
							</span>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
