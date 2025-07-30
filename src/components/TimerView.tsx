"use client";

import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { ScrambleDisplay } from "@/components/ScrambleDisplay";
import { FloatingCubeButton } from "@/components/FloatingCubeButton";
import { generateScramble } from "@/lib/scramble";
import { Button } from "@/components/ui/button";
import { RotateCcw, Square, Sparkles } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";

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

// Memoized motivational message component
const MotivationalMessage = memo(
  ({
    lastSolveTime,
    wasLastSolvePB,
  }: {
    lastSolveTime: number | null;
    wasLastSolvePB: boolean;
  }) => {
    const message = useMemo(() => {
      if (!lastSolveTime) return null;

      const formattedTime = formatTime(lastSolveTime);

      if (wasLastSolvePB) {
        if (lastSolveTime < 10000)
          return `NEW PB! ${formattedTime} - Incredible! 🏆⚡`;
        if (lastSolveTime < 20000)
          return `NEW PB! ${formattedTime} - Outstanding! 🏆💪`;
        if (lastSolveTime < 30000)
          return `NEW PB! ${formattedTime} - Well done! 🏆📈`;
        return `NEW PB! ${formattedTime} - Great achievement! 🏆🎯`;
      }

      if (lastSolveTime < 10000)
        return `Amazing! ${formattedTime} - You're on fire! 🔥`;
      if (lastSolveTime < 20000)
        return `Great solve! ${formattedTime} - Keep it up! 💪`;
      if (lastSolveTime < 30000)
        return `Nice work! ${formattedTime} - Getting better! 📈`;
      return `${formattedTime} completed - Every solve counts! 🎯`;
    }, [lastSolveTime, wasLastSolvePB]);

    if (!message) return null;

    return (
      <div
        className={cn(
          "rounded-xl sm:rounded-2xl p-3 sm:p-4 border animate-fade-in max-w-sm sm:max-w-md mx-auto",
          wasLastSolvePB
            ? "bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-yellow-500/20 border-yellow-500/30"
            : "bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center gap-2 font-medium text-sm sm:text-base touch-none",
            wasLastSolvePB
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-green-600 dark:text-green-400",
          )}
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
          <span className="text-center">{message}</span>
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
        </div>
      </div>
    );
  },
);

MotivationalMessage.displayName = "MotivationalMessage";

// Memoized action buttons component
const ActionButtons = memo(
  ({
    isRunning,
    currentTime,
    onNewScramble,
    onReset,
  }: {
    isRunning: boolean;
    currentTime: number;
    onNewScramble: () => void;
    onReset: () => void;
  }) => {
    if (isRunning) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onNewScramble}
          leftIcon={<RotateCcw className="w-4 h-4" />}
          className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
        >
          New Scramble
        </Button>

        {currentTime > 0 && (
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            leftIcon={<Square className="w-4 h-4" />}
            className="w-full sm:w-auto min-h-[44px] text-sm sm:text-base"
          >
            Reset
          </Button>
        )}
      </div>
    );
  },
);

ActionButtons.displayName = "ActionButtons";

// Memoized scramble section component
const ScrambleSection = memo(
  ({
    currentScramble,
    onScrambleChange,
    scrambleLength,
  }: {
    currentScramble: string;
    onScrambleChange: (scramble: string) => void;
    scrambleLength: number;
  }) => {
    return (
      <div className="flex-shrink-0 p-3 sm:p-4">
        <ScrambleDisplay
          scramble={currentScramble}
          onScrambleChange={onScrambleChange}
          scrambleLength={scrambleLength}
        />
      </div>
    );
  },
);

ScrambleSection.displayName = "ScrambleSection";

