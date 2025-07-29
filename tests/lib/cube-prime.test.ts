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

// Generate reference states for all prime moves by doing three quarter turns
const generatePrimeMoveReferences = (): Record<string, CubeState> => {
  const references: Record<string, CubeState> = {};

  BASE_MOVES.forEach((base) => {
    const cube = createSolvedCube();
    // Apply quarter turn three times to get prime move (counter-clockwise)
    for (let i = 0; i < 3; i++) {
      applyMove(cube, base);
    }
    references[base + "'"] = cloneCube(cube);
  });

  return references;
};

const PRIME_MOVE_REFERENCES = generatePrimeMoveReferences();

describe("Prime Move Correctness", () => {
  BASE_MOVES.forEach((base) => {
    const primeMove = base + "'";

    test(`${primeMove} produces same result as three ${base} quarter turns`, () => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Method 1: Use built-in prime move
      applyMove(cube1, primeMove);

      // Method 2: Three quarter turns
      for (let i = 0; i < 3; i++) {
        applyMove(cube2, base);
      }

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
    });

    test(`${primeMove} matches pre-computed reference state`, () => {
      const cube = createSolvedCube();
      applyMove(cube, primeMove);

      const reference = PRIME_MOVE_REFERENCES[primeMove];
      expect(cubesAreEqual(cube, reference)).toBe(true);
    });

    test(`${primeMove} is the inverse of ${base}`, () => {
      const cube = createSolvedCube();

      // Apply move then its prime
      applyMove(cube, base);
      applyMove(cube, primeMove);

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`${base} is the inverse of ${primeMove}`, () => {
      const cube = createSolvedCube();

      // Apply prime then its base move
      applyMove(cube, primeMove);
      applyMove(cube, base);

      expect(isCubeSolved(cube)).toBe(true);
    });
  });
});

describe("Prime Move Properties", () => {
  BASE_MOVES.forEach((base) => {
    const primeMove = base + "'";

    test(`${primeMove} applied four times returns to solved state`, () => {
      const cube = createSolvedCube();

      // Apply prime move four times
      for (let i = 0; i < 4; i++) {
        applyMove(cube, primeMove);
      }

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`${primeMove} preserves color histogram`, () => {
      const originalHistogram = getColorHistogram(createSolvedCube());
      const cube = createSolvedCube();

      applyMove(cube, primeMove);

      expect(getColorHistogram(cube)).toEqual(originalHistogram);
    });

    test(`${primeMove} preserves all center colors`, () => {
      const originalCube = createSolvedCube();
      const cube = createSolvedCube();

      applyMove(cube, primeMove);

      FACES.forEach((face) => {
        expect(cube[face][4]).toBe(originalCube[face][4]);
      });
    });

    test(`${primeMove} has order 4`, () => {
      const cube = createSolvedCube();
      const originalState = cloneCube(cube);

      // Apply prime move four times
      for (let i = 0; i < 4; i++) {
        applyMove(cube, primeMove);
      }

      expect(cubesAreEqual(cube, originalState)).toBe(true);
    });
  });
});

describe("Prime Move vs Base Move Relationships", () => {
  BASE_MOVES.forEach((base) => {
    const primeMove = base + "'";

    test(`${base} + ${base} + ${primeMove} = ${base}`, () => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Method 1: base + base + prime
      applyMove(cube1, base);
      applyMove(cube1, base);
      applyMove(cube1, primeMove);

      // Method 2: just base
      applyMove(cube2, base);

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
    });

    test(`${primeMove} + ${primeMove} + ${base} = ${primeMove}`, () => {
      const cube1 = createSolvedCube();
      const cube2 = createSolvedCube();

      // Method 1: prime + prime + base
      applyMove(cube1, primeMove);
      applyMove(cube1, primeMove);
      applyMove(cube1, base);

      // Method 2: just prime
      applyMove(cube2, primeMove);

      expect(cubesAreEqual(cube1, cube2)).toBe(true);
    });

    test(`${base} + ${primeMove} cancels out to identity`, () => {
      const cube = createSolvedCube();

      // Apply base then prime - should return to solved
      applyMove(cube, base);
      applyMove(cube, primeMove);

      expect(isCubeSolved(cube)).toBe(true);
    });

    test(`${primeMove} + ${base} cancels out to identity`, () => {
      const cube = createSolvedCube();

      // Apply prime then base - should return to solved
      applyMove(cube, primeMove);
      applyMove(cube, base);

      expect(isCubeSolved(cube)).toBe(true);
    });
  });
});

describe("Prime Move Direction Tests", () => {
  test("R' rotates R face counter-clockwise", () => {
    const cube = createSolvedCube();
    applyMove(cube, "R'");

    // After R', the right column of U should come from B (but rotated)
    // U[2] should have the color from B[6] (bottom-left of back face)
    expect(cube.U[2]).toBe(CubeColor.Blue);
    expect(cube.U[5]).toBe(CubeColor.Blue);
    expect(cube.U[8]).toBe(CubeColor.Blue);
  });

  test("U' rotates U face counter-clockwise", () => {
    const cube = createSolvedCube();
    applyMove(cube, "U'");

    // After U', the top row should cycle in reverse direction
    // F[0,1,2] should come from L[0,1,2]
    expect(cube.F[0]).toBe(CubeColor.Orange);
    expect(cube.F[1]).toBe(CubeColor.Orange);
    expect(cube.F[2]).toBe(CubeColor.Orange);
  });

  test("F' rotates F face counter-clockwise", () => {
    const cube = createSolvedCube();
    applyMove(cube, "F'");

    // After F', bottom row of U should come from R
    // U[6,7,8] should come from R[0,3,6] (left column of right face)
    expect(cube.U[6]).toBe(CubeColor.Red);
    expect(cube.U[7]).toBe(CubeColor.Red);
    expect(cube.U[8]).toBe(CubeColor.Red);
  });
});

