#!/usr/bin/env node

/**
 * Production build script for Rubik's Cube Timer
 * Builds WASM module and Next.js application
 */

import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";
import { promisify } from "node:util";

const PROJECT_ROOT = resolve(process.cwd());
const WASM_DIR = join(PROJECT_ROOT, "cube-wasm");

interface BuildOptions {
  skipWasm?: boolean;
  analyze?: boolean;
  clean?: boolean;
  verbose?: boolean;
}

class Builder {
  private readonly options: BuildOptions;
  private readonly startTime: number;

  constructor(options: BuildOptions = {}) {
    this.options = options;
    this.startTime = Date.now();
  }

  private log(
    message: string,
    level: "info" | "warn" | "error" | "success" = "info",
  ): void {
    const icons = { info: "ℹ️", warn: "⚠️", error: "❌", success: "✅" };
    console.log(`${icons[level]} ${message}`);
  }

  private async execCommand(
    command: string,
    options: { cwd?: string; quiet?: boolean } = {},
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], {
        shell: true,
        cwd: options.cwd || PROJECT_ROOT,
        stdio: this.options.verbose || !options.quiet ? "inherit" : "pipe",
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

  private async checkPrerequisites(): Promise<void> {
    this.log("Checking prerequisites...");

    if (!existsSync(join(PROJECT_ROOT, "package.json"))) {
      throw new Error("package.json not found");
    }

    if (!existsSync(join(PROJECT_ROOT, "next.config.ts"))) {
      throw new Error("Next.js config not found");
    }

    this.log("Prerequisites OK", "success");
  }

  private async checkWasmPrerequisites(): Promise<boolean> {
    if (this.options.skipWasm) {
      this.log("Skipping WASM build");
      return false;
    }

    try {
      await this.execCommand("rustc --version", { quiet: true });
      await this.execCommand("wasm-bindgen --version", { quiet: true });

      const { stdout: targets } = await this.execCommand(
        "rustup target list --installed",
        { quiet: true },
      );
      if (!targets.includes("wasm32-unknown-unknown")) {
        this.log("Installing WASM target...");
        await this.execCommand("rustup target add wasm32-unknown-unknown");
      }

      this.log("WASM prerequisites OK", "success");
      return true;
    } catch {
      this.log("Rust/WASM tools not found - skipping WASM build", "warn");
      return false;
    }
  }

  private async buildWasm(): Promise<void> {
    this.log("Building WASM module...");

    try {
      // Use the dedicated WASM setup script
      await this.execCommand("npx tsx scripts/setup-wasm.ts");
      this.log("WASM build complete", "success");
    } catch (error) {
      throw new Error(`WASM build failed: ${error}`);
    }
  }

  private async buildNextJs(): Promise<void> {
    this.log("Building Next.js application...");

    try {
      if (this.options.analyze) {
        process.env.ANALYZE = "true";
      }

      await this.execCommand("npx next build", {
        quiet: !this.options.verbose,
      });
      this.log("Next.js build complete", "success");
    } catch (error) {
      throw new Error(`Next.js build failed: ${error}`);
    }
  }

  private printBuildSummary(): void {
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);

    this.log("=".repeat(40));
    this.log(`Build completed in ${duration}s`, "success");
    this.log(
      `WASM: ${existsSync(join(WASM_DIR, "pkg-bundler")) ? "✅" : "⚠️"}`,
    );
    this.log(
      `Next.js: ${existsSync(join(PROJECT_ROOT, ".next")) ? "✅" : "❌"}`,
    );

    if (this.options.analyze) {
      this.log("Bundle analysis: ✅");
    }

    this.log("=".repeat(40));
  }

  async build(): Promise<void> {
    try {
      this.log("🚀 Starting build...");

      await this.checkPrerequisites();
      const canBuildWasm = await this.checkWasmPrerequisites();

      if (canBuildWasm) {
        await this.buildWasm();
      }

      await this.buildNextJs();
      this.printBuildSummary();
    } catch (error) {
      this.log(`Build failed: ${error}`, "error");
      process.exit(1);
    }
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Build Script for Rubik's Cube Timer

Usage: npx tsx scripts/build-production.ts [options]

Options:
  --skip-wasm    Skip WASM build
  --analyze      Enable bundle analysis
  --clean        Clean before build
  --verbose      Verbose output
  --help, -h     Show help

Examples:
  npx tsx scripts/build-production.ts
  npx tsx scripts/build-production.ts --analyze
  npx tsx scripts/build-production.ts --skip-wasm
`);
    process.exit(0);
  }

  const options: BuildOptions = {
    skipWasm: args.includes("--skip-wasm"),
    analyze: args.includes("--analyze"),
    clean: args.includes("--clean"),
    verbose: args.includes("--verbose"),
  };

  const builder = new Builder(options);
  await builder.build();
}

process.on("SIGINT", () => {
  console.log("\n🛑 Build interrupted");
  process.exit(1);
});

main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
