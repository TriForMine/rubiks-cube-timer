"use client";

import { Grid3x3, X } from "lucide-react";
import { useEffect, useState } from "react";
import { CubeVisualization } from "@/components/CubeVisualization";
import { Button } from "@/components/ui/button";
import { initWasm, isWasmInitialized, WasmCube } from "@/lib/cube-wasm";
import { cn } from "@/lib/utils";

interface FloatingCubeButtonProps {
	scramble: string;
	className?: string;
}

export function FloatingCubeButton({ scramble, className }: FloatingCubeButtonProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [isInitialMount, setIsInitialMount] = useState(true);
	const [wasmReady, setWasmReady] = useState(false);
	const [scrambledCubeState, setScrambledCubeState] = useState<WasmCube | null>(null);

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
			localStorage.setItem("cube-visualization-visible", JSON.stringify(isVisible));
		} catch (error) {
			console.error("Error saving cube visualization state:", error);
		}
	}, [isVisible, isInitialMount]);

	// Initialize WASM
	useEffect(() => {
		const initializeWasm = async () => {
			if (!isWasmInitialized()) {
				try {
					await initWasm();
				} catch (error) {
					console.error("Failed to initialize WASM:", error);
					return;
				}
			}
			setWasmReady(true);
		};

		initializeWasm();
	}, []);

	// Update cube state when WASM is ready or scramble changes
	useEffect(() => {
		if (!wasmReady) return;

		try {
			const cube = WasmCube.solved();
			cube.applyScramble(scramble);
			setScrambledCubeState(cube);
		} catch (error) {
			console.warn("Error applying scramble:", error);
			setScrambledCubeState(null);
		}
	}, [scramble, wasmReady]);

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
					className
				)}
				title={isVisible ? "Hide Cube Visualization" : "Show Cube Visualization"}
			>
				{isVisible ? <X className="h-5 w-5" /> : <Grid3x3 className="h-5 w-5" />}
			</Button>

			{/* Cube Visualization */}
			{isVisible && (
				<div className="fixed bottom-20 right-20 z-40 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
					{scrambledCubeState ? (
						<CubeVisualization
							cubeState={scrambledCubeState}
							className="scale-90 origin-bottom-right shadow-xl"
						/>
					) : (
						<div className="scale-90 origin-bottom-right shadow-xl bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
							<div className="flex items-center justify-center h-32 w-64 text-muted-foreground">
								{wasmReady ? "Loading cube state..." : "Initializing WASM..."}
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}

export default FloatingCubeButton;
