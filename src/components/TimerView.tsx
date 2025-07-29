"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Timer } from "@/components/Timer";
import { ScrambleDisplay } from "@/components/ScrambleDisplay";
import { generateScramble } from "@/lib/scramble";
import { Button } from "@/components/ui/button";
import { RotateCcw, Square, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeRecord {
  id: string;
  time: number;
  scramble: string;
  date: Date;
  penalty?: "DNF" | "+2";
}

interface TimerViewProps {
  onTimeAdded: (time: TimeRecord) => void;
  currentScramble: string;
  onScrambleChange: (scramble: string) => void;
  scrambleLength?: number;
  existingTimes: TimeRecord[];
}

export function TimerView({
  onTimeAdded,
  currentScramble,
  onScrambleChange,
  scrambleLength = 20,
  existingTimes,
}: TimerViewProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [lastSolveTime, setLastSolveTime] = useState<number | null>(null);
  const [wasLastSolvePB, setWasLastSolvePB] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsReady(false);
    setShowInstructions(false);
    setLastSolveTime(null);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setCurrentTime(Date.now() - startTimeRef.current);
      }
    }, 10);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startTimeRef.current) {
      const finalTime = Date.now() - startTimeRef.current;
      setCurrentTime(finalTime);
      setLastSolveTime(finalTime);

      // Add time to records
      const newTime: TimeRecord = {
        id: Date.now().toString(),
        time: finalTime,
        scramble: currentScramble,
        date: new Date(),
      };

      // Check if this is a PB
      const validTimes = existingTimes.filter((t) => t.penalty !== "DNF");
      const currentBestTime =
        validTimes.length > 0
          ? Math.min(
              ...validTimes.map((t) =>
                t.penalty === "+2" ? t.time + 2000 : t.time,
              ),
            )
          : Infinity;

      setWasLastSolvePB(finalTime < currentBestTime);

      onTimeAdded(newTime);

      // Generate new scramble for next solve
      const newScramble = generateScramble(scrambleLength);
      onScrambleChange(newScramble);
    }

    setIsRunning(false);
    startTimeRef.current = null;
  }, [
    currentScramble,
    onTimeAdded,
    onScrambleChange,
    scrambleLength,
    existingTimes,
  ]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentTime(0);
    setIsRunning(false);
    setIsReady(false);
    setLastSolveTime(null);
    startTimeRef.current = null;
  }, []);

  const handleNewScramble = useCallback(() => {
    if (!isRunning) {
      const newScramble = generateScramble(scrambleLength);
      onScrambleChange(newScramble);
    }
  }, [isRunning, onScrambleChange, scrambleLength]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return; // Don't interfere when typing in inputs
      }

      if (event.code === "Space") {
        event.preventDefault();

        if (!spacePressed) {
          setSpacePressed(true);

          if (isRunning) {
            stopTimer();
          } else if (!isReady) {
            setIsReady(true);
          }
        }
      } else if (event.code === "Escape") {
        event.preventDefault();
        handleNewScramble();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        setSpacePressed(false);

        if (isReady && !isRunning) {
          startTimer();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    spacePressed,
    isRunning,
    isReady,
    startTimer,
    stopTimer,
    handleNewScramble,
  ]);

  const getStatusMessage = () => {
    if (isRunning) return "Solving... Press SPACE to stop";
    if (isReady) return "Ready! Release SPACE to start";
    if (spacePressed) return "Hold SPACE to prepare";
    return "Press and hold SPACE to start";
  };

  const getStatusColor = () => {
    if (isRunning) return "text-green-500 dark:text-green-400";
    if (isReady) return "text-amber-500 dark:text-amber-400";
    if (spacePressed) return "text-red-500 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getMotivationalMessage = () => {
    if (lastSolveTime) {
      const seconds = (lastSolveTime / 1000).toFixed(2);

      if (wasLastSolvePB) {
        if (lastSolveTime < 10000)
          return `NEW PB! ${seconds}s - Incredible! 🏆⚡`;
        if (lastSolveTime < 20000)
          return `NEW PB! ${seconds}s - Outstanding! 🏆💪`;
        if (lastSolveTime < 30000)
          return `NEW PB! ${seconds}s - Well done! 🏆📈`;
        return `NEW PB! ${seconds}s - Great achievement! 🏆🎯`;
      }

      if (lastSolveTime < 10000)
        return `Amazing! ${seconds}s - You're on fire! 🔥`;
      if (lastSolveTime < 20000)
        return `Great solve! ${seconds}s - Keep it up! 💪`;
      if (lastSolveTime < 30000)
        return `Nice work! ${seconds}s - Getting better! 📈`;
      return `${seconds}s completed - Every solve counts! 🎯`;
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Compact Scramble Section */}
      <div className="flex-shrink-0 p-4">
        <ScrambleDisplay
          scramble={currentScramble}
          onScrambleChange={onScrambleChange}
          scrambleLength={scrambleLength}
        />
      </div>

      {/* Main Timer Section - Full height and centered */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center space-y-8">
            {/* Huge Timer Display */}
            <Timer
              time={currentTime}
              isRunning={isRunning}
              isReady={isReady}
              spacePressed={spacePressed}
            />

            {/* Status Message */}
            <div
              className={cn(
                "text-xl md:text-2xl font-semibold transition-all duration-300 ease-out",
                getStatusColor(),
                isRunning && "animate-pulse",
              )}
            >
              {getStatusMessage()}
            </div>

            {/* Motivational Message */}
            {getMotivationalMessage() && (
              <div
                className={cn(
                  "rounded-2xl p-4 border animate-fade-in max-w-md mx-auto",
                  wasLastSolvePB
                    ? "bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-yellow-500/20 border-yellow-500/30"
                    : "bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 font-medium",
                    wasLastSolvePB
                      ? "text-yellow-600 dark:text-yellow-400"
                      : "text-green-600 dark:text-green-400",
                  )}
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  {getMotivationalMessage()}
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
              </div>
            )}

            {/* Compact Instructions */}
            {showInstructions && !isRunning && !isReady && !spacePressed && (
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs font-mono font-semibold">SPC</span>
                  </div>
                  <span>Hold to prepare, release to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-xs font-mono font-semibold">ESC</span>
                  </div>
                  <span>New scramble</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isRunning && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleNewScramble}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  New Scramble
                </Button>

                {currentTime > 0 && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={resetTimer}
                    leftIcon={<Square className="w-4 h-4" />}
                  >
                    Reset
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
