/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2025 TriForMine
 * Repository: https://github.com/TriForMine/rubiks-cube-timer
 */

/**
 * Streamlined TypeScript wrapper for Rust/WASM optimized cube simulation
 * Provides direct WASM access with zero-copy memory operations
 */

// WASM module type definitions for optimized cube
interface WasmModule {
  WasmOptimizedCube: {
    new (): WasmOptimizedCubeInstance;
    solved(): WasmOptimizedCubeInstance;
    parse_scramble(scramble: string): Uint8Array;
    generate_random_scramble(length: number): Uint8Array;
  };
  MoveUtils: {
    move_to_code(move: string): number;
    code_to_move(code: number): string;
    parse_scramble_to_codes(scramble: string): Uint8Array;
    codes_to_scramble(codes: Uint8Array): string;
  };
  ScrambleUtils: {
    generate_scramble(length: number): string;
    generate_competition_scramble(): string;
    generate_practice_scramble(): string;
    generate_long_scramble(): string;
    validate_scramble(scramble: string): boolean;
    parse_scramble(scramble: string): string[];
    format_scramble(scramble: string): string;
    generate_algorithm_practice(type: string): string;
  };
  CubeColors: {
    WHITE: number;
    YELLOW: number;
    GREEN: number;
    BLUE: number;
    RED: number;
    ORANGE: number;
  };
}

interface WasmOptimizedCubeInstance {
  // Zero-copy memory access
  ptr(): number;
  len(): number;

  // Move operations
  apply_move(move: string): void;
  apply_scramble(scramble: string): void;
  apply_moves(moves: Uint8Array): void;

  // State operations
  is_solved(): boolean;
  reset(): void;
  clone(): WasmOptimizedCubeInstance;

  // Data access
  get_stickers(): Uint8Array;
  set_stickers(stickers: Uint8Array): void;
  get_face(face: number): Uint8Array;
}

let wasmModule: WasmModule | null = null;
let wasmInitialized = false;

// Re-export the color enum for compatibility
export enum CubeColor {
  White = 0,
  Yellow = 1,
  Green = 2,
  Blue = 3,
  Red = 4,
  Orange = 5,
}

// Initialize WASM module
export async function initWasm(): Promise<void> {
  if (wasmInitialized) return;

  try {
    const wasmImport = await import("../../cube-wasm/pkg-bundler/cube_wasm");

    // Create our module interface
    wasmModule = {
      WasmOptimizedCube: wasmImport.WasmOptimizedCube,
      MoveUtils: wasmImport.MoveUtils,
      ScrambleUtils: wasmImport.ScrambleUtils,
      CubeColors: wasmImport.CubeColors,
    } as WasmModule;

    wasmInitialized = true;
    console.log("WASM optimized cube simulation initialized successfully");
  } catch (error) {
    console.warn("Failed to initialize WASM cube simulation:", error);
    console.warn(
      "Falling back to non-WASM mode - build WASM first with: cd cube-wasm && bun run build",
    );
    throw error;
  }
}

// High-performance WASM cube class with zero-copy operations
export class WasmCube {
  private wasmCube: WasmOptimizedCubeInstance;

  constructor(wasmCube?: WasmOptimizedCubeInstance) {
    if (!wasmInitialized || !wasmModule) {
      throw new Error("WASM module not initialized. Call initWasm() first.");
    }
    this.wasmCube = wasmCube || wasmModule.WasmOptimizedCube.solved();
  }

  static solved(): WasmCube {
    if (!wasmInitialized || !wasmModule) {
      throw new Error("WASM module not initialized. Call initWasm() first.");
    }
    return new WasmCube(wasmModule.WasmOptimizedCube.solved());
  }

  // Direct WASM operations - maximum performance
  applyMove(move: string): this {
    this.wasmCube.apply_move(move);
    return this;
  }

  applyScramble(scramble: string): this {
    this.wasmCube.apply_scramble(scramble);
    return this;
  }

  // Batch apply moves for maximum performance
  applyMoves(moves: Uint8Array): this {
    this.wasmCube.apply_moves(moves);
    return this;
  }

  isSolved(): boolean {
    return this.wasmCube.is_solved();
  }

  reset(): this {
    this.wasmCube.reset();
    return this;
  }

  clone(): WasmCube {
    return new WasmCube(this.wasmCube.clone());
  }

  // Zero-copy memory access for maximum performance
  getMemoryView(): Uint8Array {
    const ptr = this.wasmCube.ptr();
    const len = this.wasmCube.len();

    // Create a view directly into WASM memory - zero copy!
    const wasmMemory =
      (
        wasmModule as {
          memory?: WebAssembly.Memory;
          __wbindgen_export_0?: WebAssembly.Memory;
        }
      ).memory ||
      (
        wasmModule as {
          memory?: WebAssembly.Memory;
          __wbindgen_export_0?: WebAssembly.Memory;
        }
      ).__wbindgen_export_0;
    if (wasmMemory?.buffer) {
      return new Uint8Array(wasmMemory.buffer, ptr, len);
    }

    // Fallback to copying if direct memory access fails
    return this.wasmCube.get_stickers();
  }

  // Get a copy of stickers (when zero-copy isn't suitable)
  getStickers(): Uint8Array {
    return this.wasmCube.get_stickers();
  }

  // Set cube state from sticker array
  setStickers(stickers: Uint8Array): this {
    this.wasmCube.set_stickers(stickers);
    return this;
  }

