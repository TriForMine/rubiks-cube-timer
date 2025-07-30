import { describe, expect, test } from "bun:test";
import type { CubeState } from "../../src/lib/cube-simulation";
import {
	applyMove,
	applyScramble,
	CubeColor,
	createSolvedCube,
	getBgClass,
	getDisplayHex,
	getFaceName,
	isCubeSolved,
} from "../../src/lib/cube-simulation";

// Test utilities
const FACES = ["U", "D", "F", "B", "R", "L"] as const;
const BASE_MOVES = ["R", "L", "U", "D", "F", "B"] as const;
const MOVE_MODIFIERS = ["", "'", "2"] as const;

function getColorHistogram(cube: CubeState): number[] {
	const histogram = Array(6).fill(0);
	FACES.forEach((face) => {
		cube[face].forEach((sticker) => histogram[sticker]++);
	});
	return histogram;
}

function getCenters(cube: CubeState): CubeColor[] {
	return FACES.map((face) => cube[face][4]);
}

function generateRandomScramble(length = 25): string[] {
	return Array.from({ length }, () => {
		const base = BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
		const modifier = MOVE_MODIFIERS[Math.floor(Math.random() * MOVE_MODIFIERS.length)];
		return base + modifier;
	});
}

function invertMove(move: string): string {
	const base = move[0];
	const modifier = move.slice(1);

	switch (modifier) {
		case "":
			return `${base}'`;
		case "'":
			return base;
		case "2":
			return move; // X2 is its own inverse
		default:
			return move;
	}
}

describe("Cube Creation and State", () => {
	test("creates a solved cube with correct colors", () => {
		const cube = createSolvedCube();

		expect(cube.U.every((color) => color === CubeColor.White)).toBe(true);
		expect(cube.D.every((color) => color === CubeColor.Yellow)).toBe(true);
		expect(cube.F.every((color) => color === CubeColor.Green)).toBe(true);
		expect(cube.B.every((color) => color === CubeColor.Blue)).toBe(true);
		expect(cube.R.every((color) => color === CubeColor.Red)).toBe(true);
		expect(cube.L.every((color) => color === CubeColor.Orange)).toBe(true);
	});

	test("solved cube is detected as solved", () => {
		const cube = createSolvedCube();
		expect(isCubeSolved(cube)).toBe(true);
	});

	test("each face has exactly 9 stickers", () => {
		const cube = createSolvedCube();
		FACES.forEach((face) => {
			expect(cube[face].length).toBe(9);
		});
	});

	test("solved cube has correct color distribution", () => {
		const cube = createSolvedCube();
		const histogram = getColorHistogram(cube);

		// Each color should appear exactly 9 times (one face)
		expect(histogram).toEqual([9, 9, 9, 9, 9, 9]);
	});
});

describe("Basic Move Properties", () => {
	test("every move preserves color histogram", () => {
		const initialHistogram = getColorHistogram(createSolvedCube());

		BASE_MOVES.forEach((base) => {
			MOVE_MODIFIERS.forEach((modifier) => {
				const move = base + modifier;
				const cube = createSolvedCube();
				applyMove(cube, move);

				expect(getColorHistogram(cube)).toEqual(initialHistogram);
			});
		});
	});

	test("centers never move during any rotation", () => {
		const solvedCenters = getCenters(createSolvedCube());

		BASE_MOVES.forEach((base) => {
			MOVE_MODIFIERS.forEach((modifier) => {
				const move = base + modifier;
				const cube = createSolvedCube();
				applyMove(cube, move);

				expect(getCenters(cube)).toEqual(solvedCenters);
			});
		});
	});

	test("applying any move 4 times returns to solved state", () => {
		BASE_MOVES.forEach((base) => {
			const cube = createSolvedCube();

			// Apply the move 4 times
			for (let i = 0; i < 4; i++) {
				applyMove(cube, base);
			}

			expect(isCubeSolved(cube)).toBe(true);
		});
	});

	test("applying any double move twice returns to solved state", () => {
		BASE_MOVES.forEach((base) => {
			const cube = createSolvedCube();
			const doubleMove = `${base}2`;

			applyMove(cube, doubleMove);
			applyMove(cube, doubleMove);

			expect(isCubeSolved(cube)).toBe(true);
		});
	});

	test("prime moves are correct inverses", () => {
		BASE_MOVES.forEach((base) => {
			const cube = createSolvedCube();

			// Apply move then its inverse
			applyMove(cube, base);
			applyMove(cube, `${base}'`);

			expect(isCubeSolved(cube)).toBe(true);
		});
	});
});

describe("Move Sequences", () => {
	test("R U R' U' has order 6 (sexy move)", () => {
		const cube = createSolvedCube();
		const sexyMove = ["R", "U", "R'", "U'"];

		// Apply the sequence 6 times
		for (let i = 0; i < 6; i++) {
			sexyMove.forEach((move) => applyMove(cube, move));
		}

		expect(isCubeSolved(cube)).toBe(true);
	});

	test("R U R' U' sequence maintains color histogram at each step", () => {
		const cube = createSolvedCube();
		const initialHistogram = getColorHistogram(cube);
		const sequence = ["R", "U", "R'", "U'"];

		sequence.forEach((move) => {
			applyMove(cube, move);
			expect(getColorHistogram(cube)).toEqual(initialHistogram);
		});
	});

	test("applying scramble then its inverse returns to solved", () => {
		for (let trial = 0; trial < 50; trial++) {
			const scramble = generateRandomScramble(15);
			const inverse = [...scramble].reverse().map(invertMove);

			const cube = createSolvedCube();

			// Apply scramble
			scramble.forEach((move) => applyMove(cube, move));

			// Apply inverse
			inverse.forEach((move) => applyMove(cube, move));

			expect(isCubeSolved(cube)).toBe(true);
		}
	});
});

