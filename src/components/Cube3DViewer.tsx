/**
 * React component wrapper for the vanilla Three.js Rubik's Cube renderer
 */

import { useEffect, useRef, useState } from "react";
import { Cube3DRenderer } from "../lib/cube-3d-renderer";
import { applyMove, applyScramble, createSolvedCube } from "../lib/cube-simulation";

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

	// Initialize renderer
	useEffect(() => {
		if (!canvasRef.current) return;

		const canvas = canvasRef.current;
		canvas.width = width;
		canvas.height = height;

		const initialState = scramble ? applyScramble(scramble) : createSolvedCube();
		rendererRef.current = new Cube3DRenderer(canvas, initialState);

		// Cleanup on unmount
		return () => {
			if (rendererRef.current) {
				rendererRef.current.dispose();
				rendererRef.current = null;
			}
		};
	}, [width, height, scramble]);

	// Handle size changes
	useEffect(() => {
		if (rendererRef.current && canvasRef.current) {
			canvasRef.current.width = width;
			canvasRef.current.height = height;
			rendererRef.current.resize(width, height);
		}
	}, [width, height]);

	// Handle step-by-step progression
	useEffect(() => {
		if (!stepByStep || !rendererRef.current || !scramble) return;

		const moves = scramble.trim().split(/\s+/).filter(Boolean);

		const updateToStep = async () => {
			if (!rendererRef.current || isAnimating) return;

			try {
				const stepDifference = Math.abs(currentStep - previousStep);

				if (currentStep === 0) {
					// Reset to solved state
					const solvedState = createSolvedCube();
					rendererRef.current.updateState(solvedState);
					setPreviousStep(0);
				} else if (stepDifference === 1 && currentStep > previousStep) {
					// Single step forward - animate the move
					if (currentStep <= moves.length && moves[currentStep - 1]) {
						setIsAnimating(true);
						await rendererRef.current.animateMove(moves[currentStep - 1], animationSpeed);
						setIsAnimating(false);
						setPreviousStep(currentStep);

						if (onStepComplete) {
							onStepComplete(currentStep - 1, moves[currentStep - 1]);
						}
					}
				} else if (stepDifference === 1 && currentStep < previousStep) {
					// Single step backward - animate the reverse move
					if (previousStep > 0 && moves[previousStep - 1]) {
						setIsAnimating(true);
						const moveToReverse = moves[previousStep - 1];
						// Get the reverse of the move (add ' if none, remove ' if present, handle 2)
						let reverseMove = moveToReverse;
						if (moveToReverse.includes("'")) {
							reverseMove = moveToReverse.replace("'", "");
						} else if (moveToReverse.includes("2")) {
							reverseMove = moveToReverse; // 2 moves are their own reverse
						} else {
							reverseMove = `${moveToReverse}'`;
						}

						await rendererRef.current.animateMove(reverseMove, animationSpeed);
						setIsAnimating(false);
						setPreviousStep(currentStep);

						if (onStepComplete && currentStep > 0) {
							onStepComplete(currentStep - 1, moves[currentStep - 1]);
						}
					}
				} else {
					// Multi-step jump or backward movement - rebuild state instantly
					const state = createSolvedCube();
					const movesToApply = moves.slice(0, currentStep);

					for (const move of movesToApply) {
						applyMove(state, move);
					}

					rendererRef.current.updateState(state);
					setPreviousStep(currentStep);

					if (onStepComplete && currentStep > 0 && currentStep <= moves.length) {
						const currentMove = moves[currentStep - 1];
						onStepComplete(currentStep - 1, currentMove);
					}
				}
			} catch (error) {
				console.error("Error in step-by-step update:", error);
				setIsAnimating(false);
			}
		};

		updateToStep();
	}, [
		stepByStep,
		currentStep,
		scramble,
		onStepComplete,
		previousStep,
		isAnimating,
		animationSpeed,
	]);

	// Handle scramble changes for non-step-by-step mode
	useEffect(() => {
		if (stepByStep || !rendererRef.current || scramble === currentScramble) return;

		const animateNewScramble = async () => {
			if (!rendererRef.current) return;

			setIsAnimating(true);
			setCurrentScramble(scramble);

			try {
				if (scramble) {
					// Start with solved cube and animate the scramble
					const solvedState = createSolvedCube();
					rendererRef.current.updateState(solvedState);

					// Small delay before starting animation
					await new Promise((resolve) => setTimeout(resolve, 100));

					await rendererRef.current.animateScramble(scramble, animationSpeed);
				} else {
					// No scramble - show solved cube
					const solvedState = createSolvedCube();
					rendererRef.current.updateState(solvedState);
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
	}, [scramble, currentScramble, onScrambleComplete, stepByStep, animationSpeed]);

	// Mouse and touch interaction for rotation
	useEffect(() => {
		if (!canvasRef.current || !enableRotationControls) return;

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
				</div>
			)}
		</div>
	);
};

export default Cube3DViewer;