function TimerViewComponent({
  onTimeAdded,
  currentScramble,
  onScrambleChange,
  scrambleLength = 20,
  existingTimes,
}: TimerViewProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [spacePressed, setSpacePressed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [lastSolveTime, setLastSolveTime] = useState<number | null>(null);
  const [wasLastSolvePB, setWasLastSolvePB] = useState(false);
  const [finalTime, setFinalTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerDisplayRef = useRef<HTMLDivElement>(null);
  const millisecondsDisplayRef = useRef<HTMLDivElement>(null);
  const existingTimesRef = useRef<TimeRecord[]>(existingTimes);
  const currentScrambleRef = useRef(currentScramble);

  // Update refs when props change
  useEffect(() => {
    existingTimesRef.current = existingTimes;
  }, [existingTimes]);

  useEffect(() => {
    currentScrambleRef.current = currentScramble;
  }, [currentScramble]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
    setIsReady(false);
    setShowInstructions(false);
    setLastSolveTime(null);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current && timerDisplayRef.current) {
        const currentTime = Date.now() - startTimeRef.current;
        timerDisplayRef.current.textContent = formatTime(currentTime);

        if (millisecondsDisplayRef.current) {
          const milliseconds = String(currentTime % 1000)
            .padStart(3, "0")
            .slice(0, 2);
          millisecondsDisplayRef.current.textContent = `.${milliseconds}`;
        }
      }
    }, 16); // ~60fps
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (startTimeRef.current) {
      const completedTime = Date.now() - startTimeRef.current;
      setFinalTime(completedTime);
      setLastSolveTime(completedTime);

      // Update display with final time
      if (timerDisplayRef.current) {
        timerDisplayRef.current.textContent = formatTime(completedTime);
      }
      if (millisecondsDisplayRef.current) {
        const milliseconds = String(completedTime % 1000)
          .padStart(3, "0")
          .slice(0, 2);
        millisecondsDisplayRef.current.textContent = `.${milliseconds}`;
      }

      // Add time to records
      const newTime: TimeRecord = {
        id: Date.now().toString(),
        time: completedTime,
        scramble: currentScrambleRef.current,
        date: new Date(),
      };

      // Check if this is a PB
      const validTimes = existingTimesRef.current.filter(
        (t) => t.penalty !== "DNF",
      );
      const currentBestTime =
        validTimes.length > 0
          ? Math.min(
              ...validTimes.map((t) =>
                t.penalty === "+2" ? t.time + 2000 : t.time,
              ),
            )
          : Infinity;

      setWasLastSolvePB(completedTime < currentBestTime);

      onTimeAdded(newTime);

      // Generate new scramble for next solve
      const newScramble = generateScramble(scrambleLength);
      onScrambleChange(newScramble);
    }

    setIsRunning(false);
    startTimeRef.current = null;
  }, [onTimeAdded, onScrambleChange, scrambleLength]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFinalTime(0);
    setIsRunning(false);
    setIsReady(false);
    setLastSolveTime(null);
    startTimeRef.current = null;

    // Reset display
    if (timerDisplayRef.current) {
      timerDisplayRef.current.textContent = formatTime(0);
    }
    if (millisecondsDisplayRef.current) {
      millisecondsDisplayRef.current.textContent = "";
    }
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

        setSpacePressed((prev) => {
          if (!prev) {
            if (isRunning) {
              stopTimer();
            } else if (!isReady) {
              setIsReady(true);
            }
            return true;
          }
          return prev;
        });
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
  }, [isRunning, isReady, startTimer, stopTimer, handleNewScramble]);

  // Memoize status message to prevent recalculation on every render
  const statusMessage = useMemo(() => {
    if (isRunning) return "Solving... Press SPACE to stop";
    if (isReady) return "Ready! Release SPACE to start";
    if (spacePressed) return "Hold SPACE to prepare";
    return "Press and hold SPACE to start";
  }, [isRunning, isReady, spacePressed]);

  const statusColor = useMemo(() => {
    if (isRunning) return "text-green-500 dark:text-green-400";
    if (isReady) return "text-amber-500 dark:text-amber-400";
    if (spacePressed) return "text-red-500 dark:text-red-400";
    return "text-muted-foreground";
  }, [isRunning, isReady, spacePressed]);

  return (
    <div className="h-full flex flex-col touch-pan-y">
      {/* Compact Scramble Section */}
      <ScrambleSection
        currentScramble={currentScramble}
        onScrambleChange={onScrambleChange}
        scrambleLength={scrambleLength}
      />

      {/* Main Timer Section - Full height and centered */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl">
          <div className="text-center space-y-4 sm:space-y-6 md:space-y-8">
            {/* Huge Timer Display */}
            <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden">
              {/* Background Effects */}
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl transition-all duration-500 ease-out opacity-60",
                  isRunning &&
                    "bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10",
                  isReady &&
                    "bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10",
                  spacePressed &&
                    "bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10",
                  !isRunning &&
                    !isReady &&
                    !spacePressed &&
                    "bg-gradient-to-r from-muted/50 via-transparent to-muted/50",
                )}
              />

              {/* Main Timer Display */}
              <div className="relative z-10 flex flex-col items-center justify-center">
                <div
                  ref={timerDisplayRef}
                  className={cn(
                    "timer-text font-mono font-black text-center transition-all duration-300 ease-out select-none",
                    "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]",
                    "tracking-tighter leading-none",
                    isRunning && "text-green-500 dark:text-green-400 scale-102",
                    isReady && "text-amber-500 dark:text-amber-400 scale-105",
                    spacePressed && "text-red-500 dark:text-red-400 scale-95",
                    !isRunning &&
                      !isReady &&
                      !spacePressed &&
                      "text-foreground scale-100",
                    isRunning && "drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]",
                    isReady && "drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]",
                    spacePressed &&
                      "drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]",
                  )}
                  style={{
                    textShadow: isRunning
                      ? "0 0 20px currentColor"
                      : isReady
                        ? "0 0 15px currentColor"
                        : spacePressed
                          ? "0 0 10px currentColor"
                          : "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {formatTime(finalTime)}
                </div>

                {/* Milliseconds Display */}
                {!isRunning && finalTime > 0 && (
                  <div
                    ref={millisecondsDisplayRef}
                    className={cn(
                      "text-lg sm:text-xl md:text-2xl font-mono font-semibold mt-2 transition-all duration-300",
                      "text-muted-foreground animate-fade-in tabular-nums",
                    )}
                  >
                    .
                    {String(finalTime % 1000)
                      .padStart(3, "0")
                      .slice(0, 2)}
                  </div>
                )}

                {/* State Indicators */}
                <div className="flex items-center space-x-4 mt-6">
                  <div className="flex space-x-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        spacePressed && !isRunning
                          ? "bg-red-500 shadow-lg shadow-red-500/50 scale-125 animate-pulse"
                          : "bg-muted-foreground/20",
                      )}
                    />
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        isReady
                          ? "bg-amber-500 shadow-lg shadow-amber-500/50 scale-125 animate-pulse"
                          : "bg-muted-foreground/20",
                      )}
                    />
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        isRunning
                          ? "bg-green-500 shadow-lg shadow-green-500/50 scale-125 animate-pulse"
                          : "bg-muted-foreground/20",
                      )}
                    />
                  </div>
                  <div className="w-px h-4 bg-border/50" />
                  <div
                    className={cn(
                      "text-xs font-bold tracking-wider transition-all duration-300 uppercase",
                      isRunning &&
                        "text-green-500 dark:text-green-400 animate-pulse",
                      isReady && "text-amber-500 dark:text-amber-400",
                      spacePressed && "text-red-500 dark:text-red-400",
                      !isRunning &&
                        !isReady &&
                        !spacePressed &&
                        "text-muted-foreground",
                    )}
                  >
                    {isRunning
                      ? "SOLVING"
                      : isReady
                        ? "READY"
                        : spacePressed
                          ? "HOLD"
                          : "IDLE"}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div
              className={cn(
                "text-lg sm:text-xl md:text-2xl font-semibold transition-all duration-300 ease-out touch-none px-4",
                statusColor,
                isRunning && "animate-pulse",
              )}
            >
              {statusMessage}
            </div>

            {/* Motivational Message */}
            <MotivationalMessage
              lastSolveTime={lastSolveTime}
              wasLastSolvePB={wasLastSolvePB}
            />

            {/* Compact Instructions */}
            {showInstructions && !isRunning && !isReady && !spacePressed && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground animate-fade-in px-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-8 sm:h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-mono font-semibold">
                      SPC
                    </span>
                  </div>
                  <span className="text-center sm:text-left">
                    Hold to prepare, release to start
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-8 sm:h-8 bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-[10px] sm:text-xs font-mono font-semibold">
                      ESC
                    </span>
                  </div>
                  <span className="text-center sm:text-left">New scramble</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <ActionButtons
              isRunning={isRunning}
              currentTime={finalTime}
              onNewScramble={handleNewScramble}
              onReset={resetTimer}
            />
          </div>
        </div>
      </div>

      {/* Floating Cube Visualization Button */}
      <FloatingCubeButton scramble={currentScramble} />
    </div>
  );
}

export const TimerView = memo(TimerViewComponent);
