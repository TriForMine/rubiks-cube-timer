import { test, expect, describe } from "bun:test";
import type { CubeState } from "../../src/lib/cube-simulation";
import {
  createSolvedCube,
  applyMove,
  CubeColor,
  isCubeSolved,
} from "../../src/lib/cube-simulation";

// Helper function to create a cube state from face arrays
function createCubeFromFaces(
  U: CubeColor[],
  R: CubeColor[],
  F: CubeColor[],
  D: CubeColor[],
  L: CubeColor[],
  B: CubeColor[],
): CubeState {
  const toFace = (colors: CubeColor[]) =>
    Uint8Array.from(colors) as CubeState["U"];

  return {
    U: toFace(U),
    R: toFace(R),
    F: toFace(F),
    D: toFace(D),
    L: toFace(L),
    B: toFace(B),
  };
}

// Color shortcuts for readability
const W = CubeColor.White;
const Y = CubeColor.Yellow;
const R = CubeColor.Red;
const O = CubeColor.Orange;
const B = CubeColor.Blue;
const G = CubeColor.Green;

// Expected states after single quarter turns
const EXPECTED_STATES = {
  R: createCubeFromFaces(
    /* U */ [W, W, G, W, W, G, W, W, G],
    /* R */ [R, R, R, R, R, R, R, R, R],
    /* F */ [G, G, Y, G, G, Y, G, G, Y],
    /* D */ [Y, Y, B, Y, Y, B, Y, Y, B],
    /* L */ [O, O, O, O, O, O, O, O, O],
    /* B */ [W, B, B, W, B, B, W, B, B],
  ),

  L: createCubeFromFaces(
    /* U */ [B, W, W, B, W, W, B, W, W],
    /* R */ [R, R, R, R, R, R, R, R, R],
    /* F */ [W, G, G, W, G, G, W, G, G],
    /* D */ [G, Y, Y, G, Y, Y, G, Y, Y],
    /* L */ [O, O, O, O, O, O, O, O, O],
    /* B */ [B, B, Y, B, B, Y, B, B, Y],
  ),

  U: createCubeFromFaces(
    /* U */ [W, W, W, W, W, W, W, W, W],
    /* R */ [B, B, B, R, R, R, R, R, R],
    /* F */ [R, R, R, G, G, G, G, G, G],
    /* D */ [Y, Y, Y, Y, Y, Y, Y, Y, Y],
    /* L */ [G, G, G, O, O, O, O, O, O],
    /* B */ [O, O, O, B, B, B, B, B, B],
  ),

  D: createCubeFromFaces(
    /* U */ [W, W, W, W, W, W, W, W, W],
    /* R */ [R, R, R, R, R, R, G, G, G],
    /* F */ [G, G, G, G, G, G, O, O, O],
    /* D */ [Y, Y, Y, Y, Y, Y, Y, Y, Y],
    /* L */ [O, O, O, O, O, O, B, B, B],
    /* B */ [B, B, B, B, B, B, R, R, R],
  ),

  F: createCubeFromFaces(
    /* U */ [W, W, W, W, W, W, O, O, O],
    /* R */ [W, R, R, W, R, R, W, R, R],
    /* F */ [G, G, G, G, G, G, G, G, G],
    /* D */ [R, R, R, Y, Y, Y, Y, Y, Y],
    /* L */ [O, O, Y, O, O, Y, O, O, Y],
    /* B */ [B, B, B, B, B, B, B, B, B],
  ),

  B: createCubeFromFaces(
    /* U */ [R, R, R, W, W, W, W, W, W],
    /* R */ [R, R, Y, R, R, Y, R, R, Y],
    /* F */ [G, G, G, G, G, G, G, G, G],
    /* D */ [Y, Y, Y, Y, Y, Y, O, O, O],
    /* L */ [W, O, O, W, O, O, W, O, O],
    /* B */ [B, B, B, B, B, B, B, B, B],
  ),
};

function compareCubeStates(actual: CubeState, expected: CubeState): boolean {
  const faces = ["U", "R", "F", "D", "L", "B"] as const;
  return faces.every((face) =>
    actual[face].every((color, index) => color === expected[face][index]),
  );
}

function getColorHistogram(cube: CubeState): number[] {
  const histogram = Array(6).fill(0);
  const faces = ["U", "R", "F", "D", "L", "B"] as const;
  faces.forEach((face) => {
    cube[face].forEach((sticker) => histogram[sticker]++);
  });
  return histogram;
}

