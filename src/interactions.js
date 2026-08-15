import {
  BUTTON_REQUIRED_MIN,
  MIN_SPAWN_COUNT,
  MIN_INTERACTION_RADIUS,
  BUTTON_INTERACTION_RADIUS,
  DIRECTION_VECTORS,
  THROW_TARGET_RADIUS,
  THROW_SUCCESS_BASE,
  THROW_SUCCESS_PER_DISTANCE,
  THROW_MAX_DISTANCE,
  cols,
  rows,
  TOOL_TYPES,
  TILE_TYPES,
  PLANT_STAGES,
  GROWTH_DURATION_MIN,
  GROWTH_DURATION_MAX,
  BOX_COL,
  BOX_ROW,
  BOX_INTERACTION_RADIUS,
  DOMINION_COL,
  DOMINION_ROW,
  DOMINION_INTERACTION_RADIUS,
 
} from "./constants.js";

let waterCanFillAmount = 5;

export function createButton() {
  return {
    col: 12,
    row: 10,
    pressed: false,
    minCount: 0
  };
}

export function createBox() {
  return {
    col: BOX_COL,
    row: BOX_ROW
  };
}

export function createDominion() {
  return {
    col: DOMINION_COL,
    row: DOMINION_ROW
  };
}

export function createWorld() {
  const mins = Array.from({ length: MIN_SPAWN_COUNT }, (_, index) => ({
    id: index + 1,
    col: 3 + (index % 3) * 4,
    row: 3 + Math.floor(index / 3) * 3,
    state: "loose",
    followIndex: 0,
    target: null,
    targetTile: null,
    throwOrigin: null,
    throwDistance: 0,
    landed: false,
    isDelivering: false
  }));

  const tiles = Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      type: TILE_TYPES.GRASS,
      planted: false,
      watered: false,
      growth: 0,
      growDuration: GROWTH_DURATION_MIN + Math.random() * (GROWTH_DURATION_MAX - GROWTH_DURATION_MIN),
      stage: PLANT_STAGES.EMPTY
    }))
  );

  return {
    button: createButton(),
    box: createBox(),
    dominion: createDominion(),
    mins,
    tiles,
    selectedTool: TOOL_TYPES.HOE,
    cropsCollected: 0,
    waterCanFillAmount: 5
  };
}

function moveToward(min, targetCol, targetRow, speed = 0.12) {
  const dx = targetCol - min.col;
  const dy = targetRow - min.row;
  const distance = Math.hypot(dx, dy);

  if (distance > 0.01) {
    const step = Math.min(speed, distance);
    min.col += (dx / distance) * step;
    min.row += (dy / distance) * step;
  }
}

function settleMin(min) {
  min.state = "loose";
  min.target = null;
  min.targetTile = null;
  min.throwOrigin = null;
  min.throwDistance = 0;
  min.landed = true;
  min.isDelivering = false;
}

export function spawnNewMin(mins, col, row, initialState = "loose") {
  const newMin = {
    id: Date.now() + Math.random(),
    col: col,
    row: row,
    state: initialState,
    followIndex: 0,
    target: null,
    targetTile: null,
    throwOrigin: null,
    throwDistance: 0,
    landed: false,
    isDelivering: false
  };
  mins.push(newMin);
  return newMin;
}

