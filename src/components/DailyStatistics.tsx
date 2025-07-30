"use client";

import {
  Calendar,
  Flame,
  Target,
  Trophy,
  TrendingUp,
  Clock,
  Star,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getCurrentStreakStatus,
  getWeeklyProgress,
  loadDailySettings,
  loadStreakData,
  type DailyProgress as DailyProgressType,
  type StreakData,
  type DailySettings,
} from "@/lib/storage";
import { cn, formatTime } from "@/lib/utils";

interface DailyStatisticsProps {
  className?: string;
}

export function DailyStatistics({ className }: DailyStatisticsProps) {
  const [streakStatus, setStreakStatus] = useState({
    currentStreak: 0,
    isActive: false,
    daysUntilBreak: 0,
    todayProgress: null as DailyProgressType | null,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgressType[]>([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [dailySettings, setDailySettings] = useState<DailySettings>({
    dailyGoal: 10,
    streakGoal: 7,
  });

  useEffect(() => {
    const loadData = () => {
      setStreakStatus(getCurrentStreakStatus());
      setWeeklyProgress(getWeeklyProgress());
      setStreakData(loadStreakData());
      setDailySettings(loadDailySettings());
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayProgress = streakStatus.todayProgress;
  const progressPercentage = todayProgress
    ? Math.min((todayProgress.solveCount / dailySettings.dailyGoal) * 100, 100)
    : 0;

  // Calculate additional statistics
  const totalDaysWithSolves = weeklyProgress.filter(
    (day) => day.solveCount > 0,
  ).length;
  const goalMetDays = weeklyProgress.filter((day) => day.goalMet).length;
  const weeklyGoalRate = totalDaysWithSolves > 0 ? (goalMetDays / 7) * 100 : 0;
  const totalWeeklySolves = weeklyProgress.reduce(
    (sum, day) => sum + day.solveCount,
    0,
  );
  const averageDailySolves =
    totalDaysWithSolves > 0 ? totalWeeklySolves / totalDaysWithSolves : 0;

  const bestDayThisWeek = weeklyProgress.reduce(
    (best, day) => {
      if (day.bestTime && (!best.bestTime || day.bestTime < best.bestTime)) {
        return day;
      }
      return best;
    },
    weeklyProgress[0] || { bestTime: null, date: "", solveCount: 0 },
  );

  const getStreakStatusColor = () => {
    if (!streakStatus.isActive) return "text-red-500";
    if (streakStatus.daysUntilBreak === 0) return "text-green-500";
    return "text-orange-500";
  };

  const getStreakStatusText = () => {
    if (!streakStatus.isActive && streakStatus.currentStreak === 0) {
      return "Start your streak today!";
    }
    if (!streakStatus.isActive) {
      return "Streak broken - restart today";
    }
    if (streakStatus.daysUntilBreak === 0) {
      return "Active - great job!";
    }
    return "Solve today to maintain streak";
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Daily Practice Statistics</h2>
          <p className="text-muted-foreground">
            Track your daily progress and streaks
          </p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Streak"
          value={`${streakStatus.currentStreak} day${streakStatus.currentStreak !== 1 ? "s" : ""}`}
          icon={<Flame className="w-4 h-4" />}
          className="border-orange-200/50 dark:border-orange-800/50"
          subtitle={
            <span className={cn("text-xs font-medium", getStreakStatusColor())}>
              {getStreakStatusText()}
            </span>
          }
        />

        <StatCard
          title="Longest Streak"
          value={`${streakData?.longestStreak || 0} day${(streakData?.longestStreak || 0) !== 1 ? "s" : ""}`}
          icon={<Trophy className="w-4 h-4" />}
          className="border-amber-200/50 dark:border-amber-800/50"
        />

        <StatCard
          title="Today's Solves"
          value={todayProgress?.solveCount || 0}
          icon={<Target className="w-4 h-4" />}
          className="border-blue-200/50 dark:border-blue-800/50"
          subtitle={
            todayProgress?.goalMet ? (
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Goal completed! 🎉
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                Goal: {dailySettings.dailyGoal}
              </span>
            )
          }
        />

        <StatCard
          title="Weekly Average"
          value={averageDailySolves.toFixed(1)}
          icon={<BarChart3 className="w-4 h-4" />}
          className="border-purple-200/50 dark:border-purple-800/50"
          subtitle={
            <span className="text-xs text-muted-foreground">
              solves per active day
            </span>
          }
        />
      </div>

      {/* Daily Goal Progress */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl border border-blue-500/20">
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                Daily Goal Progress
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your progress toward today's goal
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                Progress: {todayProgress?.solveCount || 0} /{" "}
                {dailySettings.dailyGoal} solves
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-3 bg-blue-100 dark:bg-blue-900"
            />
          </div>

          {todayProgress && todayProgress.solveCount > 0 && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Best Time Today
                </div>
                <div className="text-lg font-bold text-primary">
                  {todayProgress.bestTime
                    ? formatTime(todayProgress.bestTime)
                    : "N/A"}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">
                  Total Practice
                </div>
                <div className="text-lg font-bold text-primary">
                  {formatTime(todayProgress.totalTime)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl border border-green-500/20">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">
                  Weekly Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Last 7 days of practice
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Goal Rate</div>
              <div className="text-lg font-bold text-primary">
                {weeklyGoalRate.toFixed(0)}%
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weekly Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Active Days</div>
              <div className="text-xl font-bold text-primary">
                {totalDaysWithSolves}/7
              </div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Goals Met</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                {goalMetDays}/7
              </div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">Total Solves</div>
              <div className="text-xl font-bold text-primary">
                {totalWeeklySolves}
              </div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Daily Progress</h4>
            <div className="grid grid-cols-7 gap-2">
              {weeklyProgress.map((day) => {
                const dayName = new Date(day.date).toLocaleDateString("en", {
                  weekday: "short",
                });
                const isToday =
                  day.date === new Date().toISOString().split("T")[0];
                const hasProgress = day.solveCount > 0;
                const metGoal = day.goalMet;

                return (
                  <div key={day.date} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {dayName}
                    </div>
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg border-2 flex flex-col items-center justify-center text-xs font-medium transition-all relative",
                        isToday && "ring-2 ring-primary ring-offset-2",
                        metGoal
                          ? "bg-green-500 border-green-500 text-white"
                          : hasProgress
                            ? "bg-orange-200 border-orange-300 text-orange-800 dark:bg-orange-800 dark:border-orange-700 dark:text-orange-200"
                            : "bg-muted border-border text-muted-foreground",
                      )}
                      title={`${day.date}: ${day.solveCount} solves${
                        day.bestTime
                          ? ` (best: ${formatTime(day.bestTime)})`
                          : ""
                      }`}
                    >
                      <div className="font-bold">{day.solveCount}</div>
                      {day.bestTime && (
                        <div className="text-xs opacity-75">
                          {formatTime(day.bestTime)}
                        </div>
                      )}
                      {isToday && (
                        <div className="absolute -top-1 -right-1">
                          <Star className="w-3 h-3 text-primary fill-current" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Goal met</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-200 dark:bg-orange-800" />
                <span>Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted border border-border" />
                <span>No solves</span>
              </div>
            </div>
          </div>

          {/* Best Performance This Week */}
          {bestDayThisWeek?.bestTime && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">
                Best Performance This Week
              </h4>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200/30 dark:border-amber-800/30">
                <div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(bestDayThisWeek.date).toLocaleDateString("en", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="font-bold text-amber-600 dark:text-amber-400">
                    {formatTime(bestDayThisWeek.bestTime)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {bestDayThisWeek.solveCount} solves
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streak Analysis */}
      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/10 rounded-xl border border-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                Streak Analysis
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your consistency and progress tracking
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {streakStatus.currentStreak}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Streak
              </div>
              <div
                className={cn(
                  "text-xs font-medium mt-1",
                  getStreakStatusColor(),
                )}
              >
                {getStreakStatusText()}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {streakData?.longestStreak || 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Longest Streak
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Personal record
              </div>
            </div>
          </div>

          {streakStatus.currentStreak >= dailySettings.streakGoal && (
            <div className="p-3 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200/30 dark:border-green-800/30">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Streak Goal Achieved! 🎉
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                You've reached your {dailySettings.streakGoal}-day streak
                target!
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
