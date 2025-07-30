"use client";

import { Activity, BarChart3, Clock, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { TimeRecord } from "@/app/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTime } from "@/lib/utils";

interface ChartsProps {
	times: TimeRecord[];
}

export function Charts({ times }: ChartsProps) {
	const chartData = useMemo(() => {
		if (times.length === 0) return { progression: [], distribution: [], ao5Data: [] };

		// Filter out DNF times for charts
		const validTimes = times
			.filter((time) => time.penalty !== "DNF")
			.map((time) => ({
				...time,
				effectiveTime: time.penalty === "+2" ? time.time + 2000 : time.time,
			}))
			.reverse(); // Reverse to show chronological order

		// Time progression data
		const progression = validTimes.map((time, index) => ({
			solve: index + 1,
			time: time.effectiveTime / 1000,
			formattedTime: formatTime(time.effectiveTime),
			date: (time.date instanceof Date ? time.date : new Date(time.date)).toLocaleDateString(),
			scramble: `${time.scramble.substring(0, 20)}...`,
		}));

		// Ao5 progression
		const ao5Data = [];
		for (let i = 4; i < validTimes.length; i++) {
			const last5 = validTimes.slice(i - 4, i + 1).map((t) => t.effectiveTime);
			const sorted = [...last5].sort((a, b) => a - b);
			const ao5 = sorted.slice(1, -1).reduce((sum, time) => sum + time, 0) / 3;

			ao5Data.push({
				solve: i + 1,
				ao5: ao5 / 1000,
				formattedAo5: formatTime(ao5),
			});
		}

		// Time distribution (histogram)
		const minTime = Math.min(...validTimes.map((t) => t.effectiveTime));
		const maxTime = Math.max(...validTimes.map((t) => t.effectiveTime));
		const buckets = 10;
		const bucketSize = (maxTime - minTime) / buckets;

		const distribution = Array.from({ length: buckets }, (_, i) => {
			const bucketStart = minTime + i * bucketSize;
			const bucketEnd = bucketStart + bucketSize;
			const count = validTimes.filter(
				(t) => t.effectiveTime >= bucketStart && t.effectiveTime < bucketEnd
			).length;

			return {
				range: `${(bucketStart / 1000).toFixed(1)}-${(bucketEnd / 1000).toFixed(1)}s`,
				count,
				percentage: ((count / validTimes.length) * 100).toFixed(1),
			};
		});

		return { progression, distribution, ao5Data };
	}, [times]);

	const stats = useMemo(() => {
		const validTimes = times
			.filter((time) => time.penalty !== "DNF")
			.map((time) => (time.penalty === "+2" ? time.time + 2000 : time.time));

		if (validTimes.length === 0) return null;

		const best = Math.min(...validTimes);
		const worst = Math.max(...validTimes);
		const mean = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
		const median = validTimes.sort()[Math.floor(validTimes.length / 2)];

		return { best, worst, mean, median, count: validTimes.length };
	}, [times]);

	if (times.length === 0) {
		return (
			<div className="p-8 text-center">
				<BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
				<h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
				<p className="text-muted-foreground">
					Complete some solves to see your progress charts and analysis.
				</p>
			</div>
		);
	}

	const CustomTooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: Array<{ payload: { formattedTime: string; date?: string } }>;
		label?: string | number;
	}) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-card border rounded-lg p-3 shadow-lg">
					<p className="font-medium">Solve #{label}</p>
					<p className="text-primary">
						Time: <span className="font-mono">{payload[0].payload.formattedTime}</span>
					</p>
					{payload[0].payload.date && (
						<p className="text-muted-foreground text-sm">{payload[0].payload.date}</p>
					)}
				</div>
			);
		}
		return null;
	};

	const Ao5Tooltip = ({
		active,
		payload,
		label,
	}: {
		active?: boolean;
		payload?: Array<{ payload: { formattedAo5: string } }>;
		label?: string | number;
	}) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-card border rounded-lg p-3 shadow-lg">
					<p className="font-medium">Solve #{label}</p>
					<p className="text-primary">
						Ao5: <span className="font-mono">{payload[0].payload.formattedAo5}</span>
					</p>
				</div>
			);
		}
		return null;
	};

	return (
		<div className="space-y-6">
			{/* Statistics Overview */}
			{stats && (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Best Time</p>
									<p className="text-2xl font-bold font-mono text-green-500">
										{formatTime(stats.best)}
									</p>
								</div>
								<Target className="w-8 h-8 text-green-500 opacity-20" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Mean Time</p>
									<p className="text-2xl font-bold font-mono text-blue-500">
										{formatTime(stats.mean)}
									</p>
								</div>
								<TrendingUp className="w-8 h-8 text-blue-500 opacity-20" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Median</p>
									<p className="text-2xl font-bold font-mono text-purple-500">
										{formatTime(stats.median)}
									</p>
								</div>
								<BarChart3 className="w-8 h-8 text-purple-500 opacity-20" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Solves</p>
									<p className="text-2xl font-bold font-mono">{stats.count}</p>
								</div>
								<Clock className="w-8 h-8 text-muted-foreground opacity-20" />
							</div>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Charts */}
			<Tabs defaultValue="progression" className="space-y-6">
				<TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50 p-1 rounded-lg border border-border shadow-sm">
					<TabsTrigger
						value="progression"
						className="!h-10 !px-4 !py-2 !font-semibold !text-sm !text-muted-foreground
                     data-[state=active]:!bg-background data-[state=active]:!text-foreground
                     data-[state=active]:!shadow-md data-[state=active]:!border data-[state=active]:!border-border/50
                     data-[state=active]:!font-bold
                     hover:!bg-background/60 hover:!text-foreground
                     !transition-all !duration-200 !cursor-pointer !rounded-md
                     flex !items-center !justify-center !gap-2"
					>
						<TrendingUp className="w-4 h-4" />
						<span>Time Progression</span>
					</TabsTrigger>
					<TabsTrigger
						value="averages"
						className="!h-10 !px-4 !py-2 !font-semibold !text-sm !text-muted-foreground
                     data-[state=active]:!bg-background data-[state=active]:!text-foreground
                     data-[state=active]:!shadow-md data-[state=active]:!border data-[state=active]:!border-border/50
                     data-[state=active]:!font-bold
                     hover:!bg-background/60 hover:!text-foreground
                     !transition-all !duration-200 !cursor-pointer !rounded-md
                     flex !items-center !justify-center !gap-2"
					>
						<BarChart3 className="w-4 h-4" />
						<span>Averages</span>
					</TabsTrigger>
					<TabsTrigger
						value="distribution"
						className="!h-10 !px-4 !py-2 !font-semibold !text-sm !text-muted-foreground
                     data-[state=active]:!bg-background data-[state=active]:!text-foreground
                     data-[state=active]:!shadow-md data-[state=active]:!border data-[state=active]:!border-border/50
                     data-[state=active]:!font-bold
                     hover:!bg-background/60 hover:!text-foreground
                     !transition-all !duration-200 !cursor-pointer !rounded-md
                     flex !items-center !justify-center !gap-2"
					>
						<Activity className="w-4 h-4" />
						<span>Distribution</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="progression" className="space-y-4 mt-6">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center">
								<TrendingUp className="w-5 h-5 mr-2" />
								Solve Time Progression
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={chartData.progression}>
										<defs>
											<linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
												<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
										<XAxis
											dataKey="solve"
											className="text-xs"
											tick={{ fill: "hsl(var(--muted-foreground))" }}
										/>
										<YAxis
											className="text-xs"
											tick={{ fill: "hsl(var(--muted-foreground))" }}
											tickFormatter={(value) => `${value.toFixed(1)}s`}
										/>
										<Tooltip content={<CustomTooltip />} />
										<Area
											type="monotone"
											dataKey="time"
											stroke="hsl(var(--primary))"
											strokeWidth={2}
											fill="url(#timeGradient)"
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="averages" className="space-y-4 mt-6">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center">
								<BarChart3 className="w-5 h-5 mr-2" />
								Average of 5 Progression
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<LineChart data={chartData.ao5Data}>
										<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
										<XAxis
											dataKey="solve"
											className="text-xs"
											tick={{ fill: "hsl(var(--muted-foreground))" }}
										/>
										<YAxis
											className="text-xs"
											tick={{ fill: "hsl(var(--muted-foreground))" }}
											tickFormatter={(value) => `${value.toFixed(1)}s`}
										/>
										<Tooltip content={<Ao5Tooltip />} />
										<Line
											type="monotone"
											dataKey="ao5"
											stroke="hsl(var(--chart-2))"
											strokeWidth={3}
											dot={{
												fill: "hsl(var(--chart-2))",
												strokeWidth: 2,
												r: 4,
											}}
											activeDot={{ r: 6 }}
										/>
									</LineChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="distribution" className="space-y-4 mt-6">
					<Card>
						<CardHeader className="pb-4">
							<CardTitle className="flex items-center">
								<BarChart3 className="w-5 h-5 mr-2" />
								Time Distribution
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-2">
							<div className="h-80">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart data={chartData.distribution}>
										<CartesianGrid strokeDasharray="3 3" className="opacity-30" />
										<XAxis
											dataKey="range"
											className="text-xs"
											tick={{ fill: "hsl(var(--muted-foreground))" }}
											angle={-45}
											textAnchor="end"
											height={60}
										/>
										<YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
										<Tooltip
											content={({ active, payload, label }) => {
												if (active && payload && payload.length) {
													return (
														<div className="bg-card border rounded-lg p-3 shadow-lg">
															<p className="font-medium">{label}</p>
															<p className="text-primary">Count: {payload[0].value}</p>
															<p className="text-muted-foreground text-sm">
																{payload[0].payload.percentage}% of solves
															</p>
														</div>
													);
												}
												return null;
											}}
										/>
										<Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