  // Face access - issue is in Rust implementation, not orientation
  get U(): Uint8Array {
    return this.wasmCube.get_face(0); // U face
  }

  get D(): Uint8Array {
    return this.wasmCube.get_face(1); // D face
  }

  get F(): Uint8Array {
    return this.wasmCube.get_face(2); // F face
  }

  get B(): Uint8Array {
    return this.wasmCube.get_face(3); // B face
  }

  get R(): Uint8Array {
    return this.wasmCube.get_face(4); // R face
  }

  get L(): Uint8Array {
    return this.wasmCube.get_face(5); // L face
  }

  // Get raw face data for algorithms (direct WASM access)
  getRawU(): Uint8Array {
    return this.wasmCube.get_face(0);
  }

  getRawD(): Uint8Array {
    return this.wasmCube.get_face(1);
  }

  getRawF(): Uint8Array {
    return this.wasmCube.get_face(2);
  }

  getRawB(): Uint8Array {
    return this.wasmCube.get_face(3);
  }

  getRawR(): Uint8Array {
    return this.wasmCube.get_face(4);
  }

  getRawL(): Uint8Array {
    return this.wasmCube.get_face(5);
  }
}

// High-performance move utilities
export function moveToCode(move: string): number {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.MoveUtils.move_to_code(move);
}

export function codeToMove(code: number): string {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.MoveUtils.code_to_move(code);
}

export function parseScrambleToMoves(scramble: string): Uint8Array {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.MoveUtils.parse_scramble_to_codes(scramble);
}

export function codesToScramble(codes: Uint8Array): string {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.MoveUtils.codes_to_scramble(codes);
}

// Scramble generation utilities
export function parseScramble(scramble: string): Uint8Array {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.WasmOptimizedCube.parse_scramble(scramble);
}

export function generateRandomScramble(length: number = 25): Uint8Array {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.WasmOptimizedCube.generate_random_scramble(length);
}

// High-level scramble generation functions
export async function generateScramble(length: number = 20): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.generate_scramble(length);
}

export async function generateCompetitionScramble(): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.generate_competition_scramble();
}

export async function generatePracticeScramble(): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.generate_practice_scramble();
}

export async function generateLongScramble(): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.generate_long_scramble();
}

export async function validateScramble(scramble: string): Promise<boolean> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.validate_scramble(scramble);
}

export async function parseScrambleString(scramble: string): Promise<string[]> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.parse_scramble(scramble);
}

export async function formatScramble(scramble: string): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.format_scramble(scramble);
}

export async function generateAlgorithmPractice(
  type: "OLL" | "PLL" | "F2L",
): Promise<string> {
  if (!wasmInitialized) {
    await initWasm();
  }
  if (!wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.ScrambleUtils.generate_algorithm_practice(type);
}

// Algorithm patterns for legacy support
export const ALGORITHM_PATTERNS = {
  OLL: "OLL",
  PLL: "PLL",
  F2L: "F2L",
} as const;

// Color constants from WASM
export function getCubeColors() {
  if (!wasmInitialized || !wasmModule) {
    throw new Error("WASM module not initialized");
  }
  return wasmModule.CubeColors;
}

// UI Helper functions
const displayHexMap = {
  [CubeColor.White]: "#FFFFFF",
  [CubeColor.Yellow]: "#FFD700",
  [CubeColor.Red]: "#EF4444",
  [CubeColor.Orange]: "#F97316",
  [CubeColor.Blue]: "#2563EB",
  [CubeColor.Green]: "#16A34A",
} as const;

const bgClassMap = {
  [CubeColor.White]: "bg-white dark:bg-zinc-200",
  [CubeColor.Yellow]: "bg-yellow-400 dark:bg-yellow-300",
  [CubeColor.Red]: "bg-red-500 dark:bg-red-400",
  [CubeColor.Orange]: "bg-orange-500 dark:bg-orange-400",
  [CubeColor.Blue]: "bg-blue-600 dark:bg-blue-500",
  [CubeColor.Green]: "bg-green-600 dark:bg-green-500",
} as const;

export const displayHex = displayHexMap;
export const bgClass = bgClassMap;

export function getDisplayHex(c: CubeColor): string {
  return displayHexMap[c];
}

export function getBgClass(c: CubeColor): string {
  return bgClassMap[c];
}

export function getFaceName(f: "U" | "D" | "F" | "B" | "R" | "L"): string {
  const faceNames = {
    U: "Up (White)",
    D: "Down (Yellow)",
    F: "Front (Green)",
    B: "Back (Blue)",
    R: "Right (Red)",
    L: "Left (Orange)",
  };
  return faceNames[f];
}

// Performance monitoring utilities
export function benchmarkMoves(iterations: number = 1000): number {
  const cube = WasmCube.solved();
  const scramble = generateRandomScramble(25);

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    cube.applyMoves(scramble);
  }
  const end = performance.now();

  return end - start;
}

export function benchmarkScrambleGeneration(iterations: number = 1000): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    generateRandomScramble(25);
  }
  const end = performance.now();

  return end - start;
}

export function benchmarkZeroCopyAccess(iterations: number = 10000): number {
  const cube = WasmCube.solved();

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    cube.getMemoryView();
  }
  const end = performance.now();

  return end - start;
}

// Utility functions
export function isWasmInitialized(): boolean {
  return wasmInitialized;
}
