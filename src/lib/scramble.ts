// Rubik's Cube scramble generator for 3x3x3 cube
// Implements official WCA (World Cube Association) notation

const MOVES = [
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

// Group faces by axis for WCA validation
const FACE_AXES: Record<string, string[]> = {
  RL: ["R", "L"],
  UD: ["U", "D"],
  FB: ["F", "B"],
};

function getAxisForFace(face: string): string {
  for (const [axis, faces] of Object.entries(FACE_AXES)) {
    if (faces.includes(face)) {
      return axis;
    }
  }
  return "";
}

function getRandomMove(): string {
  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

function getFaceFromMove(move: string): string {
  return move.charAt(0);
}

function isValidMove(
  move: string,
  previousMove: string | null,
  beforePreviousMove: string | null,
): boolean {
  if (!previousMove) return true;

  const currentFace = getFaceFromMove(move);
  const previousFace = getFaceFromMove(previousMove);

  // Rule 1: Don't allow consecutive moves on the same face
  if (currentFace === previousFace) {
    return false;
  }

  // Rule 2: WCA axis rule - if last two moves were on the same axis (opposite faces),
  // the next move cannot be on that same axis
  if (beforePreviousMove) {
    const beforePreviousFace = getFaceFromMove(beforePreviousMove);
    const currentAxis = getAxisForFace(currentFace);
    const previousAxis = getAxisForFace(previousFace);
    const beforePreviousAxis = getAxisForFace(beforePreviousFace);

    // If the previous two moves were on the same axis,
    // don't allow a third consecutive move on that axis
    if (previousAxis === beforePreviousAxis && currentAxis === previousAxis) {
      return false;
    }
  }

  return true;
}

export function generateScramble(length: number = 20): string {
  const scramble: string[] = [];
  let attempts = 0;
  const maxAttempts = 1000; // Prevent infinite loops

  while (scramble.length < length && attempts < maxAttempts) {
    const move = getRandomMove();
    const previousMove =
      scramble.length > 0 ? scramble[scramble.length - 1] : null;
    const beforePreviousMove =
      scramble.length > 1 ? scramble[scramble.length - 2] : null;

    if (isValidMove(move, previousMove, beforePreviousMove)) {
      scramble.push(move);
    }

    attempts++;
  }

  return scramble.join(" ");
}

export function parseScramble(scrambleString: string): string[] {
  return scrambleString
    .trim()
    .split(/\s+/)
    .filter((move) => move.length > 0);
}

export function validateScramble(scrambleString: string): boolean {
  try {
    const moves = parseScramble(scrambleString);

    for (const move of moves) {
      if (!MOVES.includes(move)) {
        return false;
      }
    }

    // Check for invalid sequences
    for (let i = 0; i < moves.length; i++) {
      const currentMove = moves[i];
      const previousMove = i > 0 ? moves[i - 1] : null;
      const beforePreviousMove = i > 1 ? moves[i - 2] : null;

      if (!isValidMove(currentMove, previousMove, beforePreviousMove)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function formatScramble(scrambleString: string): string {
  const moves = parseScramble(scrambleString);
  return moves.join(" ");
}

// Generate different scramble types
export function generateCompetitionScramble(): string {
  return generateScramble(20);
}

export function generatePracticeScramble(): string {
  return generateScramble(15);
}

export function generateLongScramble(): string {
  return generateScramble(25);
}

// Algorithm patterns for specific practice
export const ALGORITHM_PATTERNS = {
  OLL: [
    "R U R' U R U2 R'", // T-Perm OLL
    "R U R' U' R' F R F'", // Sexy move + insert
    "F R U R' U' F'", // OLL 45
    "R U R' U R U' R' U' R' F R F'", // OLL 37
    "F (R U R' U') (R U R' U') (R U R' U') F'", // OLL 44 (Sune)
    "F' (L' U' L U) (L' U' L U) (L' U' L U) F", // OLL 43 (Anti-Sune)
    "R U2 R' U' R U' R'", // OLL 26
    "R' U' R U' R' U2 R", // OLL 27
    "R U2 R2 U' R2 U' R2 U2 R", // OLL 20
  ],
  PLL: [
    "R U R' F' R U R' U' R' F R2 U' R'", // T-Perm
    "R U R' U' R' F R2 U' R' U' R U R' F'", // J-Perm
    "R' U R' U' R' U' R' U R U R2", // A-Perm
    "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", // G-Perm
    "R2 U R' U R' U' R U' R2 U' D R' U R D'", // Y-Perm
    "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R", // V-Perm
    "R' U R U' R' F' U' F R U R' F R' F' R U' R", // E-Perm
    "R U' L' U R' U' L U R U' L' U R' U' L", // U-Perm (a)
  ],
  F2L: [
    "R U' R' U R U R'", // Basic F2L case
    "R U R' U' R U R'", // Another basic case
    "R U' R' U2 R U' R'", // F2L with setup
    "R U2 R' U' R U R'", // F2L variation
    "U' R U R' U R U R'", // F2L edge in slot
    "U R U' R' U' R U R'", // F2L corner in slot
    "R' F R F' U R U' R'", // F2L pair split
    "U' F' U F U R U' R'", // F2L edge misoriented
  ],
};

export function generateAlgorithmPractice(
  type: keyof typeof ALGORITHM_PATTERNS,
): string {
  const patterns = ALGORITHM_PATTERNS[type];
  const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];

  // Add some random moves before and after to scramble the cube
  const prefix = generateScramble(8);
  const suffix = generateScramble(8);

  return `${prefix} ${randomPattern} ${suffix}`;
}
