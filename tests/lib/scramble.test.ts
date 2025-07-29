import { test, expect, describe } from "bun:test";
import {
  generateScramble,
  parseScramble,
  validateScramble,
  formatScramble,
  generateCompetitionScramble,
  generatePracticeScramble,
  generateLongScramble,
  generateAlgorithmPractice,
  ALGORITHM_PATTERNS,
} from "../../src/lib/scramble";
import {
  createSolvedCube,
  applyScramble,
  isCubeSolved,
  CubeColor,
} from "../../src/lib/cube-simulation";

// Test utilities
const VALID_MOVES = [
  "R",
  "R'",
  "R2",
  "L",
  "L'",
  "L2",
  "U",
  "U'",
  "U2",
  "D",
  "D'",
  "D2",
  "F",
  "F'",
  "F2",
  "B",
  "B'",
  "B2",
];

const FACE_AXES = {
  RL: ["R", "L"],
  UD: ["U", "D"],
  FB: ["F", "B"],
};

function getFaceFromMove(move: string): string {
  return move.charAt(0);
}

function getAxisForFace(face: string): string {
  for (const [axis, faces] of Object.entries(FACE_AXES)) {
    if (faces.includes(face)) {
      return axis;
    }
  }
  return "";
}

function getColorHistogram(cube: {
  [K in "U" | "R" | "F" | "D" | "L" | "B"]: Uint8Array;
}): number[] {
  const histogram = Array(6).fill(0);
  const faces = ["U", "R", "F", "D", "L", "B"] as const;
  faces.forEach((face) => {
    cube[face].forEach((sticker: number) => histogram[sticker]++);
  });
  return histogram;
}

describe("Basic Scramble Generation", () => {
  test("generateScramble creates scramble of correct default length", () => {
    const scramble = generateScramble();
    const moves = scramble.split(" ");

    expect(moves.length).toBe(20); // Default length
    expect(scramble.trim().length).toBeGreaterThan(0);
  });

  test("generateScramble respects custom length parameter", () => {
    const lengths = [5, 10, 15, 25, 30];

    lengths.forEach((length) => {
      const scramble = generateScramble(length);
      const moves = scramble.split(" ");

      expect(moves.length).toBe(length);
    });
  });

  test("generateScramble creates valid WCA moves only", () => {
    const scramble = generateScramble(30);
    const moves = scramble.split(" ");

    moves.forEach((move) => {
      expect(VALID_MOVES.includes(move)).toBe(true);
    });
  });

  test("generateScramble creates different scrambles each time", () => {
    const scrambles = new Set();

    // Generate 100 scrambles and check they're mostly unique
    for (let i = 0; i < 100; i++) {
      scrambles.add(generateScramble(20));
    }

    // Should have high uniqueness (at least 95% unique)
    expect(scrambles.size).toBeGreaterThan(95);
  });

  test("generateScramble handles edge case lengths", () => {
    expect(generateScramble(0)).toBe("");
    expect(generateScramble(1).split(" ").length).toBe(1);
    expect(generateScramble(2).split(" ").length).toBe(2);
  });
});

describe("WCA Scramble Validation Rules", () => {
  test("no consecutive moves on same face", () => {
    // Test multiple times due to randomness
    for (let trial = 0; trial < 50; trial++) {
      const scramble = generateScramble(25);
      const moves = scramble.split(" ");

      for (let i = 1; i < moves.length; i++) {
        const currentFace = getFaceFromMove(moves[i]);
        const previousFace = getFaceFromMove(moves[i - 1]);

        expect(currentFace).not.toBe(previousFace);
      }
    }
  });

  test("no three consecutive moves on same axis", () => {
    for (let trial = 0; trial < 50; trial++) {
      const scramble = generateScramble(25);
      const moves = scramble.split(" ");

      for (let i = 2; i < moves.length; i++) {
        const currentAxis = getAxisForFace(getFaceFromMove(moves[i]));
        const previousAxis = getAxisForFace(getFaceFromMove(moves[i - 1]));
        const beforePreviousAxis = getAxisForFace(
          getFaceFromMove(moves[i - 2]),
        );

        // If previous two moves were on same axis, current shouldn't be
        if (previousAxis === beforePreviousAxis) {
          expect(currentAxis).not.toBe(previousAxis);
        }
      }
    }
  });

  test("scramble follows WCA regulations consistently", () => {
    for (let trial = 0; trial < 20; trial++) {
      const scramble = generateScramble(20);
      expect(validateScramble(scramble)).toBe(true);
    }
  });
});

