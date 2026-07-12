const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const cols = 24;
const rows = 24;
const TILE_W = 64; 
const TILE_H = 32;
const mapOriginX = canvas.width / 2;
const mapOriginY = 110;

const keys = new Set();
let lastMoveTime = 0;
const moveInterval = 60; //was 110

const character = {
  col: Math.floor(cols / 2),
  row: Math.floor(rows / 2),
  dir: 0,
  walkFrame: 0,
  stepCounter: 0
};

const INV_SQRT2 = 1 / Math.sqrt(2); // 0.7071067811865475 approximatets half speed for diagonal movment values

const DIRECTION_VECTORS = [
  { dx: .5, dy: 0 },
  { dx: INV_SQRT2, dy: INV_SQRT2 },
  { dx: 0, dy: .5 },
  { dx: -.5, dy: .5 },
  { dx: -1, dy: 0 },
  { dx: -.5, dy: -.5 },
  { dx: 0, dy: -.5 },
  { dx: .5, dy: -.5 }
];

const WALK_POSES = [
  { armSwing: -7, legSwing: 8, torsoShiftX: 0, torsoShiftY: 0 },
  { armSwing: 7, legSwing: -8, torsoShiftX: 0, torsoShiftY: 1 }
];

const DIRECTION_STYLES = [
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: 2, bodyOffsetY: 1, headOffsetX: 1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 2, headOffsetX: 0, headOffsetY: 1 },
  { bodyOffsetX: -2, bodyOffsetY: 1, headOffsetX: -1, headOffsetY: 0 },
  { bodyOffsetX: 0, bodyOffsetY: 0, headOffsetX: 0, headOffsetY: 0 },
  { bodyOffsetX: -2, bodyOffsetY: -1, headOffsetX: -1, headOffsetY: -1 },
  { bodyOffsetX: 0, bodyOffsetY: -2, headOffsetX: 0, headOffsetY: -1 },
  { bodyOffsetX: 2, bodyOffsetY: -1, headOffsetX: 1, headOffsetY: -1 }
];

const PLACEHOLDER_LOOK = {
  hair: "#4a2f20",
  skin: "#f2c59c",
  coat: "#5b78d9",
  pants: "#263140",
  trim: "#f4d683",
  boots: "#1e2430",
  scarf: "#c95f5f"
};

function isoToScreen(col, row) {
  return {
    x: mapOriginX + (col - row) * (TILE_W / 2),
    y: mapOriginY + (col + row) * (TILE_H / 2)
  };
}

function clampCharacter() {
  character.col = Math.max(0, Math.min(cols - 1, character.col));
  character.row = Math.max(0, Math.min(rows - 1, character.row));
}

function getDirectionIndex(dx, dy) {
  if (dx > 0 && dy === 0) return 0;
  if (dx > 0 && dy > 0) return 1;
  if (dx === 0 && dy > 0) return 2;
  if (dx < 0 && dy > 0) return 3;
  if (dx < 0 && dy === 0) return 4;
  if (dx < 0 && dy < 0) return 5;
  if (dx === 0 && dy < 0) return 6;
  if (dx > 0 && dy < 0) return 7;
  return character.dir;
}

function drawGrassTile(col, row) {
  const p = isoToScreen(col, row);
  const shade = (col + row) % 3;
  const grassColors = ["#5a8737", "#6da145", "#547e30"];

  ctx.beginPath();
  ctx.moveTo(p.x, p.y - TILE_H / 2);
  ctx.lineTo(p.x + TILE_W / 2, p.y);
  ctx.lineTo(p.x, p.y + TILE_H / 2);
  ctx.lineTo(p.x - TILE_W / 2, p.y);
  ctx.closePath();

  ctx.fillStyle = grassColors[shade];
  ctx.fill();
  ctx.strokeStyle = "#29451f";
  ctx.lineWidth = 1.25;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(p.x - 8, p.y - 4, 16, 2);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(p.x - 10, p.y + 3, 20, 1);
}

