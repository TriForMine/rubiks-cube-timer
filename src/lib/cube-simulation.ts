/**
 * Fast & correct 3×3×3 Rubik’s Cube simulator (v16 - Final)
 * – All moves validated against official WCA/Singmaster orientation.
 * – Tailwind‑aware colour helpers (`getBgClass`) for light/dark themes.
 */

// --------------------------- MODEL ----------------------------------
export enum CubeColor {
	White,
	Yellow,
	Red,
	Orange,
	Blue,
	Green,
}

type Face = Uint8Array & { length: 9 };

export interface CubeState {
	U: Face;
	D: Face;
	F: Face;
	B: Face;
	R: Face;
	L: Face;
}

const makeFace = (c: CubeColor): Face => Uint8Array.from({ length: 9 }, () => c) as Face;

export const createSolvedCube = (): CubeState => ({
	U: makeFace(CubeColor.White),
	D: makeFace(CubeColor.Yellow),
	F: makeFace(CubeColor.Green),
	B: makeFace(CubeColor.Blue),
	R: makeFace(CubeColor.Red),
	L: makeFace(CubeColor.Orange),
});

// ----------------------- MOVE ENGINE (v16 - Corrected) --------------------------

const rotateFace = (face: Face, clockwise: boolean) => {
	const f = face.slice();
	if (clockwise) {
		face[0] = f[6];
		face[1] = f[3];
		face[2] = f[0];
		face[3] = f[7];
		face[4] = f[4];
		face[5] = f[1];
		face[6] = f[8];
		face[7] = f[5];
		face[8] = f[2];
	} else {
		face[0] = f[2];
		face[1] = f[5];
		face[2] = f[8];
		face[3] = f[1];
		face[4] = f[4];
		face[5] = f[7];
		face[6] = f[0];
		face[7] = f[3];
		face[8] = f[6];
	}
};

const MOVES: Record<string, (cube: CubeState, clockwise: boolean) => void> = {
	U: (cube, clockwise) => {
		rotateFace(cube.U, clockwise);
		const s = {
			F: cube.F.slice(),
			R: cube.R.slice(),
			B: cube.B.slice(),
			L: cube.L.slice(),
		};
		const row = [0, 1, 2];
		if (clockwise) {
			for (const i of row) {
				cube.F[i] = s.R[i];
				cube.R[i] = s.B[i];
				cube.B[i] = s.L[i];
				cube.L[i] = s.F[i];
			}
		} else {
			for (const i of row) {
				cube.F[i] = s.L[i];
				cube.L[i] = s.B[i];
				cube.B[i] = s.R[i];
				cube.R[i] = s.F[i];
			}
		}
	},
	D: (cube, clockwise) => {
		rotateFace(cube.D, clockwise);
		const s = {
			F: cube.F.slice(),
			R: cube.R.slice(),
			B: cube.B.slice(),
			L: cube.L.slice(),
		};
		const row = [6, 7, 8];
		if (clockwise) {
			for (const i of row) {
				cube.F[i] = s.L[i];
				cube.L[i] = s.B[i];
				cube.B[i] = s.R[i];
				cube.R[i] = s.F[i];
			}
		} else {
			for (const i of row) {
				cube.F[i] = s.R[i];
				cube.R[i] = s.B[i];
				cube.B[i] = s.L[i];
				cube.L[i] = s.F[i];
			}
		}
	},
	R: (cube, clockwise) => {
		rotateFace(cube.R, clockwise);
		const s = {
			U: cube.U.slice(),
			B: cube.B.slice(),
			D: cube.D.slice(),
			F: cube.F.slice(),
		};
		const col = [2, 5, 8];
		const b_col = [6, 3, 0];
		if (clockwise) {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[col[i]];
				cube.U[col[i]] = s.F[col[i]];
				cube.F[col[i]] = s.D[col[i]];
				cube.D[col[i]] = s.B[b_col[i]];
				cube.B[b_col[i]] = temp;
			}
		} else {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[col[i]];
				cube.U[col[i]] = s.B[b_col[i]];
				cube.B[b_col[i]] = s.D[col[i]];
				cube.D[col[i]] = s.F[col[i]];
				cube.F[col[i]] = temp;
			}
		}
	},
	L: (cube, clockwise) => {
		rotateFace(cube.L, clockwise);
		const s = {
			U: cube.U.slice(),
			B: cube.B.slice(),
			D: cube.D.slice(),
			F: cube.F.slice(),
		};
		const col = [0, 3, 6];
		const b_col = [8, 5, 2];
		if (clockwise) {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[col[i]];
				cube.U[col[i]] = s.B[b_col[i]];
				cube.B[b_col[i]] = s.D[col[i]];
				cube.D[col[i]] = s.F[col[i]];
				cube.F[col[i]] = temp;
			}
		} else {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[col[i]];
				cube.U[col[i]] = s.F[col[i]];
				cube.F[col[i]] = s.D[col[i]];
				cube.D[col[i]] = s.B[b_col[i]];
				cube.B[b_col[i]] = temp;
			}
		}
	},
	F: (cube, clockwise) => {
		rotateFace(cube.F, clockwise);
		const s = {
			U: cube.U.slice(),
			R: cube.R.slice(),
			D: cube.D.slice(),
			L: cube.L.slice(),
		};
		const u_row = [6, 7, 8];
		const r_col = [0, 3, 6];
		const d_row = [2, 1, 0];
		const l_col = [8, 5, 2];
		if (clockwise) {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[u_row[i]];
				cube.U[u_row[i]] = s.L[l_col[i]];
				cube.L[l_col[i]] = s.D[d_row[i]];
				cube.D[d_row[i]] = s.R[r_col[i]];
				cube.R[r_col[i]] = temp;
			}
		} else {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[u_row[i]];
				cube.U[u_row[i]] = s.R[r_col[i]];
				cube.R[r_col[i]] = s.D[d_row[i]];
				cube.D[d_row[i]] = s.L[l_col[i]];
				cube.L[l_col[i]] = temp;
			}
		}
	},
	B: (cube, clockwise) => {
		rotateFace(cube.B, clockwise);
		const s = {
			U: cube.U.slice(),
			R: cube.R.slice(),
			D: cube.D.slice(),
			L: cube.L.slice(),
		};
		const u_row = [0, 1, 2];
		const r_col = [2, 5, 8];
		const d_row = [8, 7, 6];
		const l_col = [6, 3, 0];
		if (clockwise) {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[u_row[i]];
				cube.U[u_row[i]] = s.R[r_col[i]];
				cube.R[r_col[i]] = s.D[d_row[i]];
				cube.D[d_row[i]] = s.L[l_col[i]];
				cube.L[l_col[i]] = temp;
			}
		} else {
			for (let i = 0; i < 3; i++) {
				const temp = s.U[u_row[i]];
				cube.U[u_row[i]] = s.L[l_col[i]];
				cube.L[l_col[i]] = s.D[d_row[i]];
				cube.D[d_row[i]] = s.R[r_col[i]];
				cube.R[r_col[i]] = temp;
			}
		}
	},
};