describe("Scramble Parsing", () => {
  test("parseScramble handles basic scramble string", () => {
    const scrambleString = "R U R' U' R' F R2 U' R'";
    const moves = parseScramble(scrambleString);

    expect(moves).toEqual(["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'"]);
  });

  test("parseScramble handles extra whitespace", () => {
    const scrambleString = "  R   U   R'  U'   R'   F   R2   U'   R'  ";
    const moves = parseScramble(scrambleString);

    expect(moves).toEqual(["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'"]);
  });

  test("parseScramble handles different whitespace characters", () => {
    const scrambleString = "R\tU\nR'\rU'\vR'\fF\nR2\tU'\rR'";
    const moves = parseScramble(scrambleString);

    expect(moves).toEqual(["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'"]);
  });

  test("parseScramble handles empty and whitespace-only strings", () => {
    expect(parseScramble("")).toEqual([]);
    expect(parseScramble("   ")).toEqual([]);
    expect(parseScramble("\t\n\r ")).toEqual([]);
  });

  test("parseScramble filters out empty elements", () => {
    const scrambleString = "R  U   R'    U'";
    const moves = parseScramble(scrambleString);

    expect(moves).toEqual(["R", "U", "R'", "U'"]);
    expect(moves.includes("")).toBe(false);
  });
});

describe("Scramble Validation", () => {
  test("validateScramble accepts valid WCA scrambles", () => {
    const validScrambles = [
      "R U R' U' R' F R2 U' R'",
      "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      "L' U' L U L' U2 L",
      "R2 D2 F2 U2 R2 U2 F2 D2 R2",
      "U R2 F B R B2 R U2 L B2 U' D' R2 F2 B D2 L2 F2",
    ];

    validScrambles.forEach((scramble) => {
      expect(validateScramble(scramble)).toBe(true);
    });
  });

  test("validateScramble rejects scrambles with invalid moves", () => {
    const invalidScrambles = [
      "R U X U' R'", // X is not valid
      "R U r U' R'", // lowercase r is not valid
      "R U R3 U' R'", // R3 is not valid
      "R U M U' R'", // M is not valid (middle layer)
      "R U R'' U' R'", // R'' is not valid
    ];

    invalidScrambles.forEach((scramble) => {
      expect(validateScramble(scramble)).toBe(false);
    });
  });

  test("validateScramble rejects scrambles with consecutive same face moves", () => {
    const invalidScrambles = [
      "R R U R' U'", // Consecutive R moves
      "R U U R' U'", // Consecutive U moves
      "R U R' R U'", // Consecutive R moves (one prime)
      "F F2 R U R'", // Consecutive F moves
    ];

    invalidScrambles.forEach((scramble) => {
      expect(validateScramble(scramble)).toBe(false);
    });
  });

  test("validateScramble rejects scrambles with three consecutive axis moves", () => {
    const invalidScrambles = [
      "R L R U R' U'", // R-L-R (same axis)
      "U D U R U R'", // U-D-U (same axis)
      "F B F' R U R'", // F-B-F (same axis)
      "L' R L2 U R U'", // L-R-L (same axis)
    ];

    invalidScrambles.forEach((scramble) => {
      expect(validateScramble(scramble)).toBe(false);
    });
  });

  test("validateScramble handles edge cases", () => {
    expect(validateScramble("")).toBe(true); // Empty scramble is valid
    expect(validateScramble("R")).toBe(true); // Single move is valid
    expect(validateScramble("R U")).toBe(true); // Two moves are valid
    expect(validateScramble("   R   U   ")).toBe(true); // Whitespace handling
  });

  test("validateScramble handles malformed strings gracefully", () => {
    const malformedScrambles = [
      "R U R' U' R' F R2 U' R' extra",
      "R U R' ? U' R'",
      "R U R' 123 U' R'",
      "R U R' U' R' F R2 U' R' !@#",
    ];

    malformedScrambles.forEach((scramble) => {
      expect(validateScramble(scramble)).toBe(false);
    });
  });
});

describe("Scramble Formatting", () => {
  test("formatScramble cleans up whitespace", () => {
    const messy = "  R   U   R'  U'   R'   F   R2   U'   R'  ";
    const clean = formatScramble(messy);

    expect(clean).toBe("R U R' U' R' F R2 U' R'");
  });

  test("formatScramble handles different whitespace types", () => {
    const messy = "R\tU\nR'\rU'\vR'\fF\nR2\tU'\rR'";
    const clean = formatScramble(messy);

    expect(clean).toBe("R U R' U' R' F R2 U' R'");
  });

  test("formatScramble preserves move order", () => {
    const original = "F2 L' B2 R D2 R' U2 L B2 L2 U' L' D' F' U R2 B L2 F2 U";
    const formatted = formatScramble(original);

    expect(formatted).toBe(original);
    expect(parseScramble(formatted)).toEqual(parseScramble(original));
  });

  test("formatScramble handles empty string", () => {
    expect(formatScramble("")).toBe("");
    expect(formatScramble("   ")).toBe("");
  });
});

