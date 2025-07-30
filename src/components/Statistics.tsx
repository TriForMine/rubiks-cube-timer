"use client";

import {
  Award,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  LineChart,
  PieChart,
  Target,
  Timer,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { TimeRecord } from "@/app/page";
import { Achievements } from "@/components/Achievements";
import { Charts } from "@/components/Charts";
import { DailyStatistics } from "@/components/DailyStatistics";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTime } from "@/lib/utils";
import { useUserProgress } from "@/contexts/UserProgressContext";

// Speed tier definitions
const SPEED_TIERS = {
  beginner: {
    min: 90000,
    max: 300000,
    label: "Beginner",
    color: "bg-gray-500",
  },
  improving: {
    min: 45000,
    max: 90000,
    label: "Improving",
    color: "bg-blue-500",
  },
  novice: { min: 30000, max: 45000, label: "Novice", color: "bg-green-500" },
  casual: { min: 20000, max: 30000, label: "Casual", color: "bg-yellow-500" },
  intermediate: {
    min: 15000,
    max: 20000,
    label: "Intermediate",
    color: "bg-orange-500",
  },
  advancing: {
    min: 12000,
    max: 15000,
    label: "Advancing",
    color: "bg-red-500",
  },
  experienced: {
    min: 10000,
    max: 12000,
    label: "Experienced",
    color: "bg-purple-500",
  },
  advanced: { min: 8000, max: 10000, label: "Advanced", color: "bg-pink-500" },
  expert: { min: 6000, max: 8000, label: "Expert", color: "bg-indigo-500" },
  speedcuber: { min: 0, max: 6000, label: "Speedcuber", color: "bg-cyan-500" },
} as const;

// Helper functions

