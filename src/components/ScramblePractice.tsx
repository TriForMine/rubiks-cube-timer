"use client";

import {
  BookOpen,
  Info,
  Keyboard,
  Settings,
  Shuffle,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ScrambleStepByStep } from "@/components/ScrambleStepByStep";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  type ALGORITHM_PATTERNS,
  generateAlgorithmPractice,
  generateScramble,
} from "@/lib/cube-wasm";
import { cn } from "@/lib/utils";

interface ScramblePracticeProps {
  className?: string;
}

interface PracticeSettings {
  mode: "random" | "algorithm" | "difficulty";
  algorithmType: keyof typeof ALGORITHM_PATTERNS;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  scrambleLength: number;
  autoPlay: boolean;
  animationSpeed: number;
  enableRotationControls: boolean;
  showNotation: boolean;
}

interface PracticeStats {
  sessionsCompleted: number;
  totalMoves: number;
  lastSessionDate: string;
}

const DEFAULT_SETTINGS: PracticeSettings = {
  mode: "random",
  algorithmType: "OLL",
  difficultyLevel: "beginner",
  scrambleLength: 15,
  autoPlay: false,
  animationSpeed: 1000,
  enableRotationControls: true,
  showNotation: true,
};

const DIFFICULTY_CONFIGS = {
  beginner: {
    length: 12,
    speed: 1500,
    description: "12-15 moves, slower pace",
  },
  intermediate: {
    length: 20,
    speed: 1000,
    description: "18-22 moves, normal pace",
  },
  advanced: { length: 25, speed: 667, description: "25-30 moves, faster pace" },
};

const MOVE_EXPLANATIONS = {
  R: "Right face clockwise 90°",
  "R'": "Right face counterclockwise 90°",
  R2: "Right face 180°",
  L: "Left face clockwise 90°",
  "L'": "Left face counterclockwise 90°",
  L2: "Left face 180°",
  U: "Upper face clockwise 90°",
  "U'": "Upper face counterclockwise 90°",
  U2: "Upper face 180°",
  D: "Down face clockwise 90°",
  "D'": "Down face counterclockwise 90°",
  D2: "Down face 180°",
  F: "Front face clockwise 90°",
  "F'": "Front face counterclockwise 90°",
  F2: "Front face 180°",
  B: "Back face clockwise 90°",
  "B'": "Back face counterclockwise 90°",
  B2: "Back face 180°",
};

