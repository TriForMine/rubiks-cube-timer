"use client";

import { useState } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Palette,
  Keyboard,
  Info,
  Sliders,
  Clock,
  Zap,
  Shield,
} from "lucide-react";
import { exportTimes, importTimes } from "@/lib/utils";
import type { TimeRecord } from "@/app/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSettings } from "@/contexts/SettingsContext";

interface ImportedTimeData {
  id: unknown;
  time: unknown;
  scramble: unknown;
  date: unknown;
  penalty?: unknown;
}

interface SettingsProps {
  onClearAllTimes: () => void;
  onImportTimes?: (times: TimeRecord[]) => void;
  onNewScramble?: () => void;
}

export function Settings({
  onClearAllTimes,
  onImportTimes,
  onNewScramble,
}: SettingsProps) {
  const { scrambleLength, showMilliseconds, timeFormat, updateSetting } =
    useSettings();
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportTimes = () => {
    const savedTimes = localStorage.getItem("rubiks-times");
    if (savedTimes) {
      const times = JSON.parse(savedTimes);
      exportTimes(times);
    }
  };

  const handleImportTimes = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedTimes = await importTimes(file);

      const validTimes = (importedTimes as ImportedTimeData[])
        .filter(
          (time) =>
            time.id &&
            typeof time.time === "number" &&
            time.scramble &&
            time.date,
        )
        .map((time) => ({
          ...time,
          date: new Date(time.date as string),
        })) as TimeRecord[];

      if (validTimes.length > 0) {
        const existingTimes = JSON.parse(
          localStorage.getItem("rubiks-times") || "[]",
        );
        const allTimes = [...validTimes, ...existingTimes];

        const uniqueTimes = allTimes.filter(
          (time, index, arr) =>
            arr.findIndex((t) => t.id === time.id) === index,
        );

        localStorage.setItem("rubiks-times", JSON.stringify(uniqueTimes));

        if (onImportTimes) {
          onImportTimes(uniqueTimes);
        }

        alert(`Successfully imported ${validTimes.length} times!`);
      } else {
        alert("No valid times found in the file.");
      }
    } catch (error) {
      alert("Failed to import times. Please check the file format.");
      console.error("Import error:", error);
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const handleClearAllTimes = () => {
    if (showConfirmClear) {
      onClearAllTimes();
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
    <Card
      className={cn("shadow-lg border-border/50 overflow-hidden", className)}
    >
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
          <p className="text-muted-foreground">
            Customize your speedcubing experience
          </p>
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
                <label
                  htmlFor="scramble-length"
                  className="text-sm font-semibold text-foreground"
                >
                  Scramble Length
                </label>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
                  <span className="text-sm font-mono font-bold text-primary">
                    {scrambleLength}
                  </span>
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
                  onChange={(e) =>
                    updateSetting("scrambleLength", Number(e.target.value))
                  }
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
            <Button
              onClick={onNewScramble}
              variant="outline"
              size="lg"
              className="w-full group"
            >
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
              <label
                htmlFor="time-format"
                className="text-sm font-semibold text-foreground"
              >
                Time Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-200 text-left",
                    timeFormat === "seconds"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border/80 hover:bg-muted/50",
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
                      : "border-border hover:border-border/80 hover:bg-muted/50",
                  )}
                  onClick={() => updateSetting("timeFormat", "milliseconds")}
                >
                  <div className="font-mono font-bold">12.345</div>
                  <div className="text-xs text-muted-foreground">
                    Milliseconds
                  </div>
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
                  showMilliseconds ? "bg-primary" : "bg-muted",
                )}
                onClick={() =>
                  updateSetting("showMilliseconds", !showMilliseconds)
                }
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
                    showMilliseconds ? "translate-x-5" : "translate-x-0.5",
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
          description="Import, export, and manage your solve data"
        >
          <div className="space-y-4">
            <Button
              onClick={handleExportTimes}
              variant="default"
              size="lg"
              className="w-full group"
            >
              <Download className="w-5 h-5 mr-2 group-hover:translate-y-0.5 transition-transform duration-200" />
              Export Times
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportTimes}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button
                disabled={isImporting}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <Upload className="w-5 h-5 mr-2" />
                {isImporting ? "Importing..." : "Import Times"}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleClearAllTimes}
                variant={showConfirmClear ? "destructive" : "outline"}
                size="lg"
                className="w-full"
              >
                <Trash2 className="w-5 h-5 mr-2" />
                {showConfirmClear ? "Click to Confirm" : "Clear All Times"}
              </Button>

              {showConfirmClear && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium text-center">
                    ⚠️ This will permanently delete all your times!
                  </p>
                </div>
              )}
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
              { key: "ESC", action: "New Scramble", icon: RefreshCw },
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
                  <code className="text-xs font-mono font-bold">
                    {shortcut.key}
                  </code>
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
                <h3 className="font-bold text-lg">CubeTimer v1.0</h3>
                <p className="text-sm text-muted-foreground">
                  Professional speedcubing timer built with Next.js & React
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              <span>Powered by modern web tech</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
