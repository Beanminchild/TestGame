import { setupInput } from "./src/input.js";
import { createCharacter, updateCharacterFromControls, updateCamera } from "./src/character.js";
import { createSpriteBank, drawScene } from "./src/render.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();

let camera = {
  x: canvas.width / 2,
  y: 110
};

let lastFrameTime = performance.now();

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(character, keys, deltaMs);
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera);
requestAnimationFrame(loop);