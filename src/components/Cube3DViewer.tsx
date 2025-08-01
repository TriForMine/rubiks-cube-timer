/**
 * React component wrapper for the vanilla Three.js Rubik's Cube renderer
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Cube3DRenderer } from "../lib/cube-3d-renderer";
import { initWasm, isWasmInitialized, WasmCube } from "../lib/cube-wasm";

// Helper functions for compatibility with 3D renderer
type Face = Uint8Array & { length: 9 };
interface CubeState {
	U: Face;
	D: Face;
	F: Face;
	B: Face;
	R: Face;
	L: Face;
}

function createSolvedCube(): CubeState | null {
	if (!isWasmInitialized()) return null;

	try {
		const cube = WasmCube.solved();
		return wasmCubeToRendererState(cube);
	} catch (error) {
		console.warn("Error creating solved cube:", error);
		return null;
	}
}

function applyScramble(scramble: string): CubeState | null {
	if (!isWasmInitialized()) return null;

	try {
		const cube = WasmCube.solved();
		cube.applyScramble(scramble);
		return wasmCubeToRendererState(cube);
	} catch (error) {
		console.warn("Error applying scramble:", error);
		return null;
	}
}

// Helper function to convert WASM cube to renderer state
function wasmCubeToRendererState(wasmCube: WasmCube): CubeState {
	return {
		U: new Uint8Array(wasmCube.U) as Face,
		D: new Uint8Array(wasmCube.D) as Face,
		F: new Uint8Array(wasmCube.F) as Face,
		B: new Uint8Array(wasmCube.B) as Face,
		R: new Uint8Array(wasmCube.R) as Face,
		L: new Uint8Array(wasmCube.L) as Face,
	};
}

// Helper function to get reverse of a move
function getReverseMove(move: string): string {
	if (move.includes("'")) {
		return move.replace("'", "");
	} else if (move.includes("2")) {
		return move; // 2 moves are their own reverse
	} else {
		return `${move}'`;
	}
}

function _applyMove(cubeState: CubeState, move: string): CubeState {
	if (!isWasmInitialized()) return cubeState;

	try {
		// Create a WASM cube from the current state
		const tempCube = WasmCube.solved();

		// We need to reconstruct the cube state, but since we don't have a way to set
		// individual faces in WASM, we'll need to work around this limitation
		// For now, this function should not be used - use proper state tracking instead
		console.warn("applyMove function has limitations - use proper state tracking");

		// Apply the move to a temporary solved cube (this is a limitation)
		tempCube.applyMove(move);

		// Return the result of applying the move to a solved cube
		return wasmCubeToRendererState(tempCube);
	} catch (error) {
		console.warn("Error applying move:", error);
		return cubeState; // Return unchanged state on error
	}
}

interface Cube3DViewerProps {
	width?: number;
	height?: number;
	scramble?: string;
	enableRotationControls?: boolean;
	className?: string;
	onMoveComplete?: (move: string) => void;
	onScrambleComplete?: () => void;
	stepByStep?: boolean;
	currentStep?: number;
	animationSpeed?: number;
	onStepComplete?: (step: number, move: string) => void;
}

export const Cube3DViewer: React.FC<Cube3DViewerProps> = ({
	width = 400,
	height = 400,
	scramble = "",
	enableRotationControls = false,
	className = "",
	onScrambleComplete,
	stepByStep = false,
	currentStep = 0,
	animationSpeed = 700,
	onStepComplete,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const rendererRef = useRef<Cube3DRenderer | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const [currentScramble, setCurrentScramble] = useState(scramble);
	const [previousStep, setPreviousStep] = useState(currentStep);
	const [wasmReady, setWasmReady] = useState(false);
	const [wasmCubeState, setWasmCubeState] = useState<WasmCube | null>(null);
	const lastProcessedStepRef = useRef<number>(-1);
	const isInitializedRef = useRef<boolean>(false);
	const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

	// Initialize renderer with proper cleanup for rapid changes
	useEffect(() => {
		if (!canvasRef.current || !wasmReady) return;

		const canvas = canvasRef.current;
		canvas.width = width;
		canvas.height = height;

		// Always start with solved cube for step-by-step mode
		const initialState = stepByStep
			? createSolvedCube()
			: scramble
				? applyScramble(scramble)
				: createSolvedCube();

		if (!initialState) {
			console.warn("Failed to create initial cube state");
			return;
		}

		// Clear any pending initialization
		if (initTimeoutRef.current) {
			clearTimeout(initTimeoutRef.current);
			initTimeoutRef.current = null;
		}

		// Always dispose existing renderer first if it exists
		if (rendererRef.current) {
			rendererRef.current.dispose();
			rendererRef.current = null;
			isInitializedRef.current = false;
		}

		// Debounce initialization to prevent rapid re-creation
		initTimeoutRef.current = setTimeout(() => {
			if (canvasRef.current && !rendererRef.current) {
				try {
					rendererRef.current = new Cube3DRenderer(canvas, initialState);
					isInitializedRef.current = true;
				} catch (error) {
					console.error("Failed to create 3D renderer:", error);
				}
			}
			initTimeoutRef.current = null;
		}, 50);

		// Cleanup on unmount or change
		return () => {
			if (initTimeoutRef.current) {
				clearTimeout(initTimeoutRef.current);
				initTimeoutRef.current = null;
			}
			if (rendererRef.current) {
				rendererRef.current.dispose();
				rendererRef.current = null;
			}
			isInitializedRef.current = false;
		};
	}, [wasmReady, scramble, width, height, stepByStep]);

	// Handle size changes
	useEffect(() => {
		if (rendererRef.current && canvasRef.current && isInitializedRef.current) {
			canvasRef.current.width = width;
			canvasRef.current.height = height;
			rendererRef.current.resize(width, height);
		}
	}, [width, height]);

	// Initialize WASM cube state for step-by-step
	useEffect(() => {
		if (!wasmReady || !stepByStep) return;

		try {
			const cube = WasmCube.solved();
			setWasmCubeState(cube);
			lastProcessedStepRef.current = -1;
		} catch (error) {
			console.error("Failed to create WASM cube:", error);
		}
	}, [wasmReady, stepByStep]);

	// Handle step-by-step progression using useCallback to avoid dependency issues
	const updateToStep = useCallback(
		async (targetStep: number) => {
			if (
				!rendererRef.current ||
				!wasmCubeState ||
				isAnimating ||
				!isInitializedRef.current ||
				targetStep === previousStep
			) {
				return;
			}

			try {
				const moves = currentScramble.trim().split(/\s+/).filter(Boolean);
				const stepDifference = targetStep - previousStep;

				if (targetStep === 0) {
					// Reset to solved state
					const newCube = WasmCube.solved();
					setWasmCubeState(newCube);
					const solvedState = createSolvedCube();
					if (solvedState) {
						rendererRef.current.updateState(solvedState);
						setPreviousStep(0);
						lastProcessedStepRef.current = 0;
					}
				} else if (stepDifference === 1 && targetStep > previousStep) {
					// Single step forward - animate the move
					if (targetStep <= moves.length && moves[targetStep - 1]) {
						setIsAnimating(true);
						const move = moves[targetStep - 1];

						// Apply move to WASM cube state
						wasmCubeState.applyMove(move);

						// Convert to renderer state and update
						const newState = wasmCubeToRendererState(wasmCubeState);

						// Animate the move
						await rendererRef.current.animateMove(move, animationSpeed);

						// Update the renderer state to match WASM state
						rendererRef.current.updateState(newState);

						setIsAnimating(false);
						setPreviousStep(targetStep);
						lastProcessedStepRef.current = targetStep;

						if (onStepComplete) {
							onStepComplete(targetStep - 1, move);
						}
					}
				} else if (stepDifference === 1 && targetStep < previousStep) {
					// Single step backward - animate the reverse move
					if (previousStep > 0 && moves[previousStep - 1]) {
						setIsAnimating(true);
						const moveToReverse = moves[previousStep - 1];

						// Get the reverse of the move
						const reverseMove = getReverseMove(moveToReverse);

						// Apply reverse move to WASM cube state
						wasmCubeState.applyMove(reverseMove);

						// Convert to renderer state and update
						const newState = wasmCubeToRendererState(wasmCubeState);

						await rendererRef.current.animateMove(reverseMove, animationSpeed);
						rendererRef.current.updateState(newState);

						setIsAnimating(false);
						setPreviousStep(targetStep);
						lastProcessedStepRef.current = targetStep;

						if (onStepComplete && targetStep > 0) {
							onStepComplete(targetStep - 1, moves[targetStep - 1]);
						}
					}
				} else {
					// Multi-step jump or backward movement - rebuild state instantly
					const newCube = WasmCube.solved();

					// Apply moves up to the target step
					for (let i = 0; i < targetStep && i < moves.length; i++) {
						try {
							newCube.applyMove(moves[i]);
						} catch (error) {
							console.warn(`Error applying move ${moves[i]}:`, error);
						}
					}

					setWasmCubeState(newCube);

					// Convert WASM cube back to renderer state
					const newState = wasmCubeToRendererState(newCube);

					rendererRef.current.updateState(newState);
					setPreviousStep(targetStep);
					lastProcessedStepRef.current = targetStep;

					if (onStepComplete && targetStep > 0 && targetStep <= moves.length) {
						const currentMove = moves[targetStep - 1];
						onStepComplete(targetStep - 1, currentMove);
					}
				}
			} catch (error) {
				console.error("Error in step-by-step update:", error);
				setIsAnimating(false);
			}
		},
		[isAnimating, wasmCubeState, previousStep, animationSpeed, onStepComplete, currentScramble]
	);

	// Handle step-by-step progression
	useEffect(() => {
		if (
			!stepByStep ||
			!rendererRef.current ||
			!scramble ||
			!wasmCubeState ||
			!isInitializedRef.current ||
			lastProcessedStepRef.current === currentStep
		) {
			return;
		}

		updateToStep(currentStep);
	}, [stepByStep, currentStep, scramble, wasmCubeState, updateToStep]);

	// Handle scramble changes for non-step-by-step mode
	useEffect(() => {
		if (
			stepByStep ||
			!rendererRef.current ||
			scramble === currentScramble ||
			!wasmReady ||
			!isInitializedRef.current
		)
			return;

		const animateNewScramble = async () => {
			if (!rendererRef.current || !isInitializedRef.current) return;

			setIsAnimating(true);
			setCurrentScramble(scramble);

			try {
				if (scramble) {
					// Start with solved cube and animate the scramble
					const solvedState = createSolvedCube();
					if (solvedState) {
						rendererRef.current.updateState(solvedState);

						// Small delay before starting animation
						await new Promise((resolve) => setTimeout(resolve, 100));

						await rendererRef.current.animateScramble(scramble, animationSpeed);
					}
				} else {
					// No scramble - show solved cube
					const solvedState = createSolvedCube();
					if (solvedState) {
						rendererRef.current.updateState(solvedState);
					}
				}

				if (onScrambleComplete) {
					onScrambleComplete();
				}
			} catch (error) {
				console.error("Error animating scramble:", error);
			} finally {
				setIsAnimating(false);
			}
		};

		animateNewScramble();
	}, [scramble, currentScramble, onScrambleComplete, stepByStep, animationSpeed, wasmReady]);

	// Mouse and touch interaction for rotation
	useEffect(() => {
		if (!canvasRef.current || !enableRotationControls || !isInitializedRef.current) return;

		const canvas = canvasRef.current;
		let isDragging = false;
		let previousPosition = { x: 0, y: 0 };

		// Initialize with current camera position from renderer
		if (!rendererRef.current) return;

		const { x: camX, y: camY, z: camZ } = rendererRef.current.getCameraPosition();
		const radius = Math.sqrt(camX * camX + camY * camY + camZ * camZ);
		let rotationY = Math.atan2(camX, camZ); // horizontal angle
		let rotationX = Math.asin(camY / radius); // vertical angle

		// Common drag logic for both mouse and touch
		const handleDragStart = (clientX: number, clientY: number) => {
			isDragging = true;
			previousPosition = { x: clientX, y: clientY };
			canvas.style.cursor = "grabbing";
		};

		const handleDragMove = (clientX: number, clientY: number) => {
			if (!isDragging || !rendererRef.current) return;

			const deltaMove = {
				x: clientX - previousPosition.x,
				y: clientY - previousPosition.y,
			};

			// Sensitivity adjustment and fix reversed controls
			const sensitivity = 0.008; // Increased for better responsiveness
			rotationY += deltaMove.x * sensitivity;
			rotationX -= deltaMove.y * sensitivity; // Fix: subtract for natural vertical movement

			// Limit vertical rotation to prevent flipping (keep some margin from poles)
			const verticalLimit = Math.PI / 2 - 0.2; // More conservative limit
			rotationX = Math.max(-verticalLimit, Math.min(verticalLimit, rotationX));

			// Calculate camera position using spherical coordinates
			// x: left/right movement, y: up/down, z: forward/back
			const x = radius * Math.sin(rotationY) * Math.cos(rotationX);
			const y = radius * Math.sin(rotationX);
			const z = radius * Math.cos(rotationY) * Math.cos(rotationX);

			rendererRef.current.setCamera(x, y, z);

			previousPosition = { x: clientX, y: clientY };
		};

		const handleDragEnd = () => {
			isDragging = false;
			canvas.style.cursor = "grab";
		};

		// Mouse event handlers
		const handleMouseDown = (event: MouseEvent) => {
			event.preventDefault();
			handleDragStart(event.clientX, event.clientY);
		};

		const handleMouseMove = (event: MouseEvent) => {
			handleDragMove(event.clientX, event.clientY);
		};

		const handleMouseUp = () => {
			handleDragEnd();
		};

		// Touch event handlers
		const handleTouchStart = (event: TouchEvent) => {
			event.preventDefault();
			if (event.touches.length === 1) {
				const touch = event.touches[0];
				handleDragStart(touch.clientX, touch.clientY);
			}
		};

		const handleTouchMove = (event: TouchEvent) => {
			event.preventDefault();
			if (event.touches.length === 1 && isDragging) {
				const touch = event.touches[0];
				handleDragMove(touch.clientX, touch.clientY);
			}
		};

		const handleTouchEnd = (event: TouchEvent) => {
			event.preventDefault();
			handleDragEnd();
		};

		// Add event listeners
		canvas.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
		canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
		canvas.addEventListener("touchend", handleTouchEnd, { passive: false });

		// Set initial cursor
		canvas.style.cursor = "grab";
		canvas.style.touchAction = "none"; // Prevent scrolling on touch

		return () => {
			canvas.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);

			canvas.removeEventListener("touchstart", handleTouchStart);
			canvas.removeEventListener("touchmove", handleTouchMove);
			canvas.removeEventListener("touchend", handleTouchEnd);
		};
	}, [enableRotationControls]);

	return (
		<div className={`relative flex justify-center ${className}`}>
			<canvas
				ref={canvasRef}
				width={width}
				height={height}
				className="border border-gray-300 dark:border-gray-600 rounded-lg"
				style={{ width: `${width}px`, height: `${height}px` }}
			/>

			{/* Animation status indicator */}
			{isAnimating && (
				<div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-lg">
					<div className="flex items-center space-x-1">
						<div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
						<span>Animating</span>
					</div>
				</div>
			)}

			{/* Debug info - remove in production */}
			{process.env.NODE_ENV === "development" && (
				<div className="absolute top-2 left-2 text-xs bg-black bg-opacity-50 text-white p-1 rounded">
					Scramble: {scramble || "None"}
					<br />
					Step: {stepByStep ? `${currentStep}` : "N/A"}
					<br />
					Animating: {isAnimating ? "Yes" : "No"}
					<br />
					WASM: {wasmReady ? "Ready" : "Loading"}
				</div>
			)}

			{/* Loading indicator when WASM is not ready */}
			{!wasmReady && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
					<div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
						<div className="animate-spin rounded-full h-4 w-4 border-b border-gray-600"></div>
						<span className="text-sm">Initializing WASM...</span>
					</div>
				</div>
			)}
		</div>
	);
};

export default Cube3DViewer;
