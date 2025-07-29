"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, Copy, RefreshCw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrambleDialogProps {
  scramble: string;
  onNewScramble: () => void;
  children?: React.ReactNode;
}

export function ScrambleDialog({
  scramble,
  onNewScramble,
  children,
}: ScrambleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scramble);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy scramble:", error);
    }
  };

  const scrambleMoves = scramble.split(" ");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Scramble
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary" />
            Scramble Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cube Visualization */}
          <div className="flex justify-center">
            <div className="w-80 h-80 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-4 z-10">
                <div className="relative mx-auto">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    className="text-primary drop-shadow-lg"
                    aria-label="3D cube representation"
                  >
                    <title>3D Cube Visualization</title>
                    {/* Cube faces with different colors for 3D effect */}
                    <polygon
                      points="20,40 60,20 100,40 60,60"
                      fill="hsl(var(--primary))"
                      opacity="0.9"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                    />
                    <polygon
                      points="20,40 60,60 60,100 20,80"
                      fill="hsl(var(--primary))"
                      opacity="0.7"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                    />
                    <polygon
                      points="60,60 100,40 100,80 60,100"
                      fill="hsl(var(--primary))"
                      opacity="0.5"
                      stroke="hsl(var(--primary))"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-semibold">Scrambled Cube</p>
                  <p className="text-sm text-muted-foreground">
                    {scrambleMoves.length} moves applied
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cube is ready to solve
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scramble Sequence Display */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Scramble Sequence</h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-2">
                {scrambleMoves.map((move, index) => (
                  <span
                    key={`dialog-move-${index}-${move}`}
                    className={cn(
                      "px-3 py-2 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 font-mono font-bold",
                      "text-sm min-w-[3rem] text-center",
                      "transition-colors hover:bg-accent",
                    )}
                  >
                    {move}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>{scrambleMoves.length} moves • 3×3×3 Cube</span>
                <span>WCA Official Format</span>
              </div>
            </div>
          </div>

          {/* Algorithm Breakdown */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Move Analysis</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total moves:</span>
                  <span className="font-mono font-bold">
                    {scrambleMoves.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Face turns:</span>
                  <span className="font-mono font-bold">
                    {
                      scrambleMoves.filter(
                        (move) => !move.includes("'") && !move.includes("2"),
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prime moves:</span>
                  <span className="font-mono font-bold">
                    {scrambleMoves.filter((move) => move.includes("'")).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Double turns:</span>
                  <span className="font-mono font-bold">
                    {scrambleMoves.filter((move) => move.includes("2")).length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">R moves:</span>
                  <span className="font-mono font-bold">
                    {
                      scrambleMoves.filter((move) => move.startsWith("R"))
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">U moves:</span>
                  <span className="font-mono font-bold">
                    {
                      scrambleMoves.filter((move) => move.startsWith("U"))
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">F moves:</span>
                  <span className="font-mono font-bold">
                    {
                      scrambleMoves.filter((move) => move.startsWith("F"))
                        .length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">L/D/B moves:</span>
                  <span className="font-mono font-bold">
                    {
                      scrambleMoves.filter(
                        (move) =>
                          move.startsWith("L") ||
                          move.startsWith("D") ||
                          move.startsWith("B"),
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="default"
              onClick={handleCopy}
              className={cn(
                "flex-1 min-w-[120px]",
                copied && "bg-green-600 hover:bg-green-700",
              )}
            >
              {copied ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Scramble
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                onNewScramble();
                setIsOpen(false);
              }}
              className="flex-1 min-w-[120px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Scramble
            </Button>
          </div>

          {/* Educational Info */}
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Scramble Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>
                • Hold the cube with white face on top, green face facing you
              </li>
              <li>
                • Execute moves exactly as written (R = clockwise, R' =
                counterclockwise)
              </li>
              <li>
                • R2 means turn the right face 180 degrees (two quarter turns)
              </li>
              <li>
                • Take your time with the scramble - accuracy is more important
                than speed
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
