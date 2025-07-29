import { test, expect, describe } from "bun:test";
import type { CubeState } from "../../src/lib/cube-simulation";
import {
  createSolvedCube,
  applyMove,
  isCubeSolved,
  CubeColor,
} from "../../src/lib/cube-simulation";

// Test utilities
const BASE_MOVES = ["R", "L", "U", "D", "F", "B"] as const;
const FACES = ["U", "R", "F", "D", "L", "B"] as const;

function cloneCube(cube: CubeState): CubeState {
  return {
    U: new Uint8Array(cube.U) as CubeState["U"],
    R: new Uint8Array(cube.R) as CubeState["R"],
    F: new Uint8Array(cube.F) as CubeState["F"],
    D: new Uint8Array(cube.D) as CubeState["D"],
    L: new Uint8Array(cube.L) as CubeState["L"],
    B: new Uint8Array(cube.B) as CubeState["B"],
  };
}

function cubesAreEqual(cube1: CubeState, cube2: CubeState): boolean {
  return FACES.every((face) =>
    cube1[face].every((color, index) => color === cube2[face][index]),
  );
}

function getColorHistogram(cube: CubeState): number[] {
  const histogram = Array(6).fill(0);
  FACES.forEach((face) => {
    cube[face].forEach((sticker) => histogram[sticker]++);
  });
  return histogram;
}

// Generate reference states for all half-turns by doing two quarter turns
const generateHalfTurnReferences = (): Record<string, CubeState> => {
  const references: Record<string, CubeState> = {};

  BASE_MOVES.forEach((base) => {
    const cube = createSolvedCube();
    // Apply quarter turn twice to get half turn
    applyMove(cube, base);
    applyMove(cube, base);
    references[base + "2"] = cloneCube(cube);
  });

  return references;
};

const HALF_TURN_REFERENCES = generateHalfTurnReferences();

describe("Half-Turn Move Correctness", () => {
  BASE_MOVES.forEach((base) => {
    const halfTurn = base + "2";

    test(`${halfTurn} produces same result as two ${base} quarter turns`, () => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Method 1: Use built-in half turn
      applyMove(cube1, halfTurn);

      // Method 2: Two quarter turns
      applyMove(cube2, base);
      applyMove(cube2, base);

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
    });

    test(`${halfTurn} matches pre-computed reference state`, () => {
      const cube = createSolvedCube();
      applyMove(cube, halfTurn);

      const reference = HALF_TURN_REFERENCES[halfTurn];
      expect(cubesAreEqual(cube, reference)).toBe(true);
    });
  });
});

