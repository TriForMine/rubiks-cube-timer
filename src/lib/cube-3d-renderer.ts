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
} from "three";
import { applyMove, type CubeState, getDisplayHex } from "./cube-simulation";

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
type FaceArr = Uint8Array & { length: 9 };

/* ---------- Renderer class ---------- */
export class Cube3DRenderer {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private cubeGroup: Group;
  private pieces: CubePiece[] = [];
  private animationState: AnimationState | null = null;
  private cubeState: CubeState;

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
  constructor(canvas: HTMLCanvasElement, initialState: CubeState) {
    this.cubeState = this.cloneState(initialState);

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

  private cloneState(s: CubeState): CubeState {
    return {
      U: new Uint8Array(s.U) as FaceArr,
      D: new Uint8Array(s.D) as FaceArr,
      F: new Uint8Array(s.F) as FaceArr,
      B: new Uint8Array(s.B) as FaceArr,
      R: new Uint8Array(s.R) as FaceArr,
      L: new Uint8Array(s.L) as FaceArr,
    };
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
      return new MeshLambertMaterial({ color: getDisplayHex(col) });
    });
  }

  /* position → sticker index 0-8 for a face */
  private faceIndex(p: Vector3, f: keyof CubeState): number {
    const { x, y, z } = p;
    switch (f) {
      case "F":
        return (1 - y) * 3 + (x + 1);
      case "B":
        return (1 - y) * 3 + (1 - x);
      /* ⬇️  corrected rows for U & D */
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

      const rotM = new Matrix4().makeRotationAxis(axis, delta);
      this.animationState.affectedPieces.forEach((pc) => {
        pc.mesh.position.applyMatrix4(rotM);
        pc.mesh.rotateOnAxis(axis, delta);
      });
      this.animationState.angle = newAngle;

      if (t === 1) {
        const cb = this.animationState.onComplete;
        this.animationState = null;
        cb?.();
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private easeInOutQuart(t: number) {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  }

  /* ---------- Public API ---------- */
  /** Animate one Singmaster move (e.g. "R", "U'", "F2") */
  public animateMove(move: string, duration = 400): Promise<void> {
    return new Promise((res) => {
      if (this.animationState) return res(); // ignore if busy

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
          this.updateCubeState(move);
          this.buildCube(); // rebuild with new sticker colours
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
    this.cubeState = this.cloneState(state);
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
    this.pieces.forEach((p) => {
      p.mesh.geometry.dispose();
      (Array.isArray(p.mesh.material)
        ? p.mesh.material
        : [p.mesh.material]
      ).forEach((m) => m.dispose());
    });
    this.renderer.dispose();
  }

  /* ---------- internal ---------- */
  private updateCubeState(move: string) {
    const s = this.cloneState(this.cubeState);
    applyMove(s, move);
    this.cubeState = s;
  }
}
