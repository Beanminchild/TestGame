import { setupInput } from "./src/input.js";
import { createCharacter, updateCharacterFromControls, updateCamera } from "./src/character.js";
import { createSpriteBank, drawScene } from "./src/render.js";
import {
  createWorld,
  throwMin,
  tryCollectMin,
  tryInteractWithButton,
  updateMins
} from "./src/interactions.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const { button, mins } = createWorld();

canvas.style.cursor = "none";

let cursor = null;

let camera = {
  x: canvas.width / 2,
  y: 110
};

let lastFrameTime = performance.now();

function updateCursorPosition(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const worldX = (event.clientX - rect.left) * scaleX;
  const worldY = (event.clientY - rect.top) * scaleY;

  const screenX = worldX - camera.x;
  const screenY = worldY - camera.y;

  cursor = {
    col: screenX / 64 + screenY / 32,
    row: screenY / 32 - screenX / 64
  };
}

canvas.addEventListener("mousemove", updateCursorPosition);

canvas.addEventListener("click", () => {
  throwMin(character, mins, button, cursor);
});

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(character, keys, deltaMs);
  updateMins(character, mins, button);

  if (keys.has("KeyE")) {
    const collected = tryCollectMin(character, mins);
    if (!collected) {
      tryInteractWithButton(character, button);
    }
    keys.delete("KeyE");
  }

  if (keys.has("Space") || keys.has("KeyF")) {
    throwMin(character, mins, button, cursor);
    keys.delete("Space");
    keys.delete("KeyF");
  }

  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor);
requestAnimationFrame(loop);