describe("Specialized Scramble Generators", () => {
  test("generateCompetitionScramble creates 20-move scrambles", () => {
    for (let i = 0; i < 10; i++) {
      const scramble = generateCompetitionScramble();
      const moves = scramble.split(" ");

      expect(moves.length).toBe(20);
      expect(validateScramble(scramble)).toBe(true);
    }
  });

  test("generatePracticeScramble creates 15-move scrambles", () => {
    for (let i = 0; i < 10; i++) {
      const scramble = generatePracticeScramble();
      const moves = scramble.split(" ");

      expect(moves.length).toBe(15);
      expect(validateScramble(scramble)).toBe(true);
    }
  });

  test("generateLongScramble creates 25-move scrambles", () => {
    for (let i = 0; i < 10; i++) {
      const scramble = generateLongScramble();
      const moves = scramble.split(" ");

      expect(moves.length).toBe(25);
      expect(validateScramble(scramble)).toBe(true);
    }
  });

  test("specialized generators create different scrambles", () => {
    const competition = new Set();
    const practice = new Set();
    const long = new Set();

    for (let i = 0; i < 20; i++) {
      competition.add(generateCompetitionScramble());
      practice.add(generatePracticeScramble());
      long.add(generateLongScramble());
    }

    // Each should generate mostly unique scrambles
    expect(competition.size).toBeGreaterThan(18);
    expect(practice.size).toBeGreaterThan(18);
    expect(long.size).toBeGreaterThan(18);
  });
});

describe("Algorithm Practice Generation", () => {
  test("generateAlgorithmPractice works for all algorithm types", () => {
    const types = Object.keys(ALGORITHM_PATTERNS) as Array<
      keyof typeof ALGORITHM_PATTERNS
    >;

    types.forEach((type) => {
      const practice = generateAlgorithmPractice(type);

      expect(typeof practice).toBe("string");
      expect(practice.length).toBeGreaterThan(0);

      // Should contain valid moves
      const moves = parseScramble(practice);
      moves.forEach((move) => {
        expect(VALID_MOVES.includes(move)).toBe(true);
      });
    });
  });

  test("generateAlgorithmPractice includes algorithm patterns", () => {
    // Test multiple times due to randomness
    const ollPractices = new Set();
    const pllPractices = new Set();
    const f2lPractices = new Set();

    for (let i = 0; i < 20; i++) {
      ollPractices.add(generateAlgorithmPractice("OLL"));
      pllPractices.add(generateAlgorithmPractice("PLL"));
      f2lPractices.add(generateAlgorithmPractice("F2L"));
    }

    // Should generate variety
    expect(ollPractices.size).toBeGreaterThan(1);
    expect(pllPractices.size).toBeGreaterThan(1);
    expect(f2lPractices.size).toBeGreaterThan(1);
  });

  test("ALGORITHM_PATTERNS contains expected algorithm types", () => {
    expect(ALGORITHM_PATTERNS.OLL).toBeDefined();
    expect(ALGORITHM_PATTERNS.PLL).toBeDefined();
    expect(ALGORITHM_PATTERNS.F2L).toBeDefined();

    expect(Array.isArray(ALGORITHM_PATTERNS.OLL)).toBe(true);
    expect(Array.isArray(ALGORITHM_PATTERNS.PLL)).toBe(true);
    expect(Array.isArray(ALGORITHM_PATTERNS.F2L)).toBe(true);

    expect(ALGORITHM_PATTERNS.OLL.length).toBeGreaterThan(0);
    expect(ALGORITHM_PATTERNS.PLL.length).toBeGreaterThan(0);
    expect(ALGORITHM_PATTERNS.F2L.length).toBeGreaterThan(0);
  });

  test("algorithm patterns contain valid move sequences", () => {
    Object.values(ALGORITHM_PATTERNS)
      .flat()
      .forEach((pattern) => {
        // Remove parentheses from patterns before parsing
        const cleanPattern = pattern.replace(/[()]/g, "");
        const moves = parseScramble(cleanPattern);

        moves.forEach((move) => {
          expect(VALID_MOVES.includes(move)).toBe(true);
        });
      });
  });
});