describe("applyScramble function", () => {
	test("applies empty scramble correctly", () => {
		const cube = applyScramble("");
		expect(isCubeSolved(cube)).toBe(true);
	});

	test("applies single move scramble", () => {
		const cube = applyScramble("R");
		expect(isCubeSolved(cube)).toBe(false);

		// Apply inverse to verify
		applyMove(cube, "R'");
		expect(isCubeSolved(cube)).toBe(true);
	});

	test("handles whitespace in scramble string", () => {
		const cube1 = applyScramble("R U R'");
		const cube2 = applyScramble("  R   U   R'  ");
		const cube3 = applyScramble("R\tU\nR'");

		// All should produce the same result
		FACES.forEach((face) => {
			expect(Array.from(cube1[face])).toEqual(Array.from(cube2[face]));
			expect(Array.from(cube1[face])).toEqual(Array.from(cube3[face]));
		});
	});

	test("applies complex scramble and maintains color histogram", () => {
		const scramble = "R U R' U' R' F R2 U' R' U' R U R' F'";
		const cube = applyScramble(scramble);

		const histogram = getColorHistogram(cube);
		expect(histogram).toEqual([9, 9, 9, 9, 9, 9]);
	});
});

describe("UI Helper Functions", () => {
	test("getDisplayHex returns correct hex colors", () => {
		expect(getDisplayHex(CubeColor.White)).toBe("#FFFFFF");
		expect(getDisplayHex(CubeColor.Yellow)).toBe("#FFD700");
		expect(getDisplayHex(CubeColor.Red)).toBe("#EF4444");
		expect(getDisplayHex(CubeColor.Orange)).toBe("#F97316");
		expect(getDisplayHex(CubeColor.Blue)).toBe("#2563EB");
		expect(getDisplayHex(CubeColor.Green)).toBe("#16A34A");
	});

	test("getBgClass returns correct Tailwind classes", () => {
		expect(getBgClass(CubeColor.White)).toBe("bg-white dark:bg-zinc-200");
		expect(getBgClass(CubeColor.Yellow)).toBe("bg-yellow-400 dark:bg-yellow-300");
		expect(getBgClass(CubeColor.Red)).toBe("bg-red-500 dark:bg-red-400");
		expect(getBgClass(CubeColor.Orange)).toBe("bg-orange-500 dark:bg-orange-400");
		expect(getBgClass(CubeColor.Blue)).toBe("bg-blue-600 dark:bg-blue-500");
		expect(getBgClass(CubeColor.Green)).toBe("bg-green-600 dark:bg-green-500");
	});

	test("getFaceName returns correct face descriptions", () => {
		expect(getFaceName("U")).toBe("Up (White)");
		expect(getFaceName("D")).toBe("Down (Yellow)");
		expect(getFaceName("F")).toBe("Front (Green)");
		expect(getFaceName("B")).toBe("Back (Blue)");
		expect(getFaceName("R")).toBe("Right (Red)");
		expect(getFaceName("L")).toBe("Left (Orange)");
	});
});

describe("Edge Cases and Error Handling", () => {
	test("invalid base moves are ignored gracefully", () => {
		const cube1 = createSolvedCube();
		const cube2 = createSolvedCube();

		// Apply invalid move with invalid base
		applyMove(cube1, "X"); // Invalid move

		// Should remain unchanged
		FACES.forEach((face) => {
			expect(Array.from(cube1[face])).toEqual(Array.from(cube2[face]));
		});
	});

	test("empty string moves cause error (expected behavior)", () => {
		const cube = createSolvedCube();

		// Empty string will cause an error due to mv[0] access
		expect(() => applyMove(cube, "")).toThrow();
	});

	test("cube remains valid after many random operations", () => {
		const cube = createSolvedCube();
		const initialHistogram = getColorHistogram(cube);
		const initialCenters = getCenters(cube);

		// Apply 1000 random moves
		for (let i = 0; i < 1000; i++) {
			const base = BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
			const modifier = MOVE_MODIFIERS[Math.floor(Math.random() * MOVE_MODIFIERS.length)];
			applyMove(cube, base + modifier);
		}

		// Cube should still be structurally valid
		expect(getColorHistogram(cube)).toEqual(initialHistogram);
		expect(getCenters(cube)).toEqual(initialCenters);
	});
});

describe("Specific Algorithm Tests", () => {
	test("simple algorithm maintains cube structure", () => {
		const cube = createSolvedCube();
		const algorithm = ["R", "U", "R'", "U'"];

		algorithm.forEach((move) => applyMove(cube, move));

		// Algorithm should maintain color histogram even if not solved
		expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

		// Centers should remain in place
		const solvedCube = createSolvedCube();
		FACES.forEach((face) => {
			expect(cube[face][4]).toBe(solvedCube[face][4]);
		});
	});

	test("complex sequence preserves cube validity", () => {
		const cube = createSolvedCube();
		const sequence = ["R", "U", "R'", "F'", "R", "U", "R'", "U'", "R'", "F"];

		sequence.forEach((move) => applyMove(cube, move));

		// Should maintain structural integrity regardless of solved state
		expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

		// All faces should still have 9 stickers
		FACES.forEach((face) => {
			expect(cube[face].length).toBe(9);
		});
	});

	test("scrambled cube is not solved", () => {
		// Simple test to verify scrambling works
		const cube = createSolvedCube();

		// Apply a simple scramble
		applyMove(cube, "R");
		expect(isCubeSolved(cube)).toBe(false);

		// Apply more moves
		applyMove(cube, "U");
		applyMove(cube, "F");
		expect(isCubeSolved(cube)).toBe(false);

		// But should maintain structure
		expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
	});
});
