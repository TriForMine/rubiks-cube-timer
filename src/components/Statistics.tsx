"use client";

import {
  TrendingUp,
  Trophy,
  Target,
  BarChart3,
  Timer,
  Zap,
  TrendingDown,
  Award,
  Calendar,
} from "lucide-react";
import { formatTime, calculateStatistics } from "@/lib/utils";
import type { TimeRecord } from "@/app/page";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  StatCard,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatisticsProps {
  times: TimeRecord[];
}

export function Statistics({ times }: StatisticsProps) {
  // Filter out DNF times for statistics calculation
  const validTimes = times
    .filter((time) => time.penalty !== "DNF")
    .map((time) => (time.penalty === "+2" ? time.time + 2000 : time.time));

  const stats = calculateStatistics(validTimes);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (times.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:40px_40px]" />
          </div>

          <CardHeader className="pb-4 relative">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Statistics
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  Performance analytics and insights
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="text-center py-16 relative">
            <div className="max-w-md mx-auto space-y-6">
              <div className="relative">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center border border-border/50">
                  <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
                </div>

                {/* Floating decorative elements */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                  <div className="w-3 h-3 bg-primary/30 rounded-full animate-bounce" />
                </div>
                <div className="absolute top-4 right-1/4">
                  <div
                    className="w-2 h-2 bg-secondary/30 rounded-full animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
                <div className="absolute top-4 left-1/4">
                  <div
                    className="w-2 h-2 bg-accent/30 rounded-full animate-bounce"
                    style={{ animationDelay: "1s" }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">
                  No Statistics Yet
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Complete some solves to unlock detailed performance analytics,
                  averages, and progress tracking!
                </p>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-primary/20">
                <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>Start solving to see your stats!</span>
                </div>
              </div>
            </div>

            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-secondary/5 to-transparent rounded-full translate-y-20 -translate-x-20 pointer-events-none" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const dnfCount = times.filter((t) => t.penalty === "DNF").length;
  const plusTwoCount = times.filter((t) => t.penalty === "+2").length;
  const validCount = times.length - dnfCount;

  return (
    <div className="space-y-8">
      {/* Header with Session Overview */}
      <Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>

        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-2xl border border-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  Statistics
                </CardTitle>
                <p className="text-sm text-muted-foreground font-medium">
                  {times.length} total solves • {validCount} valid • Session
                  performance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-semibold">{validCount} OK</span>
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
        </CardHeader>
      </Card>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Best Time"
          value={stats.best ? formatTime(stats.best) : "—"}
          icon={<Trophy className="w-4 h-4" />}
          trend="up"
          className="border-green-200/50 dark:border-green-800/50"
        />
        <StatCard
          title="Average"
          value={stats.mean ? formatTime(stats.mean) : "—"}
          icon={<Target className="w-4 h-4" />}
          className="border-blue-200/50 dark:border-blue-800/50"
        />
        <StatCard
          title="Total Solves"
          value={stats.count.toString()}
          icon={<Timer className="w-4 h-4" />}
          className="border-purple-200/50 dark:border-purple-800/50"
        />
        <StatCard
          title="Worst Time"
          value={stats.worst ? formatTime(stats.worst) : "—"}
          icon={<TrendingDown className="w-4 h-4" />}
          trend="down"
          className="border-red-200/50 dark:border-red-800/50"
        />
      </div>

      {/* Averages Section */}
      <Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30 overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] bg-[length:30px_30px]" />
        </div>

        <CardHeader className="pb-6 relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl border border-orange-500/20">
              <Award className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                Rolling Averages
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Standard speedcubing averages with progress tracking
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average of 5 */}
            <Card className="shadow-md border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-lg">Average of 5</span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      validTimes.length >= 5
                        ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {validTimes.length >= 5
                      ? "✓ Complete"
                      : `${validTimes.length}/5`}
                  </div>
                </div>

                <div className="text-4xl font-bold font-mono text-amber-600 dark:text-amber-400 mb-3">
                  {stats.ao5 ? formatTime(stats.ao5) : "—"}
                </div>

                {validTimes.length < 5 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(validTimes.length, 5).toFixed(0)}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(validTimes.length, 5)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Need {5 - validTimes.length} more solves
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average of 12 */}
            <Card className="shadow-md border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-lg">Average of 12</span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      validTimes.length >= 12
                        ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {validTimes.length >= 12
                      ? "✓ Complete"
                      : `${validTimes.length}/12`}
                  </div>
                </div>

                <div className="text-4xl font-bold font-mono text-orange-600 dark:text-orange-400 mb-3">
                  {stats.ao12 ? formatTime(stats.ao12) : "—"}
                </div>

                {validTimes.length < 12 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(validTimes.length, 12).toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(validTimes.length, 12)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Need {12 - validTimes.length} more solves
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average of 50 */}
            <Card className="shadow-md border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-lg">Average of 50</span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      validTimes.length >= 50
                        ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {validTimes.length >= 50
                      ? "✓ Complete"
                      : `${validTimes.length}/50`}
                  </div>
                </div>

                <div className="text-4xl font-bold font-mono text-blue-600 dark:text-blue-400 mb-3">
                  {stats.ao50 ? formatTime(stats.ao50) : "—"}
                </div>

                {validTimes.length < 50 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(validTimes.length, 50).toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(validTimes.length, 50)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Need {50 - validTimes.length} more solves
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Average of 100 */}
            <Card className="shadow-md border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <span className="font-bold text-lg">Average of 100</span>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      validTimes.length >= 100
                        ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800"
                        : "bg-muted text-muted-foreground border-border",
                    )}
                  >
                    {validTimes.length >= 100
                      ? "✓ Complete"
                      : `${validTimes.length}/100`}
                  </div>
                </div>

                <div className="text-4xl font-bold font-mono text-purple-600 dark:text-purple-400 mb-3">
                  {stats.ao100 ? formatTime(stats.ao100) : "—"}
                </div>

                {validTimes.length < 100 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {getProgressPercentage(validTimes.length, 100).toFixed(
                          0,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${getProgressPercentage(validTimes.length, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Need {100 - validTimes.length} more solves
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Session Summary */}
      <Card className="shadow-lg border-border/50 bg-gradient-to-br from-card via-card to-muted/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl border border-green-500/20">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Session Summary</h3>
                <p className="text-sm text-muted-foreground">
                  Current session performance overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold font-mono">
                  {times.length}
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                  Total Solves
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
                  {((validCount / times.length) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
