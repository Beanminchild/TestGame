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
  tryHarvestCrop,
  tryTakeCropFromMin,
  tryDepositCrop,
  tryDepositToDominion
} from "./interactions.js";
import { TOOL_TYPES } from "./constants.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const world = createWorld();

if (!world.selectedTool) {
  world.selectedTool = TOOL_TYPES.MIN;
}

const { button, mins } = world;

canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();

function syncHUD() {
  const followingMins = mins.filter(m => m.state === "following" || m.state === "carrying").length;

  document.querySelectorAll(".tool-slot").forEach((slot) => {
    const toolName = slot.dataset.tool;
    const isSelected = toolName === world.selectedTool;
    slot.classList.toggle("active", isSelected);
    
    if (toolName === "min") {
      let countBadge = slot.querySelector(".item-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "item-count";
        Object.assign(countBadge.style, {
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          background: 'rgba(0,0,0,0.6)',
          color: 'white',
          padding: '0 4px',
          borderRadius: '4px',
          fontSize: '10px',
          pointerEvents: 'none'
        });
        slot.style.position = 'relative';
        slot.appendChild(countBadge);
      }
      countBadge.textContent = followingMins;
    }
  });
  
  const countDisplay = document.getElementById("crop-count");
  if (countDisplay) {
    countDisplay.textContent = world.cropsCollected;
  }
}

function handleToolAction() {
  if (world.selectedTool === "min") {
    throwMin(character, mins, button, world.box, cursor);
  } if (world.selectedTool == "empty-hands"){
      const harvested = tryHarvestCrop(character, world);
      if (!harvested) {
        const tookFromMin = tryTakeCropFromMin(character, mins);
        if (!tookFromMin) {
          
  } } }else {
    useToolAtCursor(world, cursor);
    }
  }

document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", (e) => {
    e.stopPropagation(); 
    world.selectedTool = slot.dataset.tool;
    syncHUD();
  });
});

document.addEventListener("keydown", (event) => {
  const map = {
    Digit1: "hoe",
    Digit2: "seeds",
    Digit3: "watering-can",
    Digit4: "min",
    Digit5: "empty-hands"
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
  handleToolAction();
});

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(character, keys, deltaMs);
  updateWorld(world, deltaMs);
  updateMins(character, mins, button, world);

  if (keys.has("KeyE") || keys.has("Space")) {
    let interacted = tryDepositCrop(character, world.box, world);
    
    if (!interacted) {
      interacted = tryDepositToDominion(character, world.dominion, world, mins);
    }

    if (!interacted) {     
          const collected = tryCollectMin(character, mins);
          if (!collected) {
            const buttonInteracted = tryInteractWithButton(character, button);
            if (!buttonInteracted) {
              handleToolAction();
            }
          }     
    }
    keys.delete("KeyE");
    keys.delete("Space");
  }

  if (keys.has("KeyF")) {
    handleToolAction();
    keys.delete("KeyF");
  }

  syncHUD();
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world);
requestAnimationFrame(loop);