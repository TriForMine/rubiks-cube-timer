use crate::optimized_cube::{MoveCode, OptimizedCube};
use wasm_bindgen::prelude::*;

// Export the optimized cube to JavaScript with zero-copy capabilities
#[wasm_bindgen]
pub struct WasmOptimizedCube {
    cube: OptimizedCube,
}

#[wasm_bindgen]
impl WasmOptimizedCube {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WasmOptimizedCube {
        WasmOptimizedCube {
            cube: OptimizedCube::new(),
        }
    }

    #[wasm_bindgen]
    pub fn solved() -> WasmOptimizedCube {
        WasmOptimizedCube {
            cube: OptimizedCube::solved(),
        }
    }

    // Zero-copy access: return pointer to the internal buffer
    #[wasm_bindgen]
    pub fn ptr(&self) -> *const u8 {
        self.cube.ptr()
    }

    // Get the length of the sticker array (always 54)
    #[wasm_bindgen]
    pub fn len(&self) -> usize {
        54
    }

    // Apply a single move by string
    #[wasm_bindgen]
    pub fn apply_move(&mut self, move_str: &str) -> Result<(), JsValue> {
        self.cube
            .apply_move(move_str)
            .map_err(|e| JsValue::from_str(&e))
    }

    // Apply scramble string
    #[wasm_bindgen]
    pub fn apply_scramble(&mut self, scramble: &str) -> Result<(), JsValue> {
        self.cube
            .apply_scramble(scramble)
            .map_err(|e| JsValue::from_str(&e))
    }

    // Batch apply moves from Uint8Array
    #[wasm_bindgen]
    pub fn apply_moves(&mut self, moves: &[u8]) {
        self.cube.apply_moves(moves);
    }

    // Check if solved
    #[wasm_bindgen]
    pub fn is_solved(&self) -> bool {
        self.cube.is_solved()
    }

    // Parse scramble string to move codes for batching
    #[wasm_bindgen]
    pub fn parse_scramble(scramble: &str) -> Result<Vec<u8>, JsValue> {
        OptimizedCube::parse_scramble(scramble).map_err(|e| JsValue::from_str(&e))
    }

    // Generate random scramble
    #[wasm_bindgen]
    pub fn generate_random_scramble(length: usize) -> Vec<u8> {
        OptimizedCube::generate_random_scramble(length)
    }

    // Generate competition scramble (20 moves)
    #[wasm_bindgen]
    pub fn generate_competition_scramble() -> Vec<u8> {
        OptimizedCube::generate_competition_scramble()
    }

    // Generate practice scramble (15 moves)
    #[wasm_bindgen]
    pub fn generate_practice_scramble() -> Vec<u8> {
        OptimizedCube::generate_practice_scramble()
    }

    // Generate long scramble (25 moves)
    #[wasm_bindgen]
    pub fn generate_long_scramble() -> Vec<u8> {
        OptimizedCube::generate_long_scramble()
    }

    // Validate scramble according to WCA rules
    #[wasm_bindgen]
    pub fn validate_scramble(moves: &[u8]) -> bool {
        OptimizedCube::validate_scramble(moves)
    }

    // Convert move codes to scramble string
    #[wasm_bindgen]
    pub fn moves_to_string(moves: &[u8]) -> String {
        OptimizedCube::moves_to_string(moves)
    }

    // Get a copy of the stickers array (for when zero-copy isn't suitable)
    #[wasm_bindgen]
    pub fn get_stickers(&self) -> Vec<u8> {
        self.cube.stickers().to_vec()
    }

    // Set stickers from array (for loading saved states)
    #[wasm_bindgen]
    pub fn set_stickers(&mut self, stickers: &[u8]) -> Result<(), JsValue> {
        if stickers.len() != 54 {
            return Err(JsValue::from_str(
                "Stickers array must have exactly 54 elements",
            ));
        }

        let cube_stickers = self.cube.stickers_mut();
        cube_stickers.copy_from_slice(stickers);
        Ok(())
    }

    // Get individual face (0=U, 1=D, 2=F, 3=B, 4=R, 5=L)
    #[wasm_bindgen]
    pub fn get_face(&self, face: usize) -> Vec<u8> {
        self.cube.get_face(face).to_vec()
    }

    // Reset to solved state
    #[wasm_bindgen]
    pub fn reset(&mut self) {
        self.cube = OptimizedCube::solved();
    }

    // Clone the cube
    #[wasm_bindgen]
    pub fn clone(&self) -> WasmOptimizedCube {
        WasmOptimizedCube {
            cube: self.cube.clone(),
        }
    }
}

// Utility functions for working with move codes
#[wasm_bindgen]
pub struct MoveUtils;

#[wasm_bindgen]
impl MoveUtils {
    // Convert move string to move code
    #[wasm_bindgen]
    pub fn move_to_code(move_str: &str) -> Result<u8, JsValue> {
        MoveCode::from_str(move_str)
            .map(|code| code as u8)
            .map_err(|e| JsValue::from_str(&e))
    }

