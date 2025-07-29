"use client";

import { type CubeState, CubeColor, getBgClass } from "@/lib/cube-simulation";
import { cn } from "@/lib/utils";

interface CubeVisualizationProps {
  cubeState: CubeState;
  className?: string;
}

interface FaceProps {
  face: Uint8Array & { length: 9 };
  faceName: string;
  className?: string;
}

function Face({ face, faceName, className }: FaceProps) {
  return (
    <div className={cn("relative", className)}>
      <div className={cn("grid grid-cols-3 gap-0.5 border-2 border-gray-800")}>
        {Array.from({ length: 9 }, (_, i) => (
          <div
            key={`${faceName}-${i}-${face[i]}`}
            className={cn(
              "aspect-square border border-gray-600 rounded-sm shadow-inner",
              getBgClass(face[i] as CubeColor),
            )}
            title={`${faceName} sticker ${i + 1}: ${CubeColor[face[i] as CubeColor]}`}
          />
        ))}
      </div>
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300">
        {faceName.charAt(0)}
      </div>
    </div>
  );
}

export function CubeVisualization({
  cubeState,
  className,
}: CubeVisualizationProps) {
  return (
    <div
      className={cn("bg-gray-100 dark:bg-gray-800 p-6 rounded-lg", className)}
    >
      <div className="flex flex-col items-center space-y-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Scrambled Cube State
        </h3>

        {/* Cube net layout - L F R B with U on top, D on bottom */}
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {/* Top row - Up face only */}
          <div className="flex justify-center">
            <Face face={cubeState.U} faceName="Up" className="w-16 h-16" />
          </div>

          {/* Middle row - Left, Front, Right, Back */}
          <div className="flex gap-2">
            <Face face={cubeState.L} faceName="Left" className="w-16 h-16" />
            <Face face={cubeState.F} faceName="Front" className="w-16 h-16" />
            <Face face={cubeState.R} faceName="Right" className="w-16 h-16" />
            <Face face={cubeState.B} faceName="Back" className="w-16 h-16" />
          </div>

          {/* Bottom row - Down face only */}
          <div className="flex justify-center">
            <Face face={cubeState.D} faceName="Down" className="w-16 h-16" />
          </div>
        </div>

        {/* Legend */}
        <div className="text-xs text-gray-600 dark:text-gray-400 text-center space-y-1">
          <p className="font-medium">Standard Cube Net Layout</p>
          <div className="space-y-1">
            <div className="text-center">U (Up - White)</div>
            <div className="flex justify-center gap-4">
              <span>L (Left - Orange)</span>
              <span>F (Front - Green)</span>
              <span>R (Right - Red)</span>
              <span>B (Back - Blue)</span>
            </div>
            <div className="text-center">D (Down - Yellow)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CubeVisualization;
