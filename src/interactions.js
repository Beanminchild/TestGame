//TO DO FIX IT SO THEY COME BACK AFTER INTERACTINGV WITH A BUTTON AND ALOS THEY WALK TOWARD THE BUTTON AUTOMATIALLY 



import {
  BUTTON_REQUIRED_MIN,
  MIN_SPAWN_COUNT,
  MIN_INTERACTION_RADIUS,
  BUTTON_INTERACTION_RADIUS,
  DIRECTION_VECTORS,
  THROW_TARGET_RADIUS,
  THROW_SUCCESS_BASE,
  THROW_SUCCESS_PER_DISTANCE,
  THROW_MAX_DISTANCE
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

  return {
    button: createButton(),
    mins
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