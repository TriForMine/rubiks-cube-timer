"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";

interface PBCelebrationProps {
  isVisible: boolean;
  newPBTime: number;
  previousPBTime?: number;
  onClose: () => void;
}

export function PBCelebration({
  isVisible,
  newPBTime,
  previousPBTime,
  onClose,
}: PBCelebrationProps) {
  const [animationPhase, setAnimationPhase] = useState<
    "entrance" | "celebration" | "exit"
  >("entrance");

  const improvement = previousPBTime ? previousPBTime - newPBTime : newPBTime;

  const getImprovementMessage = () => {
    if (!previousPBTime) {
      return "Your first personal best!";
    }

    const improvementSeconds = improvement / 1000;
    if (improvementSeconds >= 5) {
      return `Amazing ${improvementSeconds.toFixed(2)}s improvement!`;
    } else if (improvementSeconds >= 1) {
      return `Great ${improvementSeconds.toFixed(2)}s improvement!`;
    } else {
      return `Nice ${improvementSeconds.toFixed(2)}s improvement!`;
    }
  };

  const getCelebrationLevel = () => {
    if (!previousPBTime) return "first";

    const improvementSeconds = improvement / 1000;
    if (improvementSeconds >= 10) return "massive";
    if (improvementSeconds >= 5) return "huge";
    if (improvementSeconds >= 1) return "great";
    return "nice";
  };

  const getCelebrationIcon = () => {
    const level = getCelebrationLevel();
    switch (level) {
      case "first":
        return <Crown className="w-12 h-12" />;
      case "massive":
        return <Trophy className="w-12 h-12" />;
      case "huge":
        return <Star className="w-12 h-12" />;
      case "great":
        return <Sparkles className="w-12 h-12" />;
      default:
        return <Zap className="w-12 h-12" />;
    }
  };

  const getCelebrationColors = () => {
    const level = getCelebrationLevel();
    switch (level) {
      case "first":
        return {
          bg: "from-purple-500/20 via-pink-500/20 to-purple-500/20",
          border: "border-purple-500/30",
          text: "text-purple-400",
          glow: "shadow-purple-500/50",
        };
      case "massive":
        return {
          bg: "from-yellow-500/20 via-orange-500/20 to-red-500/20",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
          glow: "shadow-yellow-500/50",
        };
      case "huge":
        return {
          bg: "from-blue-500/20 via-cyan-500/20 to-blue-500/20",
          border: "border-blue-500/30",
          text: "text-blue-400",
          glow: "shadow-blue-500/50",
        };
      case "great":
        return {
          bg: "from-green-500/20 via-emerald-500/20 to-green-500/20",
          border: "border-green-500/30",
          text: "text-green-400",
          glow: "shadow-green-500/50",
        };
      default:
        return {
          bg: "from-indigo-500/20 via-purple-500/20 to-indigo-500/20",
          border: "border-indigo-500/30",
          text: "text-indigo-400",
          glow: "shadow-indigo-500/50",
        };
    }
  };

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase("entrance");

      // Move to celebration phase
      const celebrationTimer = setTimeout(() => {
        setAnimationPhase("celebration");
      }, 500);

      // Auto close after celebration
      const closeTimer = setTimeout(() => {
        setAnimationPhase("exit");
        setTimeout(onClose, 500);
      }, 4000);

      return () => {
        clearTimeout(celebrationTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [isVisible, onClose]);

  const handleClick = () => {
    setAnimationPhase("exit");
    setTimeout(onClose, 300);
  };

  if (!isVisible) return null;

  const colors = getCelebrationColors();

  return (
    <button
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        "bg-black/50 backdrop-blur-sm border-0 outline-0",
        animationPhase === "entrance" && "animate-fade-in",
        animationPhase === "exit" && "animate-fade-out",
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="Close celebration"
      type="button"
    >
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const particleId = `particle-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;
          return (
            <div
              key={particleId}
              className={cn(
                "absolute w-2 h-2 rounded-full opacity-60",
                colors.text.replace("text-", "bg-"),
                animationPhase === "celebration" && "animate-bounce",
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          );
        })}
      </div>

      {/* Main celebration card */}
      <div
        className={cn(
          "relative max-w-md w-full mx-auto",
          "bg-gradient-to-br",
          colors.bg,
          "backdrop-blur-xl border-2",
          colors.border,
          "rounded-3xl p-8 shadow-2xl",
          colors.glow,
          animationPhase === "entrance" && "animate-scale-in",
          animationPhase === "celebration" && "animate-pulse-gentle",
          animationPhase === "exit" && "animate-scale-out",
        )}
      >
        {/* Celebration header */}
        <div className="text-center space-y-4">
          {/* Icon with rotation animation */}
          <div
            className={cn(
              "flex items-center justify-center mx-auto",
              "w-20 h-20 rounded-full",
              "bg-gradient-to-br from-white/10 to-white/5",
              "border border-white/20",
              colors.text,
              animationPhase === "celebration" && "animate-spin-slow",
            )}
          >
            {getCelebrationIcon()}
          </div>

          {/* PB announcement */}
          <div className="space-y-2">
            <h1
              className={cn(
                "text-3xl font-black tracking-tight",
                colors.text,
                animationPhase === "celebration" && "animate-pulse",
              )}
            >
              PERSONAL BEST!
            </h1>

            <div className="text-6xl font-mono font-black text-white tracking-tighter">
              {formatTime(newPBTime)}
            </div>

            <p className="text-lg font-semibold text-white/80">
              {getImprovementMessage()}
            </p>
          </div>

          {/* Previous PB comparison */}
          {previousPBTime && (
            <div className="bg-black/20 rounded-xl p-4 border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Previous PB:</span>
                <span className="font-mono font-bold text-white/80">
                  {formatTime(previousPBTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-white/60">Improvement:</span>
                <span className={cn("font-mono font-bold", colors.text)}>
                  -{formatTime(improvement)}
                </span>
              </div>
            </div>
          )}

          {/* Motivational message */}
          <div className="pt-4">
            {getCelebrationLevel() === "first" && (
              <p className="text-white/70 text-sm">
                🎉 Welcome to speedcubing! Your journey begins now!
              </p>
            )}
            {getCelebrationLevel() === "massive" && (
              <p className="text-white/70 text-sm">
                🔥 Incredible breakthrough! You're on fire!
              </p>
            )}
            {getCelebrationLevel() === "huge" && (
              <p className="text-white/70 text-sm">
                ⚡ Outstanding improvement! Keep pushing your limits!
              </p>
            )}
            {getCelebrationLevel() === "great" && (
              <p className="text-white/70 text-sm">
                💪 Great progress! Every second counts!
              </p>
            )}
            {getCelebrationLevel() === "nice" && (
              <p className="text-white/70 text-sm">
                🎯 Nice improvement! Consistency is key!
              </p>
            )}
          </div>

          {/* Close instruction */}
          <div className="pt-2">
            <p className="text-xs text-white/50">Click anywhere to continue</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-white/20 to-transparent rounded-full" />
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-white/10 to-transparent rounded-full" />
        <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div
          className="absolute bottom-4 right-4 w-3 h-3 bg-white/20 rounded-full animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
      </div>
    </button>
  );
}

// Custom animations for the component
const styles = `
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.9);
  }
}

@keyframes pulse-gentle {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.animate-scale-in {
  animation: scale-in 0.5s ease-out forwards;
}

.animate-scale-out {
  animation: scale-out 0.3s ease-in forwards;
}

.animate-pulse-gentle {
  animation: pulse-gentle 2s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

.animate-fade-out {
  animation: fade-out 0.3s ease-in forwards;
}
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
