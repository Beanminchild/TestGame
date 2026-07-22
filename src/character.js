import { cols, rows, DIRECTION_VECTORS, moveStepSize, moveStepMs } from "./constants.js";

export function createCharacter() {
  return {
    col: Math.floor(cols / 2),
    row: Math.floor(rows / 2),
    dir: 0,
    walkFrame: 0,
    stepCounter: 0
  };
}

export function clampCharacter(character) {
  character.col = Math.max(0, Math.min(cols - 1, character.col));
  character.row = Math.max(0, Math.min(rows - 1, character.row));
}

export function getDirectionIndex(dx, dy, currentDir) {
  if (dx > 0 && dy === 0) return 0;
  if (dx > 0 && dy > 0) return 1;
  if (dx === 0 && dy > 0) return 2;
  if (dx < 0 && dy > 0) return 3;
  if (dx < 0 && dy === 0) return 4;
  if (dx < 0 && dy < 0) return 5;
  if (dx === 0 && dy < 0) return 6;
  if (dx > 0 && dy < 0) return 7;
  return currentDir;
}

export function updateCharacterFromControls(character, keys, deltaMs) {
  const dx = (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) - (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
  const dy = (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) - (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);

  if (dx !== 0 || dy !== 0) {
    character.stepCounter += deltaMs;

    while (character.stepCounter >= moveStepMs) {
      const dirIndex = getDirectionIndex(dx, dy, character.dir);
      const vector = DIRECTION_VECTORS[dirIndex];

      character.col += vector.dx * moveStepSize;
      character.row += vector.dy * moveStepSize;
      clampCharacter(character);

      character.dir = dirIndex;
      character.walkFrame = (character.walkFrame + 1) % 2;
      character.stepCounter -= moveStepMs;
    }
  } else {
    character.walkFrame = 0;
  }
}

export function updateCamera(canvas, character) {
  const charScreenPos = {
    x: (character.col - character.row) * 32,
    y: (character.col + character.row) * 16
  };

  return {
    x: canvas.width / 2 - charScreenPos.x,
    y: canvas.height / 2 - charScreenPos.y
  };
}