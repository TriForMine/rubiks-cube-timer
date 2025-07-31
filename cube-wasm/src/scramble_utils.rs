use crate::optimized_cube::OptimizedCube;
use wasm_bindgen::prelude::*;

/// Scramble generation utilities for JavaScript
#[wasm_bindgen]
pub struct ScrambleUtils;

#[wasm_bindgen]
impl ScrambleUtils {
    /// Generate a random scramble of specified length
    #[wasm_bindgen]
    pub fn generate_scramble(length: usize) -> String {
        let moves = OptimizedCube::generate_random_scramble(length);
        OptimizedCube::moves_to_string(&moves)
    }

    /// Generate a competition-standard scramble (20 moves)
    #[wasm_bindgen]
    pub fn generate_competition_scramble() -> String {
        let moves = OptimizedCube::generate_competition_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    /// Generate a practice scramble (15 moves)
    #[wasm_bindgen]
    pub fn generate_practice_scramble() -> String {
        let moves = OptimizedCube::generate_practice_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    /// Generate a long scramble (25 moves)
    #[wasm_bindgen]
    pub fn generate_long_scramble() -> String {
        let moves = OptimizedCube::generate_long_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    /// Validate a scramble string according to WCA rules
    #[wasm_bindgen]
    pub fn validate_scramble(scramble: &str) -> bool {
        match OptimizedCube::parse_scramble(scramble) {
            Ok(moves) => OptimizedCube::validate_scramble(&moves),
            Err(_) => false,
        }
    }

    /// Parse a scramble string into individual moves
    #[wasm_bindgen]
    pub fn parse_scramble(scramble: &str) -> Vec<String> {
        scramble
            .trim()
            .split_whitespace()
            .filter(|s| !s.is_empty())
            .map(|s| s.to_string())
            .collect()
    }

    /// Format a scramble string (normalize spacing)
    #[wasm_bindgen]
    pub fn format_scramble(scramble: &str) -> String {
        let moves = Self::parse_scramble(scramble);
        moves.join(" ")
    }

    /// Generate algorithm practice scramble
    #[wasm_bindgen]
    pub fn generate_algorithm_practice(algorithm_type: &str) -> String {
        let patterns = match algorithm_type {
            "OLL" => vec![
                "R U R' U R U2 R'",
                "R U R' U' R' F R F'",
                "F R U R' U' F'",
                "R U R' U R U' R' U' R' F R F'",
                "F (R U R' U') (R U R' U') (R U R' U') F'",
                "F' (L' U' L U) (L' U' L U) (L' U' L U) F",
                "R U2 R' U' R U' R'",
                "R' U' R U' R' U2 R",
                "R U2 R2 U' R2 U' R2 U2 R",
            ],
            "PLL" => vec![
                "R U R' F' R U R' U' R' F R2 U' R'",
                "R U R' U' R' F R2 U' R' U' R U R' F'",
                "R' U R' U' R' U' R' U R U R2",
                "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
                "R2 U R' U R' U' R U' R2 U' D R' U R D'",
                "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
                "R' U R U' R' F' U' F R U R' F R' F' R U' R",
                "R U' L' U R' U' L U R U' L' U R' U' L",
            ],
            "F2L" => vec![
                "R U' R' U R U R'",
                "R U R' U' R U R'",
                "R U' R' U2 R U' R'",
                "R U2 R' U' R U R'",
                "U' R U R' U R U R'",
                "U R U' R' U' R U R'",
                "R' F R F' U R U' R'",
                "U' F' U F U R U' R'",
            ],
            _ => vec!["R U R' U R U2 R'"], // Default to simple OLL
        };

        let random_pattern =
            patterns[js_sys::Math::random() as usize * patterns.len() % patterns.len()];

        // Add some random moves before and after
        let prefix_moves = OptimizedCube::generate_random_scramble(8);
        let suffix_moves = OptimizedCube::generate_random_scramble(8);

        let prefix = OptimizedCube::moves_to_string(&prefix_moves);
        let suffix = OptimizedCube::moves_to_string(&suffix_moves);

        format!("{} {} {}", prefix, random_pattern, suffix)
    }
}

/// Algorithm patterns for practice
#[wasm_bindgen]
pub struct AlgorithmPatterns;

#[wasm_bindgen]
impl AlgorithmPatterns {
    #[wasm_bindgen(getter)]
    pub fn oll() -> Vec<String> {
        vec![
            "R U R' U R U2 R'".to_string(),
            "R U R' U' R' F R F'".to_string(),
            "F R U R' U' F'".to_string(),
            "R U R' U R U' R' U' R' F R F'".to_string(),
            "F (R U R' U') (R U R' U') (R U R' U') F'".to_string(),
            "F' (L' U' L U) (L' U' L U) (L' U' L U) F".to_string(),
            "R U2 R' U' R U' R'".to_string(),
            "R' U' R U' R' U2 R".to_string(),
            "R U2 R2 U' R2 U' R2 U2 R".to_string(),
        ]
    }

    #[wasm_bindgen(getter)]
    pub fn pll() -> Vec<String> {
        vec![
            "R U R' F' R U R' U' R' F R2 U' R'".to_string(),
            "R U R' U' R' F R2 U' R' U' R U R' F'".to_string(),
            "R' U R' U' R' U' R' U R U R2".to_string(),
            "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'".to_string(),
            "R2 U R' U R' U' R U' R2 U' D R' U R D'".to_string(),
            "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R".to_string(),
            "R' U R U' R' F' U' F R U R' F R' F' R U' R".to_string(),
            "R U' L' U R' U' L U R U' L' U R' U' L".to_string(),
        ]
    }

    #[wasm_bindgen(getter)]
    pub fn f2l() -> Vec<String> {
        vec![
            "R U' R' U R U R'".to_string(),
            "R U R' U' R U R'".to_string(),
            "R U' R' U2 R U' R'".to_string(),
            "R U2 R' U' R U R'".to_string(),
            "U' R U R' U R U R'".to_string(),
            "U R U' R' U' R U R'".to_string(),
            "R' F R F' U R U' R'".to_string(),
            "U' F' U F U R U' R'".to_string(),
        ]
    }
}