export function updateMins(character, mins, button, world) {
  const { box, dominion } = world;

  // 1. Sort followers so that those carrying crops are at the front of the line
  const followers = mins.filter((min) => min.state === "following" || min.state === "carrying");
  followers.sort((a, b) => {
    if (a.state === "carrying" && b.state !== "carrying") return -1;
    if (a.state !== "carrying" && b.state === "carrying") return 1;
    return 0;
  });

  followers.forEach((min, index) => {
    const vector = DIRECTION_VECTORS[character.dir] || { dx: 0, dy: 0 };
    const offsetAmount = 0.7 + index * 0.25;

    const targetCol = character.col - vector.dx * offsetAmount;
    const targetRow = character.row - vector.dy * offsetAmount;

    moveToward(min, targetCol, targetRow, 0.12);
  });

  mins.forEach((min) => {
    // --- Dominion Automation Logic ---
    if (min.state === "thrown") {
      const distToDominion = Math.hypot(min.col - dominion.col, min.row - dominion.row);
      // If loose within radius (e.g. 3.0) and box has crops
      if (distToDominion < 1.5 && world.cropsCollected > 0 && world.selectedTool === "min") {
        min.state = "going_to_box";
      }
    }

    if (min.state === "going_to_box") {
      moveToward(min, box.col, box.row, 0.14);
      if (Math.hypot(min.col - box.col, min.row - box.row) < 0.2) {
        if (world.cropsCollected > 0) {
          world.cropsCollected--;
          min.state = "returning_to_dominion";
        } else {
          min.state = "loose";
        }
      }
    }

    if (min.state === "returning_to_dominion") {
      moveToward(min, dominion.col, dominion.row, 0.14);
      if (Math.hypot(min.col - dominion.col, min.row - dominion.row) < 0.2) {
        // Create new min
        spawnNewMin(mins, dominion.col, dominion.row, "following");
        // Original min also follows
        min.state = "following";
      }
    }

    // --- Standard Actions ---
    if (min.state === "thrown") {
      const target = min.isDelivering 
        ? { col: world.box.col, row: world.box.row }
        : (min.target || { col: button.col, row: button.row });

      moveToward(min, target.col, target.row, 0.14);

      if (min.throwOrigin && !min.isDelivering) {
        min.throwDistance = Math.hypot(
          min.col - min.throwOrigin.col,
          min.row - min.throwOrigin.row
        );
      }

      const distanceToTarget = Math.hypot(min.col - target.col, min.row - target.row);
      const reachedTarget = distanceToTarget <= 0.18;

      if (min.isDelivering && reachedTarget) {
        world.cropsCollected += 1;
        min.state = "following";
        min.isDelivering = false;
        return;
      }

      const distanceToButton = Math.hypot(min.col - button.col, min.row - button.row);
      if (!min.isDelivering && distanceToButton <= THROW_TARGET_RADIUS && (min.throwDistance ?? 0) <= THROW_MAX_DISTANCE) {
        const successChance = Math.min(
          0.95,
          THROW_SUCCESS_BASE + THROW_SUCCESS_PER_DISTANCE * (1 - distanceToButton / THROW_TARGET_RADIUS)
        );
        if (Math.random() < successChance) {
          button.minCount += 1;
          button.pressed = button.minCount >= BUTTON_REQUIRED_MIN;
          settleMin(min);
          return;
        }
      }

      if (reachedTarget || (!min.isDelivering && (min.throwDistance ?? 0) >= THROW_MAX_DISTANCE)) {
        const tCol = Math.floor(target.col);
        const tRow = Math.floor(target.row);
        const tile = world.tiles[tRow]?.[tCol];

        if (!min.isDelivering && tile && tile.planted) {
          min.state = "harvesting";
          min.targetTile = { col: tCol, row: tRow };
          min.col = tCol + 0.5;
          min.row = tRow + 0.5;
        } else if (!min.isDelivering) {
          settleMin(min);
        }
      }
    }

    if (min.state === "harvesting") {
      const tile = world.tiles[min.targetTile.row][min.targetTile.col];
      if (tile.stage === PLANT_STAGES.CROP) {
        tile.planted = false;
        tile.watered = false;
        tile.growth = 0;
        tile.stage = PLANT_STAGES.EMPTY;
        tile.type = TILE_TYPES.DIRT;
        min.state = "carrying";
        min.targetTile = null;
      }
    }
  });
}

export function tryDepositCrop(character, box, world) {
  if (!character.holdingCrop) return false;

  const distance = Math.hypot(character.col - box.col, character.row - box.row);
  if (distance <= BOX_INTERACTION_RADIUS) {
    character.holdingCrop = false;
    world.cropsCollected += 1;
    return true;
  }
  return false;
}

export function tryDepositToDominion(character, dominion, world, mins) {
  if (!character.holdingCrop) return false;

  const distance = Math.hypot(character.col - dominion.col, character.row - dominion.row);
  if (distance <= DOMINION_INTERACTION_RADIUS) {
    character.holdingCrop = false;
    spawnNewMin(mins, dominion.col, dominion.row, "loose");
    return true;
  }
  return false;
}

export function tryHarvestCrop(character, world) {
  if (character.holdingCrop) return false;

  const c = Math.floor(character.col);
  const r = Math.floor(character.row);

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const tr = r + dy;
      const tc = c + dx;
      const tile = world.tiles[tr]?.[tc];

      if (tile && tile.stage === PLANT_STAGES.CROP) {
        tile.planted = false;
        tile.watered = false;
        tile.growth = 0;
        tile.stage = PLANT_STAGES.EMPTY;
        tile.type = TILE_TYPES.DIRT;
        character.holdingCrop = true;
        return true;
      }
    }
  }
  return false;
}

