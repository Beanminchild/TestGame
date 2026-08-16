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
  tryDepositToDominion,
  tryInteractWithPond,
  tryInteractWithShop,
  spawnNewMin
} from "./interactions.js";
import { TOOL_TYPES, SHOPKEEPER_LOOK, SHOPKEEPER_COL, SHOPKEEPER_ROW } from "./constants.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const keys = setupInput();
const character = createCharacter();
const spriteBank = createSpriteBank();
const shopkeeper = createCharacter();
shopkeeper.col = SHOPKEEPER_COL;
shopkeeper.row = SHOPKEEPER_ROW;
const shopkeeperSpriteBank = createSpriteBank(SHOPKEEPER_LOOK, { showPigtails: false });
const world = createWorld();
world.shopkeeper = shopkeeper;

if (!world.selectedTool) {
  world.selectedTool = TOOL_TYPES.MIN;
}

const { button, mins } = world;

const resultsScreen = document.getElementById("results-screen");
const resultsCollected = document.getElementById("results-collected");
const resultsPayout = document.getElementById("results-payout");
const resultsWallet = document.getElementById("results-wallet");
const nextDayButton = document.getElementById("next-day-button");
const shopOverlay = document.getElementById("shop-overlay");

canvas.style.cursor = "none";
let cursor = null;
let camera = { x: canvas.width / 2, y: 110 };
let lastFrameTime = performance.now();

function updateClock() {
  const hand = document.getElementById("clock-hand");
  if (!hand) return;

  const phase = Math.min(Math.max(world.dayProgress || 0, 0), 1);
  const angle = 180 + (phase * 180);

  hand.style.transform = `translate(0, -50%) rotate(${angle}deg)`;
}

function openShop() {
  if (shopOverlay) {
    shopOverlay.classList.remove("hidden");
  }
}

function closeShop() {
  if (shopOverlay) {
    shopOverlay.classList.add("hidden");
  }
  world.shopOpen = false;
}

function buyShopItem(item) {
  const priceMap = {
    seeds: 5,
    min: 35
  };

  const price = priceMap[item];
  if (!price || world.wallet < price) return;

  world.wallet -= price;

  if (item === "seeds") {
    world.selectedTool = "seeds";
    world.seedInventory = (world.seedInventory || 0) + 1;
  }

  if (item === "min") {
    world.selectedTool = "min";
    world.minInventory = (world.minInventory || 0) + 1;
    spawnNewMin(world.mins, world.dominion.col, world.dominion.row, "following");
  }

  closeShop();
  syncHUD();
}

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

    if (toolName === "watering-can") {
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
      countBadge.textContent = world.waterCanFillAmount;
    }
    if (toolName === "seeds") {
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
      countBadge.textContent = world.seedInventory || 0;
    }
  });

  const countDisplay = document.getElementById("crop-count");
  if (countDisplay) {
    countDisplay.textContent = world.cropsCollected;
  }

  const walletDisplay = document.getElementById("wallet-amount");
  if (walletDisplay) {
    walletDisplay.textContent = `${world.wallet}g`;
  }

  updateClock();
}

function handleToolAction() {
  if (world.dayEnded) return;

  if (world.selectedTool === "min") {
    throwMin(character, mins, button, world.box, cursor);
  } else if (world.selectedTool === "empty-hands") {
    const harvested = tryHarvestCrop(character, world);
    if (!harvested) {
      tryTakeCropFromMin(character, mins);
    }
  } else {
    useToolAtCursor(world, cursor);
  }
}

function endDay() {
  if (world.dayEnded) return;

  world.dayEnded = true;
  const payout = world.cropsCollected * 25;
  world.wallet += payout;

  if (resultsCollected) resultsCollected.textContent = String(world.cropsCollected);
  if (resultsPayout) resultsPayout.textContent = `${payout}g`;
  if (resultsWallet) resultsWallet.textContent = `${world.wallet}g`;

  if (resultsScreen) resultsScreen.classList.remove("hidden");
  syncHUD();
}

function startNextDay() {
  world.dayElapsedMs = 0;
  world.dayProgress = 0;
  world.dayEnded = false;
  world.cropsCollected = 0;

  button.pressed = false;
  button.minCount = 0;

  if (resultsScreen) resultsScreen.classList.add("hidden");
  syncHUD();
}

document.querySelectorAll(".tool-slot").forEach((slot) => {
  slot.addEventListener("click", (e) => {
    e.stopPropagation();
    world.selectedTool = slot.dataset.tool;
    syncHUD();
  });
});

document.querySelectorAll(".shop-button").forEach((button) => {
  button.addEventListener("click", () => {
    buyShopItem(button.dataset.buyItem);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && world.shopOpen) {
    closeShop();
    return;
  }
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

if (nextDayButton) {
  nextDayButton.addEventListener("click", startNextDay);
}

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

  if (!world.dayEnded) {
    world.dayElapsedMs += deltaMs;
    world.dayProgress = Math.min(world.dayElapsedMs / world.dayLengthMs, 1);

    if (world.dayProgress >= 1) {
      endDay();
    }
  }

  if (!world.dayEnded) {
    updateCharacterFromControls(character, keys, deltaMs);
    updateWorld(world, deltaMs, character);
    updateMins(character, mins, button, world);

    if (keys.has("KeyE") || keys.has("Space")) {
      let interacted = tryDepositCrop(character, world.box, world);

      if (!interacted) {
        interacted = tryDepositToDominion(character, world.dominion, world, mins);
      }

      if (!interacted) {
        interacted = tryInteractWithPond(character, world);
      }

      if (!interacted && !world.shopOpen) {
        interacted = tryInteractWithShop(character, world);
        if (interacted) {
          openShop();
        }
      }

      if (!interacted) {
        const collected = tryCollectMin(character, mins);
        if (!collected) {
          const buttonInteracted = tryInteractWithButton(character, button);
          if (!buttonInteracted) {
            const harvested = tryHarvestCrop(character, world);
            if (!harvested) {
              tryTakeCropFromMin(character, mins);
            }
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
  }

  syncHUD();
  camera = updateCamera(canvas, character);
  drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world, shopkeeper, shopkeeperSpriteBank);

  requestAnimationFrame(loop);
}

drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world, shopkeeper, shopkeeperSpriteBank);
requestAnimationFrame(loop);