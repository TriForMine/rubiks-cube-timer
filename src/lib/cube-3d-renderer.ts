/**
 * Vanilla Three.js 3D Rubik’s Cube Renderer (v2.4 – complete)
 * ------------------------------------------------------------
 *  • Sticker ⇄ state mapping matches `cube-simulation.ts`.
 *  • Clockwise/prime/double turns animate by right-hand rule.
 *  • Public API: animateMove, animateScramble, updateState,
 *    resize, setCamera, dispose.
 */

import {
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
  type Texture,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  CubeColor,
  getDisplayHex,
  initWasm,
  isWasmInitialized,
  type WasmCube,
} from "./cube-wasm";

// Minimal interface for 3D renderer compatibility
type Face = Uint8Array & { length: 9 };
interface CubeState {
  U: Face;
  D: Face;
  F: Face;
  B: Face;
  R: Face;
  L: Face;
}

// Helper function to create CubeState from WasmCube
function _wasmCubeToState(cube: WasmCube): CubeState {
  return {
    U: cube.U as Face,
    D: cube.D as Face,
    F: cube.F as Face,
    B: cube.B as Face,
    R: cube.R as Face,
    L: cube.L as Face,
  };
}

// Helper function to create a solved cube state
function createSolvedState(): CubeState {
  const makeFace = (c: CubeColor): Face =>
    Uint8Array.from({ length: 9 }, () => c) as Face;

  return {
    U: makeFace(CubeColor.White),
    D: makeFace(CubeColor.Yellow),
    F: makeFace(CubeColor.Green),
    B: makeFace(CubeColor.Blue),
    R: makeFace(CubeColor.Red),
    L: makeFace(CubeColor.Orange),
  };
}

// Type for materials with disposable properties
interface DisposableMaterial extends Material {
  map?: Texture | null;
  normalMap?: Texture | null;
  bumpMap?: Texture | null;
  roughnessMap?: Texture | null;
  metalnessMap?: Texture | null;
  emissiveMap?: Texture | null;
  specularMap?: Texture | null;
  envMap?: Texture | null;
  lightMap?: Texture | null;
  aoMap?: Texture | null;
  alphaMap?: Texture | null;
  displacementMap?: Texture | null;
  gradientMap?: Texture | null;
}

// Type for objects with dispose method
interface DisposableObject extends Object3D {
  dispose?(): void;
}

/* ---------- Internal types ---------- */
interface CubePiece {
  mesh: Mesh;
  originalPosition: Vector3;
  currentPosition: Vector3;
  pieceIndex: number;
}
interface AnimationState {
  axis: Vector3;
  angle: number;
  targetAngle: number;
  duration: number;
  startTime: number;
  affectedPieces: CubePiece[];
  onComplete?: () => void;
}
// Removed unused type alias FaceArr

