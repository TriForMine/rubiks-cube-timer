"use client";

import { formatTime, cn } from "@/lib/utils";
import { useState, useEffect, memo } from "react";

interface TimerProps {
  time: number;
  isRunning: boolean;
  isReady: boolean;
  spacePressed: boolean;
}

function TimerComponent({
  time,
  isRunning,
  isReady,
  spacePressed,
}: TimerProps) {
  const [displayTime, setDisplayTime] = useState(time);
  const [pulseKey, setPulseKey] = useState(0);

  // Smooth time updates for better visual experience
  useEffect(() => {
    if (isRunning) {
      setDisplayTime(time);
    } else {
      // Add a slight delay for the final time to feel more natural
      const timer = setTimeout(() => setDisplayTime(time), 50);
      return () => clearTimeout(timer);
    }
  }, [time, isRunning]);

  // Trigger pulse animation when time changes significantly
  useEffect(() => {
    if (!isRunning && time > 0) {
      setPulseKey((prev) => prev + 1);
    }
  }, [time, isRunning]);

  const getTimerColor = () => {
    if (isRunning) return "text-green-500 dark:text-green-400";
    if (isReady) return "text-amber-500 dark:text-amber-400";
    if (spacePressed) return "text-red-500 dark:text-red-400";
    return "text-foreground";
  };

  const getTimerScale = () => {
    if (spacePressed && !isRunning) return "scale-95";
    if (isReady) return "scale-105";
    if (isRunning) return "scale-102";
    return "scale-100";
  };

  const getGlowEffect = () => {
    if (isRunning)
      return "drop-shadow-[0_0_20px_rgba(34,197,94,0.3)] dark:drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]";
    if (isReady)
      return "drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] dark:drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]";
    if (spacePressed)
      return "drop-shadow-[0_0_20px_rgba(239,68,68,0.3)] dark:drop-shadow-[0_0_20px_rgba(248,113,113,0.3)]";
    return "drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]";
  };

  const getBackgroundGradient = () => {
    if (isRunning)
      return "bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10";
    if (isReady)
      return "bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10";
    if (spacePressed)
      return "bg-gradient-to-r from-red-500/10 via-transparent to-red-500/10";
    return "bg-gradient-to-r from-muted/50 via-transparent to-muted/50";
  };

  const stateLabels = {
    running: { text: "SOLVING", color: "text-green-500 dark:text-green-400" },
    ready: { text: "READY", color: "text-amber-500 dark:text-amber-400" },
    hold: { text: "HOLD", color: "text-red-500 dark:text-red-400" },
    idle: { text: "IDLE", color: "text-muted-foreground" },
  };

  const getCurrentState = () => {
    if (isRunning) return stateLabels.running;
    if (isReady) return stateLabels.ready;
    if (spacePressed) return stateLabels.hold;
    return stateLabels.idle;
  };

  const currentState = getCurrentState();

  return (
    <div className="relative flex flex-col items-center justify-center py-16 overflow-hidden">
      {/* Background Effects */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl transition-all duration-500 ease-out opacity-60",
          getBackgroundGradient(),
        )}
      />

      {/* Animated Border Ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl transition-all duration-300",
          isRunning && "animate-pulse",
          isReady && "animate-pulse",
          spacePressed && "animate-pulse",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-3xl border-2 transition-all duration-300",
            isRunning &&
              "border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]",
            isReady &&
              "border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]",
            spacePressed &&
              "border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]",
            !isRunning && !isReady && !spacePressed && "border-border/20",
          )}
        />
      </div>

      {/* Main Timer Display */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          key={pulseKey}
          className={cn(
            "timer-text font-mono font-black text-center transition-all duration-300 ease-out select-none",
            "text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem]",
            "tracking-tighter leading-none",
            getTimerColor(),
            getTimerScale(),
            getGlowEffect(),
            !isRunning && time > 0 && "animate-bounce-gentle",
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
          {formatTime(displayTime)}
        </div>

        {/* Milliseconds Display */}
        {displayTime > 0 && !isRunning && (
          <div
            className={cn(
              "text-lg sm:text-xl md:text-2xl font-mono font-semibold mt-2 transition-all duration-300",
              "text-muted-foreground animate-fade-in tabular-nums",
            )}
          >
            .
            {String(displayTime % 1000)
              .padStart(3, "0")
              .slice(0, 2)}
          </div>
        )}

        {/* Enhanced Visual Indicators */}
        <div className="flex items-center space-x-4 mt-6">
          {/* State Dots */}
          <div className="flex space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 ease-out",
                spacePressed && !isRunning
                  ? "bg-red-500 shadow-lg shadow-red-500/50 scale-125 animate-pulse"
                  : "bg-muted-foreground/20 scale-100",
              )}
            />
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 ease-out",
                isReady
                  ? "bg-amber-500 shadow-lg shadow-amber-500/50 scale-125 animate-pulse"
                  : "bg-muted-foreground/20 scale-100",
              )}
            />
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 ease-out",
                isRunning
                  ? "bg-green-500 shadow-lg shadow-green-500/50 scale-125 animate-pulse"
                  : "bg-muted-foreground/20 scale-100",
              )}
            />
          </div>

          {/* State Divider */}
          <div className="w-px h-4 bg-border/50" />

          {/* State Label */}
          <div
            className={cn(
              "text-xs font-bold tracking-wider transition-all duration-300 uppercase",
              currentState.color,
              isRunning && "animate-pulse",
            )}
          >
            {currentState.text}
          </div>
        </div>

        {/* Progress Ring for Running State */}
        {isRunning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <svg
              className="w-full h-full animate-spin"
              style={{ animationDuration: "3s" }}
              aria-label="Timer progress indicator"
              viewBox="0 0 100 100"
            >
              <title>Timer progress indicator</title>
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="8 4"
                className="text-green-500/30"
              />
            </svg>
          </div>
        )}

        {/* Floating Elements for Enhanced Visual Appeal */}
        {!isRunning && time === 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(3)].map((_, i) => (
              <div
                key={`floating-element-timer-${Date.now()}-${i}`}
                className={cn(
                  "absolute w-2 h-2 bg-primary/20 rounded-full animate-bounce",
                  "opacity-60",
                )}
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${30 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,currentColor_2px,transparent_2px)] bg-[length:20px_20px]" />
      </div>
    </div>
  );
}

export const Timer = memo(TimerComponent);