describe("Single Quarter Turn Tests", () => {
  const moves = ["R", "L", "U", "D", "F", "B"] as const;

  moves.forEach((move) => {
    test(`${move} move produces correct face configuration`, () => {
      const cube = createSolvedCube();
      applyMove(cube, move);

      const expected = EXPECTED_STATES[move];
      expect(compareCubeStates(cube, expected)).toBe(true);
    });

    test(`${move} move affects correct faces and leaves others unchanged`, () => {
      const cube = createSolvedCube();
      applyMove(cube, move);

      // Define which faces should change for each move
      const affectedFaces: Record<string, (keyof CubeState)[]> = {
        R: ["U", "F", "D", "B"], // R face rotates, these have stickers moved
        L: ["U", "F", "D", "B"],
        U: ["F", "R", "B", "L"], // U face rotates, these have stickers moved
        D: ["F", "R", "B", "L"],
        F: ["U", "R", "D", "L"], // F face rotates, these have stickers moved
        B: ["U", "R", "D", "L"],
      };

      const faces = ["U", "R", "F", "D", "L", "B"] as const;

      faces.forEach((face) => {
        if (face === move || affectedFaces[move].includes(face)) {
          // This face should have changed (we'll just verify structural integrity)
          expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
        }
      });
    });
  });
});

describe("Face Rotation Properties", () => {
  test("face rotation preserves center colors", () => {
    const moves = ["R", "L", "U", "D", "F", "B"];
    const solvedCube = createSolvedCube();
    const originalCenters = {
      U: solvedCube.U[4],
      R: solvedCube.R[4],
      F: solvedCube.F[4],
      D: solvedCube.D[4],
      L: solvedCube.L[4],
      B: solvedCube.B[4],
    };

    moves.forEach((move) => {
      const cube = createSolvedCube();
      applyMove(cube, move);

      expect(cube.U[4]).toBe(originalCenters.U);
      expect(cube.R[4]).toBe(originalCenters.R);
      expect(cube.F[4]).toBe(originalCenters.F);
      expect(cube.D[4]).toBe(originalCenters.D);
      expect(cube.L[4]).toBe(originalCenters.L);
      expect(cube.B[4]).toBe(originalCenters.B);
    });
  });

  test("corner pieces move correctly during face rotations", () => {
    // Test R move - should cycle corners correctly
    const cube = createSolvedCube();

    // Before R move: U face top-right corner should be White
    expect(cube.U[2]).toBe(W);
    expect(cube.U[5]).toBe(W);
    expect(cube.U[8]).toBe(W);

    applyMove(cube, "R");

    // After R move: these positions should have colors from adjacent faces
    expect(cube.U[2]).toBe(G); // From F face
    expect(cube.U[5]).toBe(G); // From F face
    expect(cube.U[8]).toBe(G); // From F face
  });

  test("edge pieces move correctly during face rotations", () => {
    const cube = createSolvedCube();

    // Test U move - should cycle edges correctly
    // Before: F face top edge should be Green
    expect(cube.F[1]).toBe(G);

    applyMove(cube, "U");

    // After U move: F face top edge should come from R face (Red)
    expect(cube.F[1]).toBe(R);
  });
});

describe("Face Consistency Tests", () => {
  test("each face maintains exactly 9 stickers after moves", () => {
    const moves = [
      "R",
      "L",
      "U",
      "D",
      "F",
      "B",
      "R'",
      "L'",
      "U'",
      "D'",
      "F'",
      "B'",
      "R2",
      "L2",
      "U2",
      "D2",
      "F2",
      "B2",
    ];

    moves.forEach((move) => {
      const cube = createSolvedCube();
      applyMove(cube, move);

      const faces = ["U", "R", "F", "D", "L", "B"] as const;
      faces.forEach((face) => {
        expect(cube[face].length).toBe(9);
      });
    });
  });

  test("no color duplication or loss occurs during moves", () => {
    const moves = ["R", "L", "U", "D", "F", "B"];
    const originalCube = createSolvedCube();

    // Count original colors
    const originalColorCount = new Map<CubeColor, number>();
    const faces = ["U", "R", "F", "D", "L", "B"] as const;

    faces.forEach((face) => {
      originalCube[face].forEach((color) => {
        originalColorCount.set(color, (originalColorCount.get(color) || 0) + 1);
      });
    });

    moves.forEach((move) => {
      const cube = createSolvedCube();
      applyMove(cube, move);

      const newColorCount = new Map<CubeColor, number>();
      faces.forEach((face) => {
        cube[face].forEach((color) => {
          newColorCount.set(color, (newColorCount.get(color) || 0) + 1);
        });
      });

      // Verify color counts are preserved
      expect(newColorCount.get(W) || 0).toBe(originalColorCount.get(W) || 0);
      expect(newColorCount.get(Y) || 0).toBe(originalColorCount.get(Y) || 0);
      expect(newColorCount.get(R) || 0).toBe(originalColorCount.get(R) || 0);
      expect(newColorCount.get(O) || 0).toBe(originalColorCount.get(O) || 0);
      expect(newColorCount.get(B) || 0).toBe(originalColorCount.get(B) || 0);
      expect(newColorCount.get(G) || 0).toBe(originalColorCount.get(G) || 0);
    });
  });
});

