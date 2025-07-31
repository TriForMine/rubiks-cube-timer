#!/usr/bin/env bun

/**
 * WASM Setup Script for Rubik's Cube Timer
 * Ensures WASM files are properly built and copied for Next.js
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { $ } from "bun";

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const WASM_DIR = join(PROJECT_ROOT, "cube-wasm");

async function main() {
	console.log("🔧 Setting up WASM for Rubik's Cube Timer...");

	// Check if WASM directory exists
	if (!existsSync(WASM_DIR)) {
		console.error("❌ WASM directory not found:", WASM_DIR);
		process.exit(1);
	}

	try {
		// Clean if needed
		console.log("🧹 Cleaning previous build...");
		await $`bun run clean`.cwd(WASM_DIR);

		// Build optimized WASM
		console.log("🔨 Building optimized WASM module...");
		process.env.RUSTFLAGS = "-Ctarget-feature=+simd128 -Clto=yes -Copt-level=3";
		await $`bun run build`.cwd(WASM_DIR);

		// Optimize with wasm-opt if available
		const wasmFileB = join(WASM_DIR, "pkg-bundler", "cube_wasm_bg.wasm");
		if (existsSync(wasmFileB)) {
			try {
				console.log("⚡ Optimizing WASM with wasm-opt...");
				await $`wasm-opt -Oz --enable-mutable-globals ${wasmFileB} -o ${wasmFileB}`.quiet();
				console.log("✅ WASM optimization complete");
			} catch {
				console.log("⚠️ wasm-opt not available - skipping optimization");
			}
		}

		// Check if build succeeded
		const wasmBuildDir = join(WASM_DIR, "pkg-bundler");
		if (!existsSync(wasmBuildDir)) {
			throw new Error("WASM build failed - pkg-bundler directory not found");
		}

		// Verify build succeeded and show file info
		const wasmFile = join(wasmBuildDir, "cube_wasm_bg.wasm");
		const jsFile = join(wasmBuildDir, "cube_wasm.js");

		if (existsSync(wasmFile) && existsSync(jsFile)) {
			console.log("✅ WASM setup complete!");
			console.log(`   WASM file: ${wasmFile}`);
			console.log(`   JS file: ${jsFile}`);

			// Show file sizes
			const wasmSize = await Bun.file(wasmFile).size;
			const jsSize = await Bun.file(jsFile).size;
			console.log(`   WASM size: ${(wasmSize / 1024).toFixed(1)}KB`);
			console.log(`   JS size: ${(jsSize / 1024).toFixed(1)}KB`);
		} else {
			throw new Error("WASM files not found after build");
		}
	} catch (error) {
		console.error("❌ WASM setup failed:", error);
		process.exit(1);
	}
}

await main();