export function ScramblePractice({ className = "" }: ScramblePracticeProps) {
  const [currentScramble, setCurrentScramble] = useState("");
  const [scrambleKey, setScrambleKey] = useState(0); // Key to force cube reset
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<PracticeStats>({
    sessionsCompleted: 0,
    totalMoves: 0,
    lastSessionDate: "",
  });
  const [showSettings, setShowSettings] = useState(false);

  const [currentMove, setCurrentMove] = useState("");

  // Load settings and stats from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("scramble-practice-settings");
      if (savedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }

      const savedStats = localStorage.getItem("scramble-practice-stats");
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.warn("Failed to load settings or stats:", error);
    }
  }, []);

  // Save settings and stats to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "scramble-practice-settings",
        JSON.stringify(settings),
      );
      localStorage.setItem("scramble-practice-stats", JSON.stringify(stats));
    } catch (error) {
      console.warn("Failed to save settings or stats:", error);
    }
  }, [settings, stats]);

  const generateNewScramble = useCallback(async () => {
    let newScramble = "";

    switch (settings.mode) {
      case "random": {
        newScramble = await generateScramble(settings.scrambleLength);
        break;
      }
      case "algorithm": {
        newScramble = await generateAlgorithmPractice(settings.algorithmType);
        break;
      }
      case "difficulty": {
        const config = DIFFICULTY_CONFIGS[settings.difficultyLevel];
        newScramble = await generateScramble(config.length);
        break;
      }
    }

    setCurrentScramble(newScramble);
    setScrambleKey((prev) => prev + 1); // Force cube reset
    setCurrentMove("");
  }, [settings]);

  const handlePracticeComplete = useCallback(() => {
    // Update stats
    const moves = currentScramble.trim().split(/\s+/).length;
    setStats((prev) => ({
      sessionsCompleted: prev.sessionsCompleted + 1,
      totalMoves: prev.totalMoves + moves,
      lastSessionDate: new Date().toISOString(),
    }));
  }, [currentScramble]);

  const handleStepComplete = useCallback((_step: number, move: string) => {
    setCurrentMove(move);
  }, []);

  // Generate initial scramble
  useEffect(() => {
    if (!currentScramble) {
      generateNewScramble().catch(console.error);
    }
  }, [currentScramble, generateNewScramble]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      switch (event.key.toLowerCase()) {
        case "n":
          generateNewScramble().catch(console.error);
          break;
        case "s":
          setShowSettings((prev) => !prev);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [generateNewScramble]);

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Scramble Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Master cube scrambles with interactive 3D visualization and
            step-by-step guidance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Trophy className="w-4 h-4" />
            <span>{stats.sessionsCompleted} sessions completed</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => generateNewScramble().catch(console.error)}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            New Scramble
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Practice Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={settings.mode}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  mode: value as PracticeSettings["mode"],
                }))
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="random">Random</TabsTrigger>
                <TabsTrigger value="algorithm">Algorithm</TabsTrigger>
                <TabsTrigger value="difficulty">Difficulty</TabsTrigger>
              </TabsList>

              <TabsContent value="random" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="scramble-length"
                      className="block text-sm font-medium mb-2"
                    >
                      Scramble Length: {settings.scrambleLength} moves
                    </label>
                    <input
                      id="scramble-length"
                      type="range"
                      min="12"
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
                  </div>

                  <div>
                    <label
                      htmlFor="animation-speed"
                      className="block text-sm font-medium mb-2"
                    >
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
                      <option value={2000}>0.5x (Very Slow)</option>
                      <option value={1500}>0.75x (Slow)</option>
                      <option value={1000}>1x (Normal)</option>
                      <option value={667}>1.5x (Fast)</option>
                      <option value={500}>2x (Very Fast)</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="algorithm" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="algorithm-type"
                      className="block text-sm font-medium mb-2"
                    >
                      Algorithm Type
                    </label>
                    <select
                      id="algorithm-type"
                      value={settings.algorithmType}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          algorithmType: e.target
                            .value as keyof typeof ALGORITHM_PATTERNS,
                        }))
                      }
                      className="w-full p-2 border rounded text-sm bg-white dark:bg-gray-700"
                    >
                      <option value="OLL">
                        OLL (Orientation of Last Layer)
                      </option>
                      <option value="PLL">
                        PLL (Permutation of Last Layer)
                      </option>
                      <option value="F2L">F2L (First Two Layers)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                      {settings.algorithmType} Practice
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      {settings.algorithmType === "OLL" &&
                        "Focus on orienting the last layer pieces"}
                      {settings.algorithmType === "PLL" &&
                        "Practice permuting the last layer"}
                      {settings.algorithmType === "F2L" &&
                        "Master first two layers efficiency"}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="difficulty" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(DIFFICULTY_CONFIGS).map(([level, config]) => (
                    <button
                      key={level}
                      type="button"
                      className={cn(
                        "p-3 rounded border cursor-pointer transition-colors w-full text-left",
                        settings.difficultyLevel === level
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300",
                      )}
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          difficultyLevel:
                            level as PracticeSettings["difficultyLevel"],
                        }))
                      }
                    >
                      <div className="font-medium capitalize mb-1">{level}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {config.description}
                      </div>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* General Settings */}
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        autoPlay: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">Auto-play scrambles</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableRotationControls}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        enableRotationControls: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">Rotation controls</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showNotation}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showNotation: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">Show notation</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Practice Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3D Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>3D Visualization</span>
                  <Badge variant="outline" className="ml-2">
                    {settings.mode} mode
                  </Badge>
                </div>
                {currentMove && settings.showNotation && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Current:</span>
                    <Badge variant="default" className="font-mono">
                      {currentMove}
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentScramble && (
                <ScrambleStepByStep
                  key={scrambleKey} // Force reset when scramble changes
                  scramble={currentScramble}
                  autoPlay={settings.autoPlay}
                  initialSpeed={settings.animationSpeed}
                  onComplete={handlePracticeComplete}
                  onStepComplete={handleStepComplete}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Current Scramble */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Scramble</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-sm break-all p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                {currentScramble || "Generating..."}
              </div>
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                {currentScramble.split(" ").length} moves
              </div>
            </CardContent>
          </Card>

          {/* Move Notation Guide */}
          {settings.showNotation && currentMove && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Move Explanation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-mono text-lg text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    {currentMove}
                  </div>
                  <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                    {MOVE_EXPLANATIONS[
                      currentMove as keyof typeof MOVE_EXPLANATIONS
                    ] || "Unknown move"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Practice Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sessions:</span>
                <span className="font-semibold">{stats.sessionsCompleted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Moves:</span>
                <span className="font-semibold">{stats.totalMoves}</span>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard Shortcuts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Keyboard className="w-4 h-4" />
                Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>New scramble:</span>
                <Badge variant="outline" className="text-xs">
                  N
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Toggle settings:</span>
                <Badge variant="outline" className="text-xs">
                  S
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                For Beginners
              </div>
              <ul className="text-blue-700 dark:text-blue-300 space-y-2">
                <li>• Start with 12-15 move scrambles</li>
                <li>• Use slower speeds (0.5x - 1x)</li>
                <li>• Enable auto-play to watch sequences</li>
                <li>• Practice individual moves first</li>
                <li>• Use step-by-step controls liberally</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
              <div className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Intermediate
              </div>
              <ul className="text-green-700 dark:text-green-300 space-y-2">
                <li>• Practice 18-22 move scrambles</li>
                <li>• Use normal speed (1x)</li>
                <li>• Focus on algorithm practice</li>
                <li>• Try to predict next moves</li>
                <li>• Practice move sequences repeatedly</li>
              </ul>
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <div className="font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Advanced
              </div>
              <ul className="text-red-700 dark:text-red-300 space-y-2">
                <li>• Master 25-30 move scrambles</li>
                <li>• Use faster speeds (1.5x - 2x)</li>
                <li>• Focus on pattern recognition</li>
                <li>• Practice without visual aids</li>
                <li>• Challenge yourself with complex algorithms</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScramblePractice;
