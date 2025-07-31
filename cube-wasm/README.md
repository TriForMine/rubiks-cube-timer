# Cube WASM Module

This directory contains the Rust-based WebAssembly module that provides high-performance Rubik's cube simulation and scramble generation.

## Overview

The WASM module is written in Rust and compiled to WebAssembly for optimal performance in the browser. It provides:

- **Fast cube simulation**: Optimized cube state representation and move execution
- **Scramble generation**: WCA-compliant scramble generation with proper randomization
- **Memory efficiency**: Zero-copy memory access between JS and WASM
- **Type safety**: Full TypeScript definitions for the WASM interface

## Compiled Files

The compiled WASM files are **intentionally committed** to the repository because:

1. **Deployment compatibility**: Cloudflare Pages and similar platforms don't support Rust compilation
2. **Build simplicity**: Reduces deployment complexity and build time
3. **Reliability**: Ensures consistent builds across all environments

### Key Files in `/pkg`:
- `cube_wasm.js` - JavaScript bindings and module loader
- `cube_wasm_bg.wasm` - Compiled WebAssembly binary
- `cube_wasm.d.ts` - TypeScript type definitions
- `package.json` - NPM package configuration

## Development

### Prerequisites
- [Rust](https://rustup.rs/) (latest stable)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/) for building WASM modules

### Building the WASM Module

```bash
# Install wasm-pack if you haven't already
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Build for web (ES modules)
wasm-pack build --target web --out-dir pkg

# Build for bundlers (webpack, vite, etc.)
wasm-pack build --target bundler --out-dir pkg-bundler
```

### Testing

```bash
# Run Rust tests
cargo test

# Run WASM-specific tests
wasm-pack test --headless --chrome
```

## Performance Features

### Zero-Copy Memory Access
The module uses direct memory views to avoid copying data between JavaScript and WASM:

```typescript
// Get direct access to cube state in WASM memory
const cubeState = wasmCube.getMemoryView();
// No copying - this is a direct view into WASM linear memory
```

### Optimized Algorithms
- **Move encoding**: Moves are represented as single bytes for fast processing
- **State representation**: Cube state uses optimized bit packing
- **Scramble generation**: Uses proper random state space exploration

## API Usage

### Basic Cube Operations

```typescript
import { WasmCube, generateScramble } from './cube-wasm';

// Create a solved cube
const cube = WasmCube.solved();

// Apply moves
cube.move("R U R' U'");

// Get face colors
const frontFace = cube.F; // Uint8Array with 9 color values

// Generate a scramble
const scramble = await generateScramble(20);
```

### Performance Monitoring

```typescript
import { benchmarkMoves, benchmarkScrambleGeneration } from './cube-wasm';

// Benchmark move execution (1000 iterations)
const moveTime = benchmarkMoves(1000);

// Benchmark scramble generation (100 scrambles)
const scrambleTime = benchmarkScrambleGeneration(100);
```

## Architecture

### Memory Layout
```
WASM Linear Memory:
├── Cube State (54 bytes) - 6 faces × 9 stickers
├── Move History (dynamic)
└── Scratch Space (for algorithms)
```

### Move Representation
- Moves are encoded as single bytes for efficiency
- Supports all standard notation: `F`, `R`, `U`, `B`, `L`, `D`
- Includes modifiers: `'` (prime), `2` (double)
- Wide moves: `Fw`, `Rw`, etc.

## Deployment Notes

### Why WASM Files Are Committed

Most hosting platforms (Cloudflare Pages, Vercel, Netlify) don't provide:
- Rust compiler toolchain
- wasm-pack build tools
- Complex native dependencies

By committing the compiled WASM files:
- ✅ Deployments are fast and reliable
- ✅ No platform-specific build requirements
- ✅ Consistent performance across environments
- ✅ Easy rollbacks and version control

### Updating WASM Files

When making changes to the Rust code:

1. Make your changes in `/src`
2. Test thoroughly with `cargo test`
3. Rebuild with `wasm-pack build --target web`
4. Commit both source and compiled files
5. The deployment will automatically use the new WASM

## Contributing

When contributing to the WASM module:

1. **Always rebuild** after Rust changes: `wasm-pack build --target web`
2. **Test both Rust and WASM**: Run `cargo test` and browser tests
3. **Commit compiled files**: Include the updated `/pkg` files in your PR
4. **Document performance**: Note any significant performance changes

## License

This WASM module is part of the Rubik's Cube Timer project and follows the same license terms.