/* ---------- Renderer class ---------- */
export class Cube3DRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private cubeGroup: Group;
  private pieces: CubePiece[] = [];
  private animationState: AnimationState | null = null;
  private cubeState: CubeState;
  private showIndices: boolean = false;
  private controls: OrbitControls | null = null;

  /* Outward normals for the six Singmaster faces */
  private faceMapping: Record<
    keyof CubeState,
    { normal: Vector3; pieces: CubePiece[] }
  > = {
    U: { normal: new Vector3(0, 1, 0), pieces: [] },
    D: { normal: new Vector3(0, -1, 0), pieces: [] },
    F: { normal: new Vector3(0, 0, 1), pieces: [] },
    B: { normal: new Vector3(0, 0, -1), pieces: [] },
    R: { normal: new Vector3(1, 0, 0), pieces: [] },
    L: { normal: new Vector3(-1, 0, 0), pieces: [] },
  };

  /* When viewed from outside, does +90° look clockwise? */
  private cwDir: Record<keyof CubeState, 1 | -1> = {
    U: -1, // ⬅️  was +1
    D: -1, // ⬅️  was +1
    F: -1,
    B: -1,
    R: -1,
    L: -1,
  } as const;

  /* ---------- ctor ---------- */
  constructor(canvas: HTMLCanvasElement, initialState?: CubeState) {
    this.cubeState = initialState || createSolvedState();

    // Initialize WASM if not already done
    if (!isWasmInitialized()) {
      initWasm().catch(() => {
        console.warn(
          "WASM initialization failed in 3D renderer - using fallback",
        );
      });
    }

    /* Three.js bootstrap */
    this.scene = new Scene();
    this.scene.background = new Color(0x2a2a2a);

    this.camera = new PerspectiveCamera(
      75,
      canvas.width / canvas.height,
      0.1,
      1000,
    );
    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(canvas.width, canvas.height);
    this.renderer.shadowMap.enabled = true;

    this.setupLighting();
    this.setupControls();

    this.cubeGroup = new Group();
    this.scene.add(this.cubeGroup);

    this.buildCube();
    this.animate(); // kick off render loop
  }

  /* ---------- Scene helpers ---------- */
  private setupLighting() {
    this.scene.add(new AmbientLight(0xffffff, 0.6));
    const dir = new DirectionalLight(0xffffff, 0.8);
    dir.position.set(10, 10, 5);
    dir.castShadow = true;
    dir.shadow.mapSize.set(2048, 2048);
    this.scene.add(dir);
  }

  private setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.enableRotate = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
  }

  /* ---------- Cube construction ---------- */
  private buildCube() {
    /* clear existing */
    this.pieces.forEach((p) => this.cubeGroup.remove(p.mesh));
    this.pieces.length = 0;
    const resetFace = (f: { normal: Vector3; pieces: CubePiece[] }) => {
      f.pieces = [];
    };
    Object.values(this.faceMapping).forEach(resetFace);

    const geom = new BoxGeometry(0.95, 0.95, 0.95);
    const coord = [-1, 0, 1];
    let id = 0;

    for (const x of coord)
      for (const y of coord)
        for (const z of coord) {
          const pos = new Vector3(x, y, z);
          const mats = this.stickerMaterials(pos);
          const mesh = new Mesh(geom, mats);
          mesh.position.copy(pos);
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const piece: CubePiece = {
            mesh,
            originalPosition: pos.clone(),
            currentPosition: pos.clone(),
            pieceIndex: id++,
          };
          this.pieces.push(piece);
          this.cubeGroup.add(mesh);
          this.mapToFaces(piece, pos);
        }
  }

  private stickerMaterials(pos: Vector3): MeshLambertMaterial[] {
    /* Order: +X, -X, +Y, -Y, +Z, -Z */
    const faces: Array<{ f: keyof CubeState; vis: boolean }> = [
      { f: "R", vis: pos.x === 1 },
      { f: "L", vis: pos.x === -1 },
      { f: "U", vis: pos.y === 1 },
      { f: "D", vis: pos.y === -1 },
      { f: "F", vis: pos.z === 1 },
      { f: "B", vis: pos.z === -1 },
    ];

    return faces.map(({ f, vis }) => {
      if (!vis) return new MeshLambertMaterial({ color: 0x000000 });

      const idx = this.faceIndex(pos, f);
      const col = this.cubeState[f][idx];

      if (this.showIndices) {
        // Create texture with index number overlay
        const texture = this.createIndexTexture(idx, getDisplayHex(col));
        return new MeshLambertMaterial({ map: texture });
      } else {
        return new MeshLambertMaterial({ color: getDisplayHex(col) });
      }
    });
  }

  /* position → sticker index 0-8 for a face */
  /* Layout: [0,1,2, 3,4,5, 6,7,8] corresponds to:
   *         [top row, middle row, bottom row] */
  private faceIndex(p: Vector3, f: keyof CubeState): number {
    const { x, y, z } = p;
    switch (f) {
      case "F":
        return (1 - y) * 3 + (x + 1);
      case "B":
        return (1 - y) * 3 + (1 - x);
      case "U":
        return (z + 1) * 3 + (x + 1); // row 0 = back edge (z = -1)
      case "D":
        return (1 - z) * 3 + (x + 1); // row 0 = front edge (z = +1)
      case "R":
        return (1 - y) * 3 + (1 - z);
      case "L":
        return (1 - y) * 3 + (z + 1);
      default:
        return 0;
    }
  }

  private mapToFaces(piece: CubePiece, p: Vector3) {
    if (p.x === 1) this.faceMapping.R.pieces.push(piece);
    if (p.x === -1) this.faceMapping.L.pieces.push(piece);
    if (p.y === 1) this.faceMapping.U.pieces.push(piece);
    if (p.y === -1) this.faceMapping.D.pieces.push(piece);
    if (p.z === 1) this.faceMapping.F.pieces.push(piece);
    if (p.z === -1) this.faceMapping.B.pieces.push(piece);
  }

  /* ---------- Render loop ---------- */
  private animate = () => {
    requestAnimationFrame(this.animate);

    if (this.animationState) {
      const { startTime, duration, targetAngle, axis } = this.animationState;
      const t = Math.min((Date.now() - startTime) / duration, 1);
      const eased = this.easeInOutQuart(t);
      const newAngle = targetAngle * eased;
      const delta = newAngle - this.animationState.angle;

      if (delta !== 0) {
        const rotM = new Matrix4().makeRotationAxis(axis, delta);
        this.animationState.affectedPieces.forEach((pc) => {
          pc.mesh.position.applyMatrix4(rotM);
          pc.mesh.rotateOnAxis(axis, delta);
        });
        this.animationState.angle = newAngle;
      }

      if (t === 1) {
        const cb = this.animationState.onComplete;
        this.animationState = null;
        cb?.();
      }
    }

    this.controls?.update();
    this.renderer.render(this.scene, this.camera);
  };

  private easeInOutQuart(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
  }

  /* ---------- Public API ---------- */
  /** Animate one Singmaster move (e.g. "R", "U'", "F2") */
  public animateMove(move: string, duration = 400): Promise<void> {
    return new Promise((res) => {
      if (this.animationState) {
        return res(); // ignore if busy
      }

      const face = move[0].toUpperCase() as keyof CubeState;
      const mod = move.slice(1);
      const dir = (mod.includes("'") ? -1 : 1) * this.cwDir[face];
      const turns = mod.includes("2") ? 2 : 1;
      const angle = (dir * turns * Math.PI) / 2;

      const { normal, pieces } = this.faceMapping[face];

      this.animationState = {
        axis: normal.clone(),
        angle: 0,
        targetAngle: angle,
        duration,
        startTime: Date.now(),
        affectedPieces: [...pieces],
        onComplete: () => {
          // State is now managed externally, just complete the animation
          res();
        },
      };
    });
  }

  /** Animate a whole scramble string */
  public async animateScramble(scramble: string, delay = 500) {
    const moves = scramble.trim().split(/\s+/).filter(Boolean);
    for (const mv of moves) {
      await this.animateMove(mv, delay - 150);
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  /** Replace logical state & rebuild cube visuals */
  public updateState(state: CubeState) {
    this.cubeState = {
      U: new Uint8Array(state.U) as Face,
      D: new Uint8Array(state.D) as Face,
      F: new Uint8Array(state.F) as Face,
      B: new Uint8Array(state.B) as Face,
      R: new Uint8Array(state.R) as Face,
      L: new Uint8Array(state.L) as Face,
    };
    this.buildCube();
  }

  public resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }
  public setCamera(x: number, y: number, z: number) {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, 0);
  }
  public getCameraPosition() {
    return {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z,
    };
  }
  public dispose() {
    // Stop the animation loop immediately
    this.animationState = null;

    // Force immediate context loss to free GPU resources
    try {
      const gl = this.renderer.getContext();
      const loseContext = gl?.getExtension?.("WEBGL_lose_context");
      loseContext?.loseContext();
    } catch (error) {
      console.warn("Could not force WebGL context loss:", error);
    }

    // Dispose of all piece geometries and materials aggressively
    this.pieces.forEach((p) => {
      try {
        // Remove from scene first
        this.cubeGroup.remove(p.mesh);

        // Dispose geometry
        if (p.mesh.geometry) {
          p.mesh.geometry.dispose();
        }

        // Dispose materials (handle both single material and array)
        const materials = Array.isArray(p.mesh.material)
          ? p.mesh.material
          : [p.mesh.material];
        materials.forEach((m) => {
          if (!m) return;

          // Dispose all possible textures
          const textureProperties = [
            "map",
            "normalMap",
            "bumpMap",
            "roughnessMap",
            "metalnessMap",
            "emissiveMap",
            "specularMap",
            "envMap",
            "lightMap",
            "aoMap",
            "alphaMap",
            "displacementMap",
            "gradientMap",
          ];

          textureProperties.forEach((prop) => {
            const material = m as DisposableMaterial;
            const texture = material[
              prop as keyof DisposableMaterial
            ] as Texture | null;
            if (texture && typeof texture.dispose === "function") {
              texture.dispose();
              (material as unknown as Record<string, Texture | null>)[prop] =
                null;
            }
          });

          // Dispose the material itself
          m.dispose();
        });

        // Clear mesh references
        (p.mesh as any).material = null;
        (p.mesh as any).geometry = null;
      } catch (error) {
        console.warn("Error disposing piece:", error);
      }
    });

    // Clear pieces array
    this.pieces.length = 0;

    // Remove cube group from scene and dispose
    try {
      this.scene.remove(this.cubeGroup);
      this.cubeGroup.clear();
    } catch (error) {
      console.warn("Error removing cube group:", error);
    }

    // Dispose controls
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    // Force context loss and dispose renderer
    try {
      this.renderer.forceContextLoss();
      this.renderer.dispose();
    } catch (error) {
      console.warn("Error disposing renderer:", error);
    }

    // Clear scene completely
    try {
      this.scene.clear();
      // Dispose scene children recursively
      while (this.scene.children.length > 0) {
        const child = this.scene.children[0];
        this.scene.remove(child);
        const disposableChild = child as DisposableObject;
        if (disposableChild.dispose) {
          disposableChild.dispose();
        }
      }
    } catch (error) {
      console.warn("Error clearing scene:", error);
    }
  }

  /* ---------- Index texture creation ---------- */
  private createIndexTexture(index: number, baseColor: string): CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");

    // Fill with base color
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 64, 64);

    // Add index text
    ctx.fillStyle = this.getContrastColor(baseColor);
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(index.toString(), 32, 32);

    // Add border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 62, 62);

    return new CanvasTexture(canvas);
  }

  private getContrastColor(hex: string): string {
    // Convert hex to RGB and determine if we need black or white text
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#FFFFFF";
  }

  /* ---------- Public UV mapping controls ---------- */
  public toggleIndexDisplay(): void {
    this.showIndices = !this.showIndices;
    this.buildCube(); // Rebuild with/without indices
  }

  public setIndexDisplay(show: boolean): void {
    this.showIndices = show;
    this.buildCube(); // Rebuild with/without indices
  }

  public isShowingIndices(): boolean {
    return this.showIndices;
  }

  /* ---------- internal ---------- */
}
