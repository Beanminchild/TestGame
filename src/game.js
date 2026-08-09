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
import { TOOL_TYPES } from "./constants.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const world = createWorld();

// Default tool if none is set
if (!world.selectedTool) {
  world.selectedTool = TOOL_TYPES.MIN;
}

const { button, mins } = world;

canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();

/**
 * Updates HUD tool slots and the Min count badge
 */
function syncHUD() {
  const followingMins = mins.filter(m => m.state === "following").length;

  document.querySelectorAll(".tool-slot").forEach((slot) => {
    const toolName = slot.dataset.tool;
    const isSelected = toolName === world.selectedTool;
    slot.classList.toggle("active", isSelected);
    
    if (toolName === "min") {
      let countBadge = slot.querySelector(".item-count");
      if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.className = "item-count";
        // Basic inline styles in case CSS is missing
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

/**
 * Unified Action: ONLY throws if the Min tool is selected.
 * Otherwise, it only attempts farming actions.
 */
function handleToolAction() {
  if (world.selectedTool === "min") {
    throwMin(character, mins, button, cursor);
  } else {
    // If hoe/seeds/watering-can is selected, it will NOT throw a min if it fails
    useToolAtCursor(world, cursor);
  }
}

// Toolbar Clicks
document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", (e) => {
    e.stopPropagation(); 
    world.selectedTool = slot.dataset.tool;
    syncHUD();
  });
});

// Keyboard Shortcuts (1-4)
document.addEventListener("keydown", (event) => {
  const map = {
    Digit1: "hoe",
    Digit2: "seeds",
    Digit3: "watering-can",
    Digit4: "min"
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

// Primary Click Handler
canvas.addEventListener("click", () => {
  handleToolAction();
});

function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(character, keys, deltaMs);
  updateWorld(world, deltaMs);
  updateMins(character, mins, button, world);

  // E Key: Prioritize interaction, then tool use
  if (keys.has("KeyE")) {
    const harvested = tryHarvestCrop(character, world);
    if (!harvested) {
      const collected = tryCollectMin(character, mins);
      if (!collected) {
        const interacted = tryInteractWithButton(character, button);
        if (!interacted) {
          // Only uses tool if nothing else happened
          handleToolAction();
        }
      }
    }
    keys.delete("KeyE");
  }

  // Space/F Keys
  if (keys.has("Space") || keys.has("KeyF")) {
    handleToolAction();
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