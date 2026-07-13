import { TILE_W, TILE_H, cols, rows, WALK_POSES, DIRECTION_STYLES, PLACEHOLDER_LOOK } from "./constants.js";

export function isoToScreen(col, row, camera) {
  return {
    x: camera.x + (col - row) * (TILE_W / 2),
    y: camera.y + (col + row) * (TILE_H / 2)
  };
}

function drawGrassTile(ctx, col, row, camera) {
  const p = isoToScreen(col, row, camera);
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

  return sprite;
}

export function createSpriteBank() {
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

export function drawCharacter(ctx, character, spriteBank, camera) {
  const p = isoToScreen(character.col, character.row, camera);
  const frameIndex = character.walkFrame % 2;
  const sprite = spriteBank[character.dir][frameIndex];
  ctx.drawImage(sprite, p.x - 32, p.y - 58, 64, 64);
}

export function drawScene(ctx, canvas, character, spriteBank, camera) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const order = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      order.push([c, r]);
    }
  }

  order.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

  for (const [c, r] of order) {
    drawGrassTile(ctx, c, r, camera);
  }

  drawCharacter(ctx, character, spriteBank, camera);
}