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

//! High-performance 3×3×3 Rubik's Cube simulator in Rust with WebAssembly bindings
//!
//! This library provides a fast, memory-efficient cube implementation optimized for
//! WebAssembly usage with zero-copy memory access and batch move processing.

use wasm_bindgen::prelude::*;

// Core cube implementation
pub mod optimized_cube;
pub mod scramble_utils;
pub mod wasm_bindings;

// Re-export the primary types for easier access
pub use optimized_cube::{MoveCode, OptimizedCube};
pub use scramble_utils::{AlgorithmPatterns, ScrambleUtils};
pub use wasm_bindings::{CubeColors, MoveUtils, PerfTest, WasmOptimizedCube};

/// Set up better panic messages for debugging in WebAssembly
/// Call this once during initialization for improved error reporting
pub fn set_panic_hook() {
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();
}

// WebAssembly external bindings for JavaScript interop
#[wasm_bindgen]
extern "C" {
    /// JavaScript alert function
    fn alert(s: &str);

    /// JavaScript console.log function
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

/// Convenience macro for logging to JavaScript console
macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

/// Color enum for cube faces (compatible with optimized cube constants)
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum CubeColor {
    White = 0,
    Yellow = 1,
    Green = 2,
    Blue = 3,
    Red = 4,
    Orange = 5,
}

impl CubeColor {
    /// Convert u8 value to CubeColor enum
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(CubeColor::White),
            1 => Some(CubeColor::Yellow),
            2 => Some(CubeColor::Green),
            3 => Some(CubeColor::Blue),
            4 => Some(CubeColor::Red),
            5 => Some(CubeColor::Orange),
            _ => None,
        }
    }

    /// Get the numeric value of the color
    pub fn value(&self) -> u8 {
        *self as u8
    }
}

/// Main function for testing (optional)
#[wasm_bindgen(start)]
pub fn main() {
    set_panic_hook();
    console_log!("Rubik's Cube WASM module initialized");
}