function buildSpriteFrame(directionIndex, frameIndex) {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d");

  const walkPose = WALK_POSES[frameIndex];
  const style = DIRECTION_STYLES[directionIndex];

  g.fillStyle = "rgba(0,0,0,0.28)";
  g.beginPath();
  g.ellipse(32, 50, 18, 8, 0, 0, Math.PI * 2);
  g.fill();

  const shirtX = 24 + style.bodyOffsetX;
  const shirtY = 18 + style.bodyOffsetY;

  g.fillStyle = PLACEHOLDER_LOOK.hair;
  g.fillRect(24 + style.headOffsetX, 4 + style.headOffsetY, 16, 5);

  g.fillStyle = PLACEHOLDER_LOOK.skin;
  g.beginPath();
  g.arc(32 + style.headOffsetX, 13 + style.headOffsetY, 8, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = PLACEHOLDER_LOOK.coat;
  g.fillRect(shirtX, shirtY, 16, 18);

  g.fillStyle = PLACEHOLDER_LOOK.trim;
  g.fillRect(shirtX + 3, shirtY + 15, 10, 2);

  g.strokeStyle = PLACEHOLDER_LOOK.scarf;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(24 + style.bodyOffsetX, 25 + style.bodyOffsetY);
  g.lineTo(40 + style.bodyOffsetX, 25 + style.bodyOffsetY);
  g.stroke();

  g.strokeStyle = PLACEHOLDER_LOOK.trim;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(24 + style.bodyOffsetX, 24 + style.bodyOffsetY);
  g.lineTo(18 + style.bodyOffsetX + walkPose.armSwing, 30 + style.bodyOffsetY + walkPose.armSwing * 0.25);
  g.moveTo(40 + style.bodyOffsetX, 24 + style.bodyOffsetY);
  g.lineTo(46 + style.bodyOffsetX - walkPose.armSwing, 30 + style.bodyOffsetY - walkPose.armSwing * 0.25);
  g.stroke();

  g.strokeStyle = PLACEHOLDER_LOOK.pants;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(28 + style.bodyOffsetX, 36 + style.bodyOffsetY);
  g.lineTo(28 + style.bodyOffsetX + walkPose.legSwing, 44 + style.bodyOffsetY + walkPose.legSwing * 0.35);
  g.moveTo(36 + style.bodyOffsetX, 36 + style.bodyOffsetY);
  g.lineTo(36 + style.bodyOffsetX - walkPose.legSwing, 44 + style.bodyOffsetY - walkPose.legSwing * 0.35);
  g.stroke();

  g.strokeStyle = PLACEHOLDER_LOOK.boots;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(25 + style.bodyOffsetX + walkPose.legSwing * 0.4, 44 + style.bodyOffsetY + walkPose.legSwing * 0.35);
  g.lineTo(31 + style.bodyOffsetX + walkPose.legSwing * 0.4, 48 + style.bodyOffsetY + walkPose.legSwing * 0.35);
  g.moveTo(33 + style.bodyOffsetX - walkPose.legSwing * 0.4, 44 + style.bodyOffsetY - walkPose.legSwing * 0.35);
  g.lineTo(39 + style.bodyOffsetX - walkPose.legSwing * 0.4, 48 + style.bodyOffsetY - walkPose.legSwing * 0.35);
  g.stroke();

  g.strokeStyle = "rgba(255,255,255,0.35)";
  g.strokeRect(shirtX, shirtY, 16, 18);

  return sprite;
}

function buildSpriteBank() {
  const bank = [];
  for (let dir = 0; dir < 8; dir++) {
    const frames = [];
    for (let frame = 0; frame < 2; frame++) {
      frames.push(buildSpriteFrame(dir, frame));
    }
    bank.push(frames);
  }
  return bank;
}

const spriteBank = buildSpriteBank();

function drawCharacter() {
  const p = isoToScreen(character.col, character.row);
  const frameIndex = character.walkFrame % 2;
  const sprite = spriteBank[character.dir][frameIndex];
  ctx.drawImage(sprite, p.x - 32, p.y - 58, 64, 64);
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const order = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      order.push([c, r]);
    }
  }

  order.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

  for (const [c, r] of order) {
    drawGrassTile(c, r);
  }

  drawCharacter();
}


let lastFrameTime = performance.now();
let moveAccumulator = 0;
const moveStepMs = 60;

function updateCharacterFromControls(deltaMs) {
  const dx = (keys.has("ArrowRight") ? 1 : 0) - (keys.has("ArrowLeft") ? 1 : 0);
  const dy = (keys.has("ArrowDown") ? 1 : 0) - (keys.has("ArrowUp") ? 1 : 0);

  if (dx !== 0 || dy !== 0) {
    moveAccumulator += deltaMs;

    while (moveAccumulator >= moveStepMs) {
      character.col += dx;
      character.row += dy;
      clampCharacter();
      character.dir = getDirectionIndex(dx, dy);
      character.walkFrame = (character.walkFrame + 1) % 2;
      moveAccumulator -= moveStepMs;
    }
  } else {
    character.walkFrame = 0;
  }
}


function loop(timestamp) {
  const deltaMs = Math.min(timestamp - lastFrameTime, 32);
  lastFrameTime = timestamp;

  updateCharacterFromControls(deltaMs);
  drawScene();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    keys.add(event.key);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
});

drawScene();
requestAnimationFrame(loop);