    // Convert move code to string
    #[wasm_bindgen]
    pub fn code_to_move(code: u8) -> Result<String, JsValue> {
        let move_code = MoveCode::from_u8(code).map_err(|e| JsValue::from_str(&e))?;

        let move_str = match move_code {
            MoveCode::U => "U",
            MoveCode::D => "D",
            MoveCode::F => "F",
            MoveCode::B => "B",
            MoveCode::R => "R",
            MoveCode::L => "L",
            MoveCode::Up => "U'",
            MoveCode::Dp => "D'",
            MoveCode::Fp => "F'",
            MoveCode::Bp => "B'",
            MoveCode::Rp => "R'",
            MoveCode::Lp => "L'",
            MoveCode::U2 => "U2",
            MoveCode::D2 => "D2",
            MoveCode::F2 => "F2",
            MoveCode::B2 => "B2",
            MoveCode::R2 => "R2",
            MoveCode::L2 => "L2",
        };

        Ok(move_str.to_string())
    }

    // Parse scramble to move codes
    #[wasm_bindgen]
    pub fn parse_scramble_to_codes(scramble: &str) -> Result<Vec<u8>, JsValue> {
        OptimizedCube::parse_scramble(scramble).map_err(|e| JsValue::from_str(&e))
    }

    // Convert move codes back to scramble string
    #[wasm_bindgen]
    pub fn codes_to_scramble(codes: &[u8]) -> Result<String, JsValue> {
        let mut moves = Vec::new();

        for &code in codes {
            let move_str = Self::code_to_move(code)?;
            moves.push(move_str);
        }

        Ok(moves.join(" "))
    }

    // Validate scramble string according to WCA rules
    #[wasm_bindgen]
    pub fn validate_scramble_string(scramble: &str) -> bool {
        match OptimizedCube::parse_scramble(scramble) {
            Ok(moves) => OptimizedCube::validate_scramble(&moves),
            Err(_) => false,
        }
    }

    // Generate competition scramble as string
    #[wasm_bindgen]
    pub fn generate_competition_scramble_string() -> String {
        let moves = OptimizedCube::generate_competition_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    // Generate practice scramble as string
    #[wasm_bindgen]
    pub fn generate_practice_scramble_string() -> String {
        let moves = OptimizedCube::generate_practice_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    // Generate long scramble as string
    #[wasm_bindgen]
    pub fn generate_long_scramble_string() -> String {
        let moves = OptimizedCube::generate_long_scramble();
        OptimizedCube::moves_to_string(&moves)
    }

    // Generate random scramble as string
    #[wasm_bindgen]
    pub fn generate_random_scramble_string(length: usize) -> String {
        let moves = OptimizedCube::generate_random_scramble(length);
        OptimizedCube::moves_to_string(&moves)
    }
}

// Color constants for JavaScript
#[wasm_bindgen]
pub struct CubeColors;

#[wasm_bindgen]
impl CubeColors {
    #[wasm_bindgen(getter, js_name = WHITE)]
    pub fn white() -> u8 {
        OptimizedCube::WHITE
    }

    #[wasm_bindgen(getter, js_name = YELLOW)]
    pub fn yellow() -> u8 {
        OptimizedCube::YELLOW
    }

    #[wasm_bindgen(getter, js_name = GREEN)]
    pub fn green() -> u8 {
        OptimizedCube::GREEN
    }

    #[wasm_bindgen(getter, js_name = BLUE)]
    pub fn blue() -> u8 {
        OptimizedCube::BLUE
    }

    #[wasm_bindgen(getter, js_name = RED)]
    pub fn red() -> u8 {
        OptimizedCube::RED
    }

    #[wasm_bindgen(getter, js_name = ORANGE)]
    pub fn orange() -> u8 {
        OptimizedCube::ORANGE
    }
}

// Performance testing utilities
#[wasm_bindgen]
pub struct PerfTest;

#[wasm_bindgen]
impl PerfTest {
    // Benchmark move application speed
    #[wasm_bindgen]
    pub fn benchmark_moves(iterations: usize) -> f64 {
        let mut cube = OptimizedCube::new();
        let moves = OptimizedCube::generate_random_scramble(25);

        let start = web_sys::window().unwrap().performance().unwrap().now();

        for _ in 0..iterations {
            cube.apply_moves(&moves);
        }

        let end = web_sys::window().unwrap().performance().unwrap().now();

        end - start
    }

    // Benchmark scramble generation
    #[wasm_bindgen]
    pub fn benchmark_scramble_generation(iterations: usize) -> f64 {
        let start = web_sys::window().unwrap().performance().unwrap().now();

        for _ in 0..iterations {
            let _scramble = OptimizedCube::generate_random_scramble(25);
        }

        let end = web_sys::window().unwrap().performance().unwrap().now();

        end - start
    }

    // Benchmark zero-copy access
    #[wasm_bindgen]
    pub fn benchmark_zero_copy_access(iterations: usize) -> f64 {
        let cube = WasmOptimizedCube::solved();

        let start = web_sys::window().unwrap().performance().unwrap().now();

        for _ in 0..iterations {
            let _ptr = cube.ptr();
            // In real usage, JS would create Uint8Array from this pointer
        }

        let end = web_sys::window().unwrap().performance().unwrap().now();

        end - start
    }
}
