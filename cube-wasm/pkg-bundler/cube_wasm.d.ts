/* tslint:disable */
/* eslint-disable */
/**
 * Main function for testing (optional)
 */
export function main(): void;
/**
 * Algorithm patterns for practice
 */
export class AlgorithmPatterns {
  private constructor();
  free(): void;
  static readonly oll: string[];
  static readonly pll: string[];
  static readonly f2l: string[];
}
export class CubeColors {
  private constructor();
  free(): void;
  static readonly WHITE: number;
  static readonly YELLOW: number;
  static readonly GREEN: number;
  static readonly BLUE: number;
  static readonly RED: number;
  static readonly ORANGE: number;
}
export class MoveUtils {
  private constructor();
  free(): void;
  static move_to_code(move_str: string): number;
  static code_to_move(code: number): string;
  static parse_scramble_to_codes(scramble: string): Uint8Array;
  static codes_to_scramble(codes: Uint8Array): string;
  static validate_scramble_string(scramble: string): boolean;
  static generate_competition_scramble_string(): string;
  static generate_practice_scramble_string(): string;
  static generate_long_scramble_string(): string;
  static generate_random_scramble_string(length: number): string;
}
export class PerfTest {
  private constructor();
  free(): void;
  static benchmark_moves(iterations: number): number;
  static benchmark_scramble_generation(iterations: number): number;
  static benchmark_zero_copy_access(iterations: number): number;
}
/**
 * Scramble generation utilities for JavaScript
 */
export class ScrambleUtils {
  private constructor();
  free(): void;
  /**
   * Generate a random scramble of specified length
   */
  static generate_scramble(length: number): string;
  /**
   * Generate a competition-standard scramble (20 moves)
   */
  static generate_competition_scramble(): string;
  /**
   * Generate a practice scramble (15 moves)
   */
  static generate_practice_scramble(): string;
  /**
   * Generate a long scramble (25 moves)
   */
  static generate_long_scramble(): string;
  /**
   * Validate a scramble string according to WCA rules
   */
  static validate_scramble(scramble: string): boolean;
  /**
   * Parse a scramble string into individual moves
   */
  static parse_scramble(scramble: string): string[];
  /**
   * Format a scramble string (normalize spacing)
   */
  static format_scramble(scramble: string): string;
  /**
   * Generate algorithm practice scramble
   */
  static generate_algorithm_practice(algorithm_type: string): string;
}
export class WasmOptimizedCube {
  free(): void;
  constructor();
  static solved(): WasmOptimizedCube;
  ptr(): number;
  len(): number;
  apply_move(move_str: string): void;
  apply_scramble(scramble: string): void;
  apply_moves(moves: Uint8Array): void;
  is_solved(): boolean;
  static parse_scramble(scramble: string): Uint8Array;
  static generate_random_scramble(length: number): Uint8Array;
  static generate_competition_scramble(): Uint8Array;
  static generate_practice_scramble(): Uint8Array;
  static generate_long_scramble(): Uint8Array;
  static validate_scramble(moves: Uint8Array): boolean;
  static moves_to_string(moves: Uint8Array): string;
  get_stickers(): Uint8Array;
  set_stickers(stickers: Uint8Array): void;
  get_face(face: number): Uint8Array;
  reset(): void;
  clone(): WasmOptimizedCube;
}