describe("Scramble Integration with Cube Simulation", () => {
  test("generated scrambles can be applied to cube without errors", () => {
    for (let i = 0; i < 20; i++) {
      const scramble = generateScramble(20);

      expect(() => applyScramble(scramble)).not.toThrow();

      // Applying scramble should change cube state
      const scrambledCube = applyScramble(scramble);
      expect(isCubeSolved(scrambledCube)).toBe(false);
    }
  });

  test("scrambled cubes maintain structural integrity", () => {
    for (let i = 0; i < 10; i++) {
      const scramble = generateScramble(25);
      const cube = applyScramble(scramble);

      // Color histogram should be preserved
      expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);

      // All faces should still have 9 stickers
      const faces = ["U", "R", "F", "D", "L", "B"] as const;
      faces.forEach((face) => {
        expect(cube[face].length).toBe(9);
      });

      // Centers should be preserved
      expect(cube.U[4]).toBe(CubeColor.White);
      expect(cube.D[4]).toBe(CubeColor.Yellow);
      expect(cube.F[4]).toBe(CubeColor.Green);
      expect(cube.B[4]).toBe(CubeColor.Blue);
      expect(cube.R[4]).toBe(CubeColor.Red);
      expect(cube.L[4]).toBe(CubeColor.Orange);
    }
  });

  test("competition scrambles create solvable positions", () => {
    // Test that competition scrambles create valid cube states
    for (let i = 0; i < 5; i++) {
      const scramble = generateCompetitionScramble();
      const cube = applyScramble(scramble);

      // Cube should not be solved after scrambling
      expect(isCubeSolved(cube)).toBe(false);

      // But should maintain valid structure
      expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
    }
  });

  test("algorithm practice scrambles are applicable", () => {
    const types = Object.keys(ALGORITHM_PATTERNS) as Array<
      keyof typeof ALGORITHM_PATTERNS
    >;

    types.forEach((type) => {
      const practice = generateAlgorithmPractice(type);

      expect(() => applyScramble(practice)).not.toThrow();

      const cube = applyScramble(practice);
      expect(getColorHistogram(cube)).toEqual([9, 9, 9, 9, 9, 9]);
    });
  });
});

describe("Scramble Performance and Reliability", () => {
  test("scramble generation is consistent and fast", () => {
    const start = Date.now();

    for (let i = 0; i < 100; i++) {
      const scramble = generateScramble(20);
      expect(scramble.split(" ").length).toBe(20);
      expect(validateScramble(scramble)).toBe(true);
    }

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should be fast
  });

  test("scramble generation handles stress testing", () => {
    // Generate many scrambles to test for infinite loops or errors
    const scrambles = [];

    for (let i = 0; i < 200; i++) {
      const length = Math.floor(Math.random() * 30) + 5; // 5-35 moves
      const scramble = generateScramble(length);

      expect(scramble.split(" ").length).toBe(length);
      expect(validateScramble(scramble)).toBe(true);
      scrambles.push(scramble);
    }

    // Should have high diversity
    const uniqueScrambles = new Set(scrambles);
    expect(uniqueScrambles.size).toBeGreaterThan(190);
  });

  test("validation is robust against edge cases", () => {
    const edgeCases = [
      "",
      " ",
      "R",
      "R U",
      "R U R'",
      "   R   U   R'   ",
      "\t\n\r",
      "R\nU\tR'",
    ];

    edgeCases.forEach((scramble) => {
      expect(() => validateScramble(scramble)).not.toThrow();
      expect(typeof validateScramble(scramble)).toBe("boolean");
    });
  });
});

describe("Scramble Randomness and Distribution", () => {
  test("move distribution is reasonably uniform", () => {
    const moveCount = new Map<string, number>();
    VALID_MOVES.forEach((move) => moveCount.set(move, 0));

    // Generate many scrambles and count move frequency
    for (let i = 0; i < 100; i++) {
      const scramble = generateScramble(20);
      const moves = scramble.split(" ");

      moves.forEach((move) => {
        moveCount.set(move, (moveCount.get(move) || 0) + 1);
      });
    }

    // Each move should appear at least once in 2000 total moves
    VALID_MOVES.forEach((move) => {
      expect(moveCount.get(move) || 0).toBeGreaterThan(0);
    });

    // Distribution shouldn't be too skewed (no move should dominate)
    const totalMoves = Array.from(moveCount.values()).reduce(
      (a, b) => a + b,
      0,
    );
    const avgPerMove = totalMoves / VALID_MOVES.length;

    VALID_MOVES.forEach((move) => {
      const count = moveCount.get(move) || 0;
      // Each move should be within reasonable range of average
      expect(count).toBeGreaterThan(avgPerMove * 0.3);
      expect(count).toBeLessThan(avgPerMove * 2.5);
    });
  });

  test("face distribution respects WCA constraints", () => {
    const faceCount = new Map<string, number>();
    ["R", "L", "U", "D", "F", "B"].forEach((face) => faceCount.set(face, 0));

    for (let i = 0; i < 50; i++) {
      const scramble = generateScramble(20);
      const moves = scramble.split(" ");

      moves.forEach((move) => {
        const face = getFaceFromMove(move);
        faceCount.set(face, (faceCount.get(face) || 0) + 1);
      });
    }

    // Each face should appear in scrambles
    ["R", "L", "U", "D", "F", "B"].forEach((face) => {
      expect(faceCount.get(face) || 0).toBeGreaterThan(0);
    });
  });
});