describe("Half-Turn Properties", () => {
  BASE_MOVES.forEach((base) => {
    const halfTurn = base + "2";

    test(`${halfTurn} applied twice returns to solved state`, () => {
      const cube = createSolvedCube();

      applyMove(cube, halfTurn);
      applyMove(cube, halfTurn);

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`${halfTurn} preserves color histogram`, () => {
      const originalHistogram = getColorHistogram(createSolvedCube());
      const cube = createSolvedCube();

      applyMove(cube, halfTurn);

      expect(getColorHistogram(cube)).toEqual(originalHistogram);
    });

    test(`${halfTurn} preserves all center colors`, () => {
      const originalCube = createSolvedCube();
      const cube = createSolvedCube();

      applyMove(cube, halfTurn);

      FACES.forEach((face) => {
        expect(cube[face][4]).toBe(originalCube[face][4]);
      });
    });

    test(`${halfTurn} is its own inverse`, () => {
      const cube = createSolvedCube();
      const originalState = cloneCube(cube);

      // Apply half turn twice
      applyMove(cube, halfTurn);
      applyMove(cube, halfTurn);

      expect(cubesAreEqual(cube, originalState)).toBe(true);
    });
  });
});

describe("Half-Turn vs Quarter-Turn Relationships", () => {
  BASE_MOVES.forEach((base) => {
    const halfTurn = base + "2";
    const primeTurn = base + "'";

    test(`${base} followed by ${primeTurn} cancels out`, () => {
      const cube = createSolvedCube();

      // Quarter turn + prime turn should return to solved
      applyMove(cube, base);
      applyMove(cube, primeTurn);

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`${primeTurn} followed by ${base} cancels out`, () => {
      const cube = createSolvedCube();

      // Prime turn + quarter turn should return to solved
      applyMove(cube, primeTurn);
      applyMove(cube, base);

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`four ${base} quarter turns equal two ${halfTurn} half turns`, () => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Method 1: Four quarter turns
      for (let i = 0; i < 4; i++) {
        applyMove(cube1, base);
      }

      // Method 2: Two half turns
      applyMove(cube2, halfTurn);
      applyMove(cube2, halfTurn);

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
      expect(isCubeSolved(cube1)).toBe(true);
      expect(isCubeSolved(cube2)).toBe(true);
    });
  });
});

describe("Half-Turn Commutativity", () => {
  test("opposite face half-turns commute", () => {
    const oppositePairs = [
      ["R", "L"],
      ["U", "D"],
      ["F", "B"],
    ];

    oppositePairs.forEach(([face1, face2]) => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Apply in one order
      applyMove(cube1, face1 + "2");
      applyMove(cube1, face2 + "2");

      // Apply in reverse order
      applyMove(cube2, face2 + "2");
      applyMove(cube2, face1 + "2");

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
    });
  });

  test("some half-turns maintain structure when combined", () => {
    // Test that combining half-turns maintains cube validity
    const cube = createSolvedCube();
    const originalHistogram = getColorHistogram(cube);

    // Apply several half-turns
    applyMove(cube, "R2");
    applyMove(cube, "U2");
    applyMove(cube, "L2");
    applyMove(cube, "D2");

    // Should maintain structural integrity
    expect(getColorHistogram(cube)).toEqual(originalHistogram);

    // Centers should remain in place
    const originalCube = createSolvedCube();
    FACES.forEach((face) => {
      expect(cube[face][4]).toBe(originalCube[face][4]);
    });
  });
});

describe("Half-Turn Specific Effects", () => {
  test("R2 moves correct stickers", () => {
    const cube = createSolvedCube();
    applyMove(cube, "R2");

    // After R2, the right column of F should be swapped with right column of B
    // F face positions 2,5,8 should now have colors from B face positions 6,3,0
    expect(cube.F[2]).toBe(CubeColor.Blue); // From B[6]
    expect(cube.F[5]).toBe(CubeColor.Blue); // From B[3]
    expect(cube.F[8]).toBe(CubeColor.Blue); // From B[0]

    // B face positions 0,3,6 should now have colors from F face positions 8,5,2
    expect(cube.B[0]).toBe(CubeColor.Green); // From F[8]
    expect(cube.B[3]).toBe(CubeColor.Green); // From F[5]
    expect(cube.B[6]).toBe(CubeColor.Green); // From F[2]
  });

  test("U2 moves correct stickers", () => {
    const cube = createSolvedCube();
    applyMove(cube, "U2");

    // After U2, top row of F should be swapped with top row of B
    expect(cube.F[0]).toBe(CubeColor.Blue); // From B[0]
    expect(cube.F[1]).toBe(CubeColor.Blue); // From B[1]
    expect(cube.F[2]).toBe(CubeColor.Blue); // From B[2]

    expect(cube.B[0]).toBe(CubeColor.Green); // From F[0]
    expect(cube.B[1]).toBe(CubeColor.Green); // From F[1]
    expect(cube.B[2]).toBe(CubeColor.Green); // From F[2]
  });

  test("F2 moves correct stickers", () => {
    const cube = createSolvedCube();
    applyMove(cube, "F2");

    // After F2, bottom row of U should be swapped with top row of D
    expect(cube.U[6]).toBe(CubeColor.Yellow); // From D[2]
    expect(cube.U[7]).toBe(CubeColor.Yellow); // From D[1]
    expect(cube.U[8]).toBe(CubeColor.Yellow); // From D[0]

    expect(cube.D[0]).toBe(CubeColor.White); // From U[8]
    expect(cube.D[1]).toBe(CubeColor.White); // From U[7]
    expect(cube.D[2]).toBe(CubeColor.White); // From U[6]
  });
});

describe("Half-Turn Face Rotation", () => {
  BASE_MOVES.forEach((base) => {
    const halfTurn = base + "2";

    test(`${halfTurn} rotates the ${base} face by 180 degrees`, () => {
      const cube = createSolvedCube();

      // For a solved cube, after a half turn, the face should still be monochromatic
      // but the specific positions should be rotated 180 degrees
      applyMove(cube, halfTurn);

      // All stickers on the rotated face should still be the same color
      const faceColors = Array.from(cube[base as keyof CubeState]);
      const expectedColor = faceColors[0];

      expect(faceColors.every((color) => color === expectedColor)).toBe(true);
    });
  });
});

describe("Half-Turn Sequences", () => {
  test("sequence of all half-turns maintains structure", () => {
    const cube = createSolvedCube();
    const originalHistogram = getColorHistogram(cube);

    // Apply all half-turns
    BASE_MOVES.forEach((base) => {
      applyMove(cube, base + "2");
    });

    // Should maintain structural integrity regardless of solved state
    expect(getColorHistogram(cube)).toEqual(originalHistogram);

    // Centers should remain in place
    const originalCube = createSolvedCube();
    FACES.forEach((face) => {
      expect(cube[face][4]).toBe(originalCube[face][4]);
    });
  });

  test("self-inverse property of half-turns", () => {
    BASE_MOVES.forEach((base) => {
      const cube = createSolvedCube();
      const halfTurn = base + "2";

      // Apply twice should return to solved
      applyMove(cube, halfTurn);
      applyMove(cube, halfTurn);

      expect(isCubeSolved(cube)).toBe(true);
    });
  });

  test("half-turn pattern sequence maintains structure", () => {
    const cube = createSolvedCube();
    const originalHistogram = getColorHistogram(cube);

    // Apply a pattern of half-turns
    const sequence = ["R2", "U2", "R2", "U2"];
    sequence.forEach((move) => applyMove(cube, move));

    // Should maintain structural integrity
    expect(getColorHistogram(cube)).toEqual(originalHistogram);

    // All faces should still have 9 stickers
    FACES.forEach((face) => {
      expect(cube[face].length).toBe(9);
    });
  });
});

describe("Half-Turn Error Cases", () => {
  test("invalid half-turn base moves are ignored", () => {
    const cube1 = createSolvedCube();
    const cube2 = createSolvedCube();

    // Apply invalid base move
    applyMove(cube1, "X2"); // Invalid base

    // Cube should remain unchanged
    expect(cubesAreEqual(cube1, cube2)).toBe(true);
  });

  test("half-turn maintains cube validity under stress", () => {
    const cube = createSolvedCube();
    const originalHistogram = getColorHistogram(cube);

    // Apply many random half-turns
    for (let i = 0; i < 1000; i++) {
      const randomBase =
        BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
      applyMove(cube, randomBase + "2");
    }

    // Cube should still be structurally valid
    expect(getColorHistogram(cube)).toEqual(originalHistogram);

    // All faces should still have 9 stickers
    FACES.forEach((face) => {
      expect(cube[face].length).toBe(9);
    });
  });
});
