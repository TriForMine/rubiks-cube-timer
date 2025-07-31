#!/usr/bin/env node

/**
 * WASM Setup Script for Rubik's Cube Timer
 * Ensures WASM files are properly built and copied for Next.js
 */

import { existsSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const PROJECT_ROOT = resolve(process.cwd());
const WASM_DIR = join(PROJECT_ROOT, "cube-wasm");

function execCommand(
  command: string,
  options: { cwd?: string; quiet?: boolean; env?: Record<string, string> } = {},
): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [], {
      shell: true,
      cwd: options.cwd || WASM_DIR,
      stdio: options.quiet ? "pipe" : "inherit",
      env: { ...process.env, ...options.env },
    });

    let stdout = "";
    let stderr = "";

    if (child.stdout) {
      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });
    }

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed: ${command}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

function getFileSize(filePath: string): number {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

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

    // Check if we have npm/yarn scripts in the WASM directory
    const wasmPackageJson = join(WASM_DIR, "package.json");
    if (existsSync(wasmPackageJson)) {
      try {
        await execCommand("npm run clean");
      } catch {
        // If npm run clean fails, try alternative cleanup
        try {
          await execCommand("cargo clean");
        } catch {
          console.log("⚠️ Could not clean - continuing anyway");
        }
      }
    } else {
      // No package.json, try cargo clean directly
      try {
        await execCommand("cargo clean");
      } catch {
        console.log("⚠️ Could not clean - continuing anyway");
      }
    }

    // Build optimized WASM
    console.log("🔨 Building optimized WASM module...");

    const rustFlags = "-Ctarget-feature=+simd128 -Clto=yes -Copt-level=3";
    const buildEnv = {
      RUSTFLAGS: rustFlags,
    };

    if (existsSync(wasmPackageJson)) {
      await execCommand("npm run build", { env: buildEnv });
    } else {
      // Try to build with wasm-pack directly
      await execCommand(
        "wasm-pack build --target bundler --out-dir pkg-bundler --release",
        { env: buildEnv },
      );
    }

    // Optimize with wasm-opt if available
    const wasmFileB = join(WASM_DIR, "pkg-bundler", "cube_wasm_bg.wasm");
    if (existsSync(wasmFileB)) {
      try {
        console.log("⚡ Optimizing WASM with wasm-opt...");
        await execCommand(
          `wasm-opt -Oz --enable-mutable-globals ${wasmFileB} -o ${wasmFileB}`,
          { quiet: true },
        );
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
      const wasmSize = getFileSize(wasmFile);
      const jsSize = getFileSize(jsFile);
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

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
