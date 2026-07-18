export const cols = 24;
export const rows = 24;
export const TILE_W = 64;
export const TILE_H = 32;

export const moveStepSize = 0.25;
export const moveStepMs = 60;

export const BUTTON_REQUIRED_MIN = 3;
export const MIN_SPAWN_COUNT = 5;
export const MIN_INTERACTION_RADIUS = 1.2;
export const BUTTON_INTERACTION_RADIUS = 1.2;
export const HARVEST_RADIUS = 1.0;

export const THROW_TARGET_RADIUS = 2.4;
export const THROW_SUCCESS_BASE = 0.5;
export const THROW_SUCCESS_PER_DISTANCE = 0.08;
export const THROW_MAX_DISTANCE = 8;

export const TOOL_TYPES = {
  HOE: "hoe",
  SEEDS: "seeds",
  WATERING_CAN: "watering-can"
};

export const TILE_TYPES = {
  GRASS: "grass",
  DIRT: "dirt"
};

export const PLANT_STAGES = {
  EMPTY: "empty",
  SEED: "seed",
  SPROUT: "sprout",
  CROP: "crop"
};

export const GROWTH_DURATION_MIN = 4000;
export const GROWTH_DURATION_MAX = 9000;

export const INV_SQRT2 = 1 / Math.sqrt(2);

export const DIRECTION_VECTORS = [
  { dx: 1, dy: 0 },
  { dx: INV_SQRT2, dy: INV_SQRT2 },
  { dx: 0, dy: 1 },
  { dx: -INV_SQRT2, dy: INV_SQRT2 },
  { dx: -1, dy: 0 },
  { dx: -INV_SQRT2, dy: -INV_SQRT2 },
  { dx: 0, dy: -1 },
  { dx: INV_SQRT2, dy: -INV_SQRT2 }
];

export const WALK_POSES = [
  { armSwing: -7, legSwing: 8 },
  { armSwing: -3.5, legSwing: 4 },
  { armSwing: 0, legSwing: 0 },
  { armSwing: 3.5, legSwing: -4 },
  { armSwing: 7, legSwing: -8 }
];

export const DIRECTION_STYLES = [
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: 2, bodyOffsetY: 1, headOffsetX: 1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 2, headOffsetX: 0, headOffsetY: 1 },
  { bodyOffsetX: -2, bodyOffsetY: 1, headOffsetX: -1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: -2, bodyOffsetY: -1, headOffsetX: -1, headOffsetY: -1 },
  { bodyOffsetX: 0, bodyOffsetY: -2, headOffsetX: 0, headOffsetY: -1 },
  { bodyOffsetX: 2, bodyOffsetY: -1, headOffsetX: 1, headOffsetY: -1 }
];

export const PLACEHOLDER_LOOK = {
  hair: "#4a2f20",
  skin: "#f2c59c",
  coat: "#5b78d9",
  pants: "#263140",
  trim: "#f4d683",
  boots: "#1e2430",
  scarf: "#c95f5f"
};