export function tryTakeCropFromMin(character, mins) {
  if (character.holdingCrop) return false;

  for (const min of mins) {
    if (min.state !== "carrying") continue;

    const distance = Math.hypot(min.col - character.col, min.row - character.row);
    if (distance <= MIN_INTERACTION_RADIUS) {
      min.state = "following";
      character.holdingCrop = true;
      return true;
    }
  }
  return false;
}

export function tryCollectMin(character, mins) {
  for (const min of mins) {
    if (min.state !== "loose") continue;

    const distance = Math.hypot(min.col - character.col, min.row - character.row);

    if (distance <= MIN_INTERACTION_RADIUS) {
      min.state = "following";
      min.target = null;
      min.landed = false;
      min.throwDistance = 0;
      min.throwOrigin = null;
      return min;
    }
  }
  return null;
}

export function tryInteractWithButton(character, button) {
  const distance = Math.hypot(character.col - button.col, character.row - button.row);
  if (distance <= BUTTON_INTERACTION_RADIUS) {
    button.pressed = true;
    return true;
  }
  return false;
}

export function throwMin(character, mins, button, box, cursor = null) {
  const availableMin = mins.find((min) => min.state === "carrying") || 
                       mins.find((min) => min.state === "following");
  
  if (!availableMin) return null;

  availableMin.throwOrigin = { col: character.col, row: character.row };
  availableMin.throwDistance = 0;
  availableMin.landed = false;

  if (availableMin.state === "carrying") {
    availableMin.state = "thrown";
    availableMin.isDelivering = true;
    availableMin.target = { col: box.col, row: box.row };
  } else {
    availableMin.isDelivering = false;
    const target = cursor
      ? { col: cursor.col, row: cursor.row }
      : { col: button.col, row: button.row };

    const dx = target.col - character.col;
    const dy = target.row - character.row;
    const distance = Math.hypot(dx, dy);
    const clampedDistance = Math.min(distance, THROW_MAX_DISTANCE);

    availableMin.target = {
      col: character.col + (dx / Math.max(distance, 0.0001)) * clampedDistance,
      row: character.row + (dy / Math.max(distance, 0.0001)) * clampedDistance
    };
    availableMin.state = "thrown";
  }

  return availableMin;
}

function clampTileValue(value, max) {
  return Math.max(0, Math.min(max - 1, Math.floor(value)));
}

export function useToolAtCursor(world, cursor) {
  if (!cursor) return false;
  const col = clampTileValue(cursor.col, cols);
  const row = clampTileValue(cursor.row, rows);
  const tile = world.tiles[row][col];
  if (!tile) return false;

  if (world.selectedTool === TOOL_TYPES.HOE) {
    tile.type = TILE_TYPES.DIRT;
    tile.planted = false;
    tile.watered = false;
    tile.growth = 0;
    tile.stage = PLANT_STAGES.EMPTY;
    return true;
  }

  if (world.selectedTool === TOOL_TYPES.SEEDS) {
    if (tile.type === TILE_TYPES.DIRT && !tile.planted) {
      tile.planted = true;
      tile.watered = false;
      tile.growth = 0;
      tile.growDuration = GROWTH_DURATION_MIN + Math.random() * (GROWTH_DURATION_MAX - GROWTH_DURATION_MIN);
      tile.stage = PLANT_STAGES.SEED;
      return true;
    }
    return false;
  }

  if (world.selectedTool === TOOL_TYPES.WATERING_CAN) {
    if (tile.planted) {
      tile.watered = true;
      world.waterCanFillAmount-=1;
      
      return true;
    }
    return false;
  }

  return false;
}

export function updateWorld(world, deltaMs) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const tile = world.tiles[row][col];
      if (!tile.planted || !tile.watered || tile.stage === PLANT_STAGES.CROP) continue;
      tile.growth += deltaMs;
      if (tile.growth >= tile.growDuration) {
        tile.stage = PLANT_STAGES.CROP;
      } else if (tile.growth >= tile.growDuration * 0.6) {
        tile.stage = PLANT_STAGES.SPROUT;
      } else {
        tile.stage = PLANT_STAGES.SEED;
      }
    }
  }
}