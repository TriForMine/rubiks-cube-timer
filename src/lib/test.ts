import {
  applyMove,
  applyScramble,
  applyScrambleToCube,
  createSolvedCube,
  isCubeSolved,
} from "./cube-simulation";

const cube = createSolvedCube();
applyScrambleToCube(cube, "R U R' U'");
applyScrambleToCube(cube, "R U R' U'");
applyScrambleToCube(cube, "R U R' U'");
applyScrambleToCube(cube, "R U R' U'");
applyScrambleToCube(cube, "R U R' U'");
applyScrambleToCube(cube, "R U R' U'");
console.log("Scrambled cube:", cube);
const ok = isCubeSolved(cube);
console.log("Cube solved:", ok);
