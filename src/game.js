import { setupInput } from "./input.js";
import { createCharacter, updateCharacterFromControls, updateCamera } from "./character.js";
import { createSpriteBank, drawScene } from "./render.js";
import {
  createWorld,
  throwMin,
  tryCollectMin,
  tryInteractWithButton,
  updateMins,
  updateWorld,
  useToolAtCursor,
  tryHarvestCrop
} from "./interactions.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const world = createWorld();
const { button, mins } = world;

canvas.style.cursor = "none";

let cursor = null;

let camera = {
  x: canvas.width / 2,
  y: 110
};

let lastFrameTime = performance.now();

function syncHUD() {
  document.querySelectorAll(".tool-slot").forEach((slot) => {
    slot.classList.toggle("active", slot.dataset.tool === world.selectedTool);
  });
  
  const countDisplay = document.getElementById("crop-count");
  if (countDisplay) {
    countDisplay.textContent = world.cropsCollected;
  }
}

document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", () => {
    world.selectedTool = slot.dataset.tool;
    syncHUD();
  });
});

document.addEventListener("keydown", (event) => {
  const map = {
    Digit1: "hoe",
    Digit2: "seeds",
    Digit3: "watering-can"
  };

  const tool = map[event.code];
  if (tool) {
    world.selectedTool = tool;
    syncHUD();
  }
});

syncHUD();

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
  const usedTool = useToolAtCursor(world, cursor);
  if (!usedTool) {
    throwMin(character, mins, button, cursor);
  }
});

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(character, keys, deltaMs);
  updateWorld(world, deltaMs);
  updateMins(character, mins, button, world);

  if (keys.has("KeyE")) {
    const harvested = tryHarvestCrop(character, world);
    if (!harvested) {
      const collected = tryCollectMin(character, mins);
      if (!collected) {
        tryInteractWithButton(character, button);
      }
    }
    keys.delete("KeyE");
  }

  if (keys.has("Space") || keys.has("KeyF")) {
    throwMin(character, mins, button, cursor);
    keys.delete("Space");
    keys.delete("KeyF");
  }

  syncHUD();
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world);
requestAnimationFrame(loop);