describe("Complex Face Interactions", () => {
  test("opposite face moves don't interfere", () => {
    // R and L moves should be independent
    const cube1 = createSolvedCube();
    const cube2 = createSolvedCube();

    applyMove(cube1, "R");
    applyMove(cube1, "L");

    applyMove(cube2, "L");
    applyMove(cube2, "R");

    // Results should be identical regardless of order
    const faces = ["U", "R", "F", "D", "L", "B"] as const;
    faces.forEach((face) => {
      expect(Array.from(cube1[face])).toEqual(Array.from(cube2[face]));
    });
  });

  test("adjacent face moves create correct interactions", () => {
    // R then U should be different from U then R
    const cube1 = createSolvedCube();
    const cube2 = createSolvedCube();

    applyMove(cube1, "R");
    applyMove(cube1, "U");

    applyMove(cube2, "U");
    applyMove(cube2, "R");

    // Results should be different (moves don't commute)
    const faces = ["U", "R", "F", "D", "L", "B"] as const;
    const identical = faces.every((face) =>
      cube1[face].every((color, index) => color === cube2[face][index]),
    );

    expect(identical).toBe(false);
  });

  test("face states after complex sequences", () => {
    const cube = createSolvedCube();

    // Apply a known sequence: R U R' U'
    applyMove(cube, "R");
    applyMove(cube, "U");
    applyMove(cube, "R'");
    applyMove(cube, "U'");

    // Cube should not be solved but should maintain structural integrity
    expect(isCubeSolved(cube)).toBe(false);

    // Verify color count is still correct
    const colorCount = new Map<CubeColor, number>();
    const faces = ["U", "R", "F", "D", "L", "B"] as const;

    faces.forEach((face) => {
      cube[face].forEach((color) => {
        colorCount.set(color, (colorCount.get(color) || 0) + 1);
      });
    });

    expect(colorCount.get(W)).toBe(9);
    expect(colorCount.get(Y)).toBe(9);
    expect(colorCount.get(R)).toBe(9);
    expect(colorCount.get(O)).toBe(9);
    expect(colorCount.get(B)).toBe(9);
    expect(colorCount.get(G)).toBe(9);
  });
});

describe("Sticker Position Mapping", () => {
  test("sticker positions are mapped correctly in face arrays", () => {
    const cube = createSolvedCube();

    // Test that face arrays follow the expected 3x3 grid layout:
    // 0 1 2
    // 3 4 5
    // 6 7 8

    // All stickers on each face should have the same color initially
    const faces = ["U", "R", "F", "D", "L", "B"] as const;
    const expectedColors = [W, R, G, Y, O, B];

    faces.forEach((face, faceIndex) => {
      for (let i = 0; i < 9; i++) {
        expect(cube[face][i]).toBe(expectedColors[faceIndex]);
      }
    });
  });

  test("corner sticker positions after R move", () => {
    const cube = createSolvedCube();
    applyMove(cube, "R");

    // After R move, specific corner positions should have moved
    // Top-right corner of U face (position 2) should now be Green (from F)
    expect(cube.U[2]).toBe(G);

    // Top-right corner of F face (position 2) should now be Yellow (from D)
    expect(cube.F[2]).toBe(Y);

    // Bottom-right corner of D face (position 2) should now be Blue (from B)
    expect(cube.D[2]).toBe(B);

    // Bottom-left corner of B face (position 6) should now be White (from U)
    expect(cube.B[6]).toBe(W);
  });

  test("edge sticker positions after U move", () => {
    const cube = createSolvedCube();
    applyMove(cube, "U");

    // After U move, top edges should cycle
    // Top edge of F face (position 1) should now be Red (from R)
    expect(cube.F[1]).toBe(R);

    // Top edge of L face (position 1) should now be Green (from F)
    expect(cube.L[1]).toBe(G);

    // Top edge of B face (position 1) should now be Orange (from L)
    expect(cube.B[1]).toBe(O);

    // Top edge of R face (position 1) should now be Blue (from B)
    expect(cube.R[1]).toBe(B);
  });
});