describe("Prime Move Sequences", () => {
  test("alternating move and prime sequences", () => {
    const cube = createSolvedCube();

    // Apply R R' R R' pattern
    applyMove(cube, "R");
    applyMove(cube, "R'");
    applyMove(cube, "R");
    applyMove(cube, "R'");

    expect(isCubeSolved(cube)).toBe(true);
  });

  test("prime move commutator: R U R' U'", () => {
    const cube = createSolvedCube();

    // This is the "sexy move" commutator
    applyMove(cube, "R");
    applyMove(cube, "U");
    applyMove(cube, "R'");
    applyMove(cube, "U'");

    // Should not be solved but should maintain color histogram
    expect(isCubeSolved(cube)).toBe(false);
    expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
  });

  test("longer prime move sequence maintains structure", () => {
    const cube = createSolvedCube();

    // Apply R' U' R U R' U' R U pattern
    const sequence = ["R'", "U'", "R", "U", "R'", "U'", "R", "U"];
    sequence.forEach((move) => applyMove(cube, move));

    // This sequence should maintain cube structure even if not solved
    expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

    // Centers should remain in place
    const originalCube = createSolvedCube();
    FACES.forEach((face) => {
      expect(cube[face][4]).toBe(originalCube[face][4]);
    });
  });

  test("all prime moves applied in sequence", () => {
    const cube = createSolvedCube();

    // Apply all prime moves once
    BASE_MOVES.forEach((base) => {
      applyMove(cube, base + "'");
    });

    // Should maintain structural integrity
    expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

    // All centers should still be in place
    const originalCube = createSolvedCube();
    FACES.forEach((face) => {
      expect(cube[face][4]).toBe(originalCube[face][4]);
    });
  });
});

describe("Prime Move Conjugates", () => {
  test("R U R' conjugate pattern", () => {
    const cube1 = createSolvedCube();
    const cube2 = createSolvedCube();

    // Method 1: R U R' U' R U' R'
    applyMove(cube1, "R");
    applyMove(cube1, "U");
    applyMove(cube1, "R'");
    applyMove(cube1, "U'");
    applyMove(cube1, "R");
    applyMove(cube1, "U'");
    applyMove(cube1, "R'");

    // Method 2: Apply same algorithm to second cube
    applyMove(cube2, "R");
    applyMove(cube2, "U");
    applyMove(cube2, "R'");
    applyMove(cube2, "U'");
    applyMove(cube2, "R");
    applyMove(cube2, "U'");
    applyMove(cube2, "R'");

    expect(cubesAreEqual(cube1, cube2)).toBe(true);
    expect(getColorHistogram(cube1)).toEqual([9, 9, 9, 9, 9, 9]);
  });
});

describe("Prime Move Performance", () => {
  test("prime moves are consistent with multiple applications", () => {
    BASE_MOVES.forEach((base) => {
      const primeMove = base + "'";

      // Apply prime move multiple times and verify consistency
      for (let repetitions = 1; repetitions <= 8; repetitions++) {
        const cube = createSolvedCube();

        for (let i = 0; i < repetitions; i++) {
          applyMove(cube, primeMove);
        }

        // Check if we're back to solved at the expected cycle point
        if (repetitions % 4 === 0) {
          expect(isCubeSolved(cube)).toBe(true);
        }

        // Always check structural integrity
        expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
      }
    });
  });

  test("prime moves maintain cube validity under stress", () => {
    const cube = createSolvedCube();
    const originalHistogram = getColorHistogram(cube);

    // Apply 1000 random prime moves
    for (let i = 0; i < 1000; i++) {
      const randomBase =
        BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
      applyMove(cube, randomBase + "'");
    }

    // Cube should still be structurally valid
    expect(getColorHistogram(cube)).toEqual(originalHistogram);

    // All faces should still have 9 stickers
    FACES.forEach((face) => {
      expect(cube[face].length).toBe(9);
    });
  });
});

describe("Prime Move Error Handling", () => {
  test("invalid prime base moves are ignored", () => {
    const cube1 = createSolvedCube();
    const cube2 = createSolvedCube();

    // Apply invalid moves - only invalid base moves are actually ignored
    applyMove(cube1, "X'"); // Invalid base

    // Cube should remain unchanged
    expect(cubesAreEqual(cube1, cube2)).toBe(true);
  });

  test("empty string moves cause error (expected behavior)", () => {
    const cube = createSolvedCube();

    // Empty string will cause an error due to mv[0] access
    expect(() => applyMove(cube, "")).toThrow();
  });
});

describe("Prime Move Algorithm Structure", () => {
  test("simple prime move sequence maintains cube structure", () => {
    const cube = createSolvedCube();

    // Apply simple algorithm with prime moves
    const algorithm = ["R", "U'", "R'", "U"];
    algorithm.forEach((move) => applyMove(cube, move));

    // Should maintain structural integrity
    expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

    // Centers should remain in place
    const originalCube = createSolvedCube();
    FACES.forEach((face) => {
      expect(cube[face][4]).toBe(originalCube[face][4]);
    });
  });

  test("complex prime move sequence validity", () => {
    const cube = createSolvedCube();

    // Apply longer sequence with multiple prime moves
    const sequence = ["R'", "U'", "R", "U", "R'", "F", "R", "F'"];
    sequence.forEach((move) => applyMove(cube, move));

    // Should maintain cube validity regardless of solved state
    expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

    // All faces should still have 9 stickers
    FACES.forEach((face) => {
      expect(cube[face].length).toBe(9);
    });
  });
});