export const applyMove = (cube: CubeState, mv: string): CubeState => {
	const base = mv[0].toUpperCase();
	const moveFn = MOVES[base];
	if (!moveFn) return cube;

	const mod = mv.length > 1 ? mv[1] : "";
	if (mod === "'") {
		moveFn(cube, false);
	} else if (mod === "2") {
		moveFn(cube, true);
		moveFn(cube, true);
	} else {
		moveFn(cube, true);
	}
	return cube;
};

export const applyScramble = (scramble: string): CubeState => {
	const cube = createSolvedCube();
	for (const mv of scramble.trim().split(/\s+/)) {
		if (mv) applyMove(cube, mv);
	}
	return cube;
};

export const isCubeSolved = (cube: CubeState): boolean => {
	const solved = createSolvedCube();
	return ["U", "D", "F", "B", "R", "L"].every((f) =>
		cube[f as keyof CubeState].every((c, i) => c === solved[f as keyof CubeState][i])
	);
};

// ----------------------- UI HELPERS ---------------------------------
export const displayHex = {
	[CubeColor.White]: "#FFFFFF",
	[CubeColor.Yellow]: "#FFD700",
	[CubeColor.Red]: "#EF4444", // Tailwind red‑500
	[CubeColor.Orange]: "#F97316", // orange‑500
	[CubeColor.Blue]: "#2563EB", // blue‑600
	[CubeColor.Green]: "#16A34A", // green‑600
} as const;

export const getDisplayHex = (c: CubeColor) => displayHex[c];

export const bgClass = {
	[CubeColor.White]: "bg-white dark:bg-zinc-200",
	[CubeColor.Yellow]: "bg-yellow-400 dark:bg-yellow-300",
	[CubeColor.Red]: "bg-red-500 dark:bg-red-400",
	[CubeColor.Orange]: "bg-orange-500 dark:bg-orange-400",
	[CubeColor.Blue]: "bg-blue-600 dark:bg-blue-500",
	[CubeColor.Green]: "bg-green-600 dark:bg-green-500",
} as const;

export const getBgClass = (c: CubeColor): string => bgClass[c];

export const getFaceName = (f: keyof CubeState): string =>
	({
		U: "Up (White)",
		D: "Down (Yellow)",
		F: "Front (Green)",
		B: "Back (Blue)",
		R: "Right (Red)",
		L: "Left (Orange)",
	})[f];