const calculateAverage = (times: number[]): number => {
  if (times.length === 0) return 0;
  if (times.length < 5) {
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  const sorted = [...times].sort((a, b) => a - b);
  const trimmed = sorted.slice(1, -1);
  return trimmed.reduce((sum, time) => sum + time, 0) / trimmed.length;
};

const getUserLevel = (avgTime: number) => {
  for (const [key, tier] of Object.entries(SPEED_TIERS)) {
    if (avgTime >= tier.min && avgTime <= tier.max) {
      return { key, ...tier };
    }
  }
  return { key: "speedcuber", ...SPEED_TIERS.speedcuber };
};

const getProgressAnalysis = (times: TimeRecord[]) => {
  if (times.length < 10) return "Need more solves for analysis";

  const recent = times.slice(-10);
  const older = times.slice(-20, -10);

  if (older.length === 0) return "Keep solving to track progress";

  const recentAvg = calculateAverage(recent.map((t) => t.time));
  const olderAvg = calculateAverage(older.map((t) => t.time));

  const improvement = olderAvg - recentAvg;
  const improvementPercent = (improvement / olderAvg) * 100;

  if (improvementPercent > 5) {
    return `Great progress! You've improved by ${improvementPercent.toFixed(1)}% recently.`;
  } else if (improvementPercent > 0) {
    return `You're making steady progress. Keep it up!`;
  } else {
    return `Your times are consistent. Focus on technique to break through plateaus.`;
  }
};

const getTipsForLevel = (level: string) => {
  const tips = {
    Beginner: [
      "Practice the beginner method until it becomes second nature",
      "Focus on accuracy over speed",
      "Learn proper cube notation and finger movements",
    ],
    Improving: [
      "Start learning intuitive cross solutions",
      "Practice cross on bottom consistently",
      "Work on smoother turning and finger tricks",
    ],
    Novice: [
      "Begin learning 4-look last layer (2-look OLL + 2-look PLL)",
      "Focus on efficient F2L pair recognition",
      "Practice cross+1 planning",
    ],
    Casual: [
      "Master intuitive F2L completely",
      "Learn full PLL algorithm set",
      "Work on lookahead during F2L",
    ],
    Intermediate: [
      "Start learning full OLL algorithms",
      "Practice advanced F2L cases",
      "Work on cross+1 and cross+2 planning",
    ],
    Advanced: [
      "Master all OLL and PLL algorithms",
      "Practice advanced techniques like ZBLL",
      "Focus on inspection and planning efficiency",
    ],
  };

  return tips[level as keyof typeof tips] || tips["Beginner"];
};

interface StatisticsProps {
  times: TimeRecord[];
}

export function Statistics({ times }: StatisticsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { userLevel: storedUserLevel } = useUserProgress();

  // Calculate statistics
  const validTimes = useMemo(
    () =>
      times
        .filter((t) => t.penalty !== "DNF")
        .map((t) => (t.penalty === "+2" ? t.time + 2000 : t.time)),
    [times],
  );

  const stats = useMemo(() => {
    if (validTimes.length === 0) {
      return {
        best: 0,
        worst: 0,
        average: 0,
        ao5: 0,
        ao12: 0,
        ao100: 0,
        validCount: 0,
        dnfCount: 0,
        plusTwoCount: 0,
        totalSolves: times.length,
      };
    }

    const dnfCount = times.filter((t) => t.penalty === "DNF").length;
    const plusTwoCount = times.filter((t) => t.penalty === "+2").length;

    return {
      best: Math.min(...validTimes),
      worst: Math.max(...validTimes),
      average: calculateAverage(validTimes),
      ao5: validTimes.length >= 5 ? calculateAverage(validTimes.slice(-5)) : 0,
      ao12:
        validTimes.length >= 12 ? calculateAverage(validTimes.slice(-12)) : 0,
      ao100:
        validTimes.length >= 100 ? calculateAverage(validTimes.slice(-100)) : 0,
      validCount: validTimes.length,
      dnfCount,
      plusTwoCount,
      totalSolves: times.length,
    };
  }, [validTimes, times]);

  const userLevel = getUserLevel(stats.average);
  const progressAnalysis = getProgressAnalysis(times);
  const tips = getTipsForLevel(storedUserLevel || userLevel.label);

  const successRate = useMemo(() => {
    const rate =
      stats.totalSolves > 0 ? (stats.validCount / stats.totalSolves) * 100 : 0;
    const recent10 = times.slice(-10);
    const recentSuccessRate =
      recent10.length > 0
        ? (recent10.filter((t) => t.penalty !== "DNF").length /
            recent10.length) *
          100
        : 0;

    return {
      rate,
      improving: recentSuccessRate >= rate,
    };
  }, [stats, times]);

  if (times.length === 0) {
    return (
      <div className="text-center py-12">
        <Timer className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Statistics Yet</h3>
        <p className="text-muted-foreground">
          Start solving to see your statistics and progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Your Statistics</h2>
        <p className="text-muted-foreground">
          Track your progress and analyze your performance
        </p>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Best Time"
          value={formatTime(stats.best)}
          icon={<Trophy className="w-4 h-4" />}
          trend={stats.best > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Average"
          value={formatTime(stats.average)}
          icon={<BarChart3 className="w-4 h-4" />}
          trend="neutral"
        />
        <StatCard
          title="Total Solves"
          value={stats.totalSolves.toString()}
          icon={<Timer className="w-4 h-4" />}
          trend="up"
        />
        <StatCard
          title="Success Rate"
          value={`${successRate.rate.toFixed(1)}%`}
          icon={<Target className="w-4 h-4" />}
          trend={successRate.improving ? "up" : "down"}
        />
      </div>

      {/* User Level Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Current Level</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {storedUserLevel || userLevel.label}
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-full ${userLevel.color} flex items-center justify-center`}
            >
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-14 p-1 bg-muted/50 rounded-xl border border-border/50 shadow-sm">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-2 h-12 px-4 py-3 text-sm font-semibold rounded-lg
                       data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                       data-[state=active]:border data-[state=active]:border-border/50
                       hover:bg-background/60 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="flex items-center gap-2 h-12 px-4 py-3 text-sm font-semibold rounded-lg
                       data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                       data-[state=active]:border data-[state=active]:border-border/50
                       hover:bg-background/60 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <LineChart className="w-5 h-5" />
            <span className="hidden sm:inline">Charts</span>
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="flex items-center gap-2 h-12 px-4 py-3 text-sm font-semibold rounded-lg
                       data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                       data-[state=active]:border data-[state=active]:border-border/50
                       hover:bg-background/60 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <Calendar className="w-5 h-5" />
            <span className="hidden sm:inline">Daily</span>
          </TabsTrigger>
          <TabsTrigger
            value="achievements"
            className="flex items-center gap-2 h-12 px-4 py-3 text-sm font-semibold rounded-lg
                       data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                       data-[state=active]:border data-[state=active]:border-border/50
                       hover:bg-background/60 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <Trophy className="w-5 h-5" />
            <span className="hidden sm:inline">Awards</span>
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="flex items-center gap-2 h-12 px-4 py-3 text-sm font-semibold rounded-lg
                       data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md
                       data-[state=active]:border data-[state=active]:border-border/50
                       hover:bg-background/60 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <Lightbulb className="w-5 h-5" />
            <span className="hidden sm:inline">Tips</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Detailed Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Detailed Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Best Single</p>
                    <p className="text-xl font-bold">
                      {formatTime(stats.best)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Worst Single
                    </p>
                    <p className="text-xl font-bold">
                      {formatTime(stats.worst)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ao5</p>
                    <p className="text-xl font-bold">{formatTime(stats.ao5)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ao12</p>
                    <p className="text-xl font-bold">
                      {formatTime(stats.ao12)}
                    </p>
                  </div>
                  {stats.ao100 > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Ao100</p>
                      <p className="text-xl font-bold">
                        {formatTime(stats.ao100)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Solve Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Solve Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Clean Solves</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stats.validCount}</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        {((stats.validCount / stats.totalSolves) * 100).toFixed(
                          1,
                        )}
                        %
                      </Badge>
                    </div>
                  </div>
                  {stats.plusTwoCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">+2 Penalties</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {stats.plusTwoCount}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          {(
                            (stats.plusTwoCount / stats.totalSolves) *
                            100
                          ).toFixed(1)}
                          %
                        </Badge>
                      </div>
                    </div>
                  )}
                  {stats.dnfCount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DNF Solves</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stats.dnfCount}</span>
                        <Badge
                          variant="secondary"
                          className="bg-red-100 text-red-800"
                        >
                          {((stats.dnfCount / stats.totalSolves) * 100).toFixed(
                            1,
                          )}
                          %
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6 mt-6">
          <Charts times={times} />
        </TabsContent>

        {/* Daily Statistics Tab */}
        <TabsContent value="daily" className="space-y-6 mt-6">
          <DailyStatistics />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Achievements times={times} />
        </TabsContent>

        {/* Insights & Tips Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          {/* Progress Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Progress Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-indigo-700 dark:text-indigo-300">
                  {progressAnalysis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Personalized Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Tips for {storedUserLevel || userLevel.label} Cubers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Collapsible
                open={expandedSection === "tips"}
                onOpenChange={() =>
                  setExpandedSection(expandedSection === "tips" ? null : "tips")
                }
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                  >
                    <span className="font-medium">View Improvement Tips</span>
                    {expandedSection === "tips" ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <ul className="space-y-3">
                    {tips.map((tip, index) => (
                      <li
                        key={`tip-${index}-${tip.slice(0, 20)}`}
                        className="flex items-start gap-3"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const level = storedUserLevel || userLevel.label;
                  let url: string;
                  if (["Beginner", "Improving"].includes(level)) {
                    url =
                      "https://ruwix.com/the-rubiks-cube/how-to-solve-the-rubiks-cube-beginners-method/";
                  } else if (["Novice", "Casual"].includes(level)) {
                    url = "https://jperm.net/3x3/beginner";
                  } else {
                    url = "https://jperm.net/3x3/cfop";
                  }
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Learn More Techniques
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
