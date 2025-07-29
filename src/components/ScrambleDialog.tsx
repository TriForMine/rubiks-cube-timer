"use client";

import { useState, useMemo } from "react";
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
import { CubeVisualization } from "@/components/CubeVisualization";
import { applyScramble } from "@/lib/cube-simulation";

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

  // Calculate the cube state after applying the scramble
  const scrambledCubeState = useMemo(() => {
    console.log("Scramble:", scramble);
    return applyScramble(scramble);
  }, [scramble]);

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
          {/* Cube State Preview */}
          <div className="flex justify-center">
            <CubeVisualization cubeState={scrambledCubeState} />
          </div>

          {/* Verification Instructions */}
          <div className="bg-amber-50 dark:bg-amber-900 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2 flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Scramble Verification
            </h4>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
              After applying the scramble, your cube should match the pattern
              above. Use this to verify you've executed the scramble correctly.
            </p>
            <div className="text-xs text-amber-700 dark:text-amber-300">
              <strong>Tip:</strong> Compare the colors on each visible face with
              your physical cube to confirm accuracy.
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

          {/* Face Impact Analysis */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Face Impact Analysis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-2">
                  Most Affected Faces
                </h4>
                <div className="space-y-1 text-xs">
                  {Object.entries({
                    "Right (R)": scrambleMoves.filter((move) =>
                      move.startsWith("R"),
                    ).length,
                    "Up (U)": scrambleMoves.filter((move) =>
                      move.startsWith("U"),
                    ).length,
                    "Front (F)": scrambleMoves.filter((move) =>
                      move.startsWith("F"),
                    ).length,
                    "Left (L)": scrambleMoves.filter((move) =>
                      move.startsWith("L"),
                    ).length,
                    "Down (D)": scrambleMoves.filter((move) =>
                      move.startsWith("D"),
                    ).length,
                    "Back (B)": scrambleMoves.filter((move) =>
                      move.startsWith("B"),
                    ).length,
                  })
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([face, count]) => (
                      <div key={face} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {face}:
                        </span>
                        <span className="font-mono font-bold">
                          {count} moves
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border">
                <h4 className="font-medium text-sm mb-2">
                  Scramble Complexity
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Difficulty:
                    </span>
                    <span className="font-bold text-primary">
                      {scrambleMoves.length >= 20
                        ? "Competition"
                        : scrambleMoves.length >= 15
                          ? "Intermediate"
                          : "Beginner"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Pattern:
                    </span>
                    <span className="font-mono text-xs">
                      {scrambleMoves.filter(
                        (move) => !move.includes("'") && !move.includes("2"),
                      ).length >
                      scrambleMoves.length / 2
                        ? "Clockwise"
                        : "Mixed"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Est. Time:
                    </span>
                    <span className="font-mono text-xs">
                      {Math.ceil(scrambleMoves.length * 1.5)}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
                • Execute moves exactly as written (R = clockwise, R&apos; =
                counterclockwise)
              </li>
              <li>
                • R2 means turn the right face 180 degrees (two quarter turns)
              </li>
              <li>
                • Take your time with the scramble - accuracy is more important
                than speed
              </li>
              <li>
                • Compare your cube to the preview above after completing all
                moves
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
