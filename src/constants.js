export const cols = 24;
export const rows = 24;
export const TILE_W = 64;
export const TILE_H = 32;

export const moveStepSize = 0.25;
export const moveStepMs = 60;

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