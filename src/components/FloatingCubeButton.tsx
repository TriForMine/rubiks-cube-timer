"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CubeVisualization } from "@/components/CubeVisualization";
import { Grid3x3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { applyScramble } from "@/lib/cube-simulation";
import { useMemo } from "react";

interface FloatingCubeButtonProps {
  scramble: string;
  className?: string;
}

export function FloatingCubeButton({
  scramble,
  className,
}: FloatingCubeButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Load visibility state from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem("cube-visualization-visible");
      if (savedState !== null) {
        const parsedState = JSON.parse(savedState);
        setIsVisible(parsedState);
      }
      setIsInitialMount(false);
    } catch (error) {
      console.error("Error loading cube visualization state:", error);
      setIsInitialMount(false);
    }
  }, []);

  // Save visibility state to localStorage when it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount) return;

    try {
      localStorage.setItem(
        "cube-visualization-visible",
        JSON.stringify(isVisible),
      );
    } catch (error) {
      console.error("Error saving cube visualization state:", error);
    }
  }, [isVisible, isInitialMount]);

  // Calculate the cube state after applying the scramble
  const scrambledCubeState = useMemo(() => {
    return applyScramble(scramble);
  }, [scramble]);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="default"
        size="icon"
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl",
          "bg-primary hover:bg-primary/90 transition-all duration-200",
          "hover:scale-105 active:scale-95",
          "border-2 border-primary-foreground/10",
          className,
        )}
        title={
          isVisible ? "Hide Cube Visualization" : "Show Cube Visualization"
        }
      >
        {isVisible ? (
          <X className="h-5 w-5" />
        ) : (
          <Grid3x3 className="h-5 w-5" />
        )}
      </Button>

      {/* Cube Visualization */}
      {isVisible && (
        <div className="fixed bottom-20 right-20 z-40 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
          <CubeVisualization
            cubeState={scrambledCubeState}
            className="scale-90 origin-bottom-right shadow-xl"
          />
        </div>
      )}
    </>
  );
}

export default FloatingCubeButton;
