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
  GROWTH_DURATION_MAX
} from "./constants.js";

export function createButton() {
  return {
    col: 12,
    row: 10,
    pressed: false,
    minCount: 0
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
    throwOrigin: null,
    throwDistance: 0,
    landed: false
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
    mins,
    tiles,
    selectedTool: TOOL_TYPES.HOE
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
  min.throwOrigin = null;
  min.throwDistance = 0;
  min.landed = true;
}

export function updateMins(character, mins, button) {
  const followers = mins.filter((min) => min.state === "following");

  followers.forEach((min, index) => {
    const vector = DIRECTION_VECTORS[character.dir] || { dx: 0, dy: 0 };
    const offsetAmount = 0.7 + index * 0.25;

    const targetCol = character.col - vector.dx * offsetAmount;
    const targetRow = character.row - vector.dy * offsetAmount;

    moveToward(min, targetCol, targetRow, 0.12);
  });

  mins.forEach((min) => {
    if (min.state !== "thrown") return;

    const target = min.target || { col: button.col, row: button.row };
    moveToward(min, target.col, target.row, 0.14);

    if (min.throwOrigin) {
      min.throwDistance = Math.hypot(
        min.col - min.throwOrigin.col,
        min.row - min.throwOrigin.row
      );
    }

    const distanceToTarget = Math.hypot(min.col - target.col, min.row - target.row);
    const distanceToButton = Math.hypot(min.col - button.col, min.row - button.row);
    const reachedTarget = distanceToTarget <= 0.18;
    const reachedMaxDistance = (min.throwDistance ?? 0) >= THROW_MAX_DISTANCE;

    if (distanceToButton <= THROW_TARGET_RADIUS && (min.throwDistance ?? 0) <= THROW_MAX_DISTANCE) {
      const successChance = Math.min(
        0.95,
        THROW_SUCCESS_BASE + THROW_SUCCESS_PER_DISTANCE * (1 - distanceToButton / THROW_TARGET_RADIUS)
      );
      const succeeded = Math.random() < successChance;

      if (succeeded) {
        button.minCount += 1;
        button.pressed = button.minCount >= BUTTON_REQUIRED_MIN;
      }
    }

    if (reachedTarget || distanceToButton <= THROW_TARGET_RADIUS || reachedMaxDistance) {
      settleMin(min);
    }
  });
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

export function throwMin(character, mins, button, cursor = null) {
  const availableMin = mins.find((min) => min.state === "following");
  if (!availableMin) return null;

  const target = cursor
    ? { col: cursor.col, row: cursor.row }
    : { col: button.col, row: button.row };

  const dx = target.col - character.col;
  const dy = target.row - character.row;
  const distance = Math.hypot(dx, dy);

  const clampedDistance = Math.min(distance, THROW_MAX_DISTANCE);

  const finalTarget = {
    col: character.col + (dx / Math.max(distance, 0.0001)) * clampedDistance,
    row: character.row + (dy / Math.max(distance, 0.0001)) * clampedDistance
  };

  availableMin.state = "thrown";
  availableMin.target = finalTarget;
  availableMin.throwOrigin = { col: character.col, row: character.row };
  availableMin.throwDistance = 0;
  availableMin.landed = false;

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