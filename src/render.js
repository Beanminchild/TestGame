import {
  TILE_W,
  TILE_H,
  cols,
  rows,
  WALK_POSES,
  DIRECTION_STYLES,
  PLACEHOLDER_LOOK,
  TILE_TYPES,
  PLANT_STAGES
} from "./constants.js";

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

  // Add small grass detail
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(p.x - 8, p.y - 4, 16, 2);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(p.x - 10, p.y + 3, 20, 1);
}

function drawDirtTile(ctx, col, row, camera) {
  const p = isoToScreen(col, row, camera);

  ctx.beginPath();
  ctx.moveTo(p.x, p.y - TILE_H / 2);
  ctx.lineTo(p.x + TILE_W / 2, p.y);
  ctx.lineTo(p.x, p.y + TILE_H / 2);
  ctx.lineTo(p.x - TILE_W / 2, p.y);
  ctx.closePath();

  ctx.fillStyle = "#8b5a2b";
  ctx.fill();
  ctx.strokeStyle = "#6a421f";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Add dirt texture detail
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(p.x - 8, p.y - 3, 16, 2);
}

function drawPlantOverlay(ctx, tile, col, row, camera) {
  if (!tile.planted) return;

  const p = isoToScreen(col, row, camera);

  if (tile.watered) {
    ctx.fillStyle = "#6ec5ff";
    ctx.beginPath();
    ctx.moveTo(p.x + 4, p.y - 8);
    ctx.lineTo(p.x + 9, p.y - 4);
    ctx.lineTo(p.x + 3, p.y - 2);
    ctx.lineTo(p.x - 2, p.y - 6);
    ctx.closePath();
    ctx.fill();
  }

  ctx.save();
  ctx.translate(p.x, p.y - 8);

  if (tile.stage === PLANT_STAGES.SEED) {
    ctx.strokeStyle = "#2f6b2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -6);
    ctx.stroke();
  } else if (tile.stage === PLANT_STAGES.SPROUT) {
    ctx.strokeStyle = "#2f6b2f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-4, -8);
    ctx.moveTo(0, 0);
    ctx.lineTo(4, -8);
    ctx.stroke();
  } else if (tile.stage === PLANT_STAGES.CROP) {
    ctx.fillStyle = "#4a8f3b";
    ctx.beginPath();
    ctx.arc(0, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d9b44a";
    ctx.fillRect(-2, -2, 4, 6);
  }

  ctx.restore();
}

export function drawBox(ctx, box, camera) {
  const p = isoToScreen(box.col, box.row, camera);

  ctx.save();
  ctx.translate(p.x, p.y);

  // Box depth/shadow
  ctx.fillStyle = "#4e342e";
  ctx.beginPath();
  ctx.moveTo(-20, 0); ctx.lineTo(0, 10); ctx.lineTo(0, 25); ctx.lineTo(-20, 15); ctx.fill();

  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.moveTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(0, 25); ctx.lineTo(20, 15); ctx.fill();

  // Box top/interior
  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(-20, 0);
  ctx.closePath(); ctx.fill();
  
  ctx.restore();
}

// ... (isoToScreen, drawGrassTile, drawDirtTile, drawPlantOverlay, drawBox remain the same) ...

function buildSpriteFrame(directionIndex, frameIndex) {
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d");

  const walkPose = WALK_POSES[frameIndex];
  const style = DIRECTION_STYLES[directionIndex];

  // 1. Soft Shadow
  g.fillStyle = "rgba(0,0,0,0.15)";
  g.beginPath();
  g.ellipse(32, 52, 12, 6, 0, 0, Math.PI * 2);
  g.fill();

  const bx = 32 + style.bodyOffsetX;
  const by = 35 + style.bodyOffsetY;
  const hx = 32 + style.headOffsetX;
  const hy = 20 + style.headOffsetY;

  // --- 2. Pigtails (Back Layer) ---
  // Pigtails are drawn behind the head when facing away (directions 5, 6, 7)
  g.fillStyle = PLACEHOLDER_LOOK.hair;
  const ptBounce = walkPose.legSwing * 0.5; // Pigtails bounce when walking
  
  function drawPigtail(x, y, isFront) {
    g.beginPath();
    g.ellipse(x, y + ptBounce, 5, 7, isFront ? 0.2 : -0.2, 0, Math.PI * 2);
    g.fill();
    // Tiny hair tie (+)
    g.fillStyle = "#f4d683";
    g.fillRect(x - 3, y - 1 + ptBounce, 6, 2); // Horizontal bar
    g.fillRect(x - 1, y - 3 + ptBounce, 2, 6); // Vertical bar
    g.fillStyle = PLACEHOLDER_LOOK.hair;
  }

  // Draw back pigtails if facing forward
  if (directionIndex >= 1 && directionIndex <= 3) {
    // Hidden behind head mostly
  } else if (directionIndex === 6 || directionIndex === 5 || directionIndex === 7) {
    drawPigtail(hx - 9, hy + 2, false);
    drawPigtail(hx + 9, hy + 2, true);
  }

  // --- 3. Legs ---
  g.strokeStyle = PLACEHOLDER_LOOK.pants;
  g.lineWidth = 5;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(bx - 3, by + 5);
  g.lineTo(bx - 5 + walkPose.legSwing, by + 16);
  g.moveTo(bx + 3, by + 5);
  g.lineTo(bx + 5 - walkPose.legSwing, by + 16);
  g.stroke();

  // --- 4. Torso (3D "Bean" Shape) ---
  const bodyGrad = g.createRadialGradient(bx - 3, by - 3, 2, bx, by, 12);
  bodyGrad.addColorStop(0, "#7a95eb"); // Highlight
  bodyGrad.addColorStop(1, PLACEHOLDER_LOOK.coat);
  g.fillStyle = bodyGrad;
  g.beginPath();
  g.ellipse(bx, by, 9, 11, 0, 0, Math.PI * 2);
  g.fill();

  // --- 5. Head & Face ---
  // Skin with slight shadow
  const headGrad = g.createRadialGradient(hx - 2, hy - 2, 2, hx, hy, 10);
  headGrad.addColorStop(0, "#ffe0c2");
  headGrad.addColorStop(1, PLACEHOLDER_LOOK.skin);
  g.fillStyle = headGrad;
  g.beginPath();
  g.arc(hx, hy, 8.5, 0, Math.PI * 2);
  g.fill();

  // Red Hair (Main mass)
  g.fillStyle = PLACEHOLDER_LOOK.hair;
  g.beginPath();
  g.arc(hx, hy - 1, 9, Math.PI, 0); // Hair cap
  g.fill();
  
  // Bangs (Front hair)
  if (directionIndex >= 1 && directionIndex <= 3) { // Facing down/forward
    g.beginPath();
    g.moveTo(hx - 9, hy - 1);
    g.quadraticCurveTo(hx - 5, hy + 4, hx, hy - 1);
    g.quadraticCurveTo(hx + 5, hy + 4, hx + 9, hy - 1);
    g.fill();
  }

  // --- 6. Pigtails (Front Layer) ---
  // Pigtails are drawn in front of the head when facing forward (directions 1, 2, 3)
  if (directionIndex >= 1 && directionIndex <= 3) {
    drawPigtail(hx - 10, hy + 2, false);
    drawPigtail(hx + 10, hy + 2, true);
  } else if (directionIndex === 0) { // Right
    drawPigtail(hx - 2, hy + 2, false); // One hidden behind, one visible
  } else if (directionIndex === 4) { // Left
    drawPigtail(hx + 2, hy + 2, true);
  }

  // --- 7. Eyes ---
  g.fillStyle = "#333";
  const eyeY = hy + 1;
  if (directionIndex === 2) { // Down
    g.fillRect(hx - 4, eyeY, 2, 2); g.fillRect(hx + 2, eyeY, 2, 2);
  } else if (directionIndex === 1) { // Down-Right
    g.fillRect(hx - 1, eyeY, 2, 2); g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 3) { // Down-Left
    g.fillRect(hx - 6, eyeY, 2, 2); g.fillRect(hx - 1, eyeY, 2, 2);
  } else if (directionIndex === 0) { // Right
    g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 4) { // Left
    g.fillRect(hx - 6, eyeY, 2, 2);
  }

  // --- 8. Arms ---
  g.strokeStyle = "#4a65bd"; // Darker blue for arms
  g.lineWidth = 4.5;
  g.beginPath();
  // Simple arm swing logic
  const armAngle = walkPose.armSwing * 0.1;
  g.moveTo(bx, by - 5);
  g.lineTo(bx - 8 + walkPose.armSwing, by + 4);
  g.moveTo(bx, by - 5);
  g.lineTo(bx + 8 - walkPose.armSwing, by + 4);
  g.stroke();

  return sprite;
}

// ... (Rest of drawCharacter, drawMin, etc remain the same) ...

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

  if (character.holdingCrop) {
    ctx.save();
    ctx.translate(p.x, p.y - 50); 
    ctx.fillStyle = "#4a8f3b";
    ctx.beginPath();
    ctx.arc(0, -8, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#d9b44a";
    ctx.fillRect(-2, -2, 4, 6);
    ctx.restore();
  }
}

export function drawMin(ctx, min, camera) {
  const p = isoToScreen(min.col, min.row, camera);

  ctx.save();
  ctx.translate(p.x, p.y - 6);

  // Mins have a lighter/glowing color when following or carrying
  ctx.fillStyle = (min.state === "following" || min.state === "carrying") ? "#f7c873" : "#8c5b2b";
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  if (min.state === "carrying" || min.isDelivering) {
    ctx.fillStyle = "#d9b44a";
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Face/Eyes detail
  ctx.fillStyle = "#3a210f";
  ctx.fillRect(-3, -1, 6, 2);

  ctx.restore();
}

export function drawButton(ctx, button, camera) {
  const p = isoToScreen(button.col, button.row, camera);

  ctx.save();
  ctx.translate(p.x, p.y - 6);

  ctx.fillStyle = button.pressed ? "#48c774" : "#c74e4e";
  ctx.beginPath();
  ctx.moveTo(0, -14);
  ctx.lineTo(16, -4);
  ctx.lineTo(0, 6);
  ctx.lineTo(-16, -4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(button.pressed ? "true" : "false", 0, 2);
  ctx.restore();
}

export function drawCursor(ctx, cursor, camera) {
  if (!cursor) return;

  const p = isoToScreen(cursor.col, cursor.row, camera);

  ctx.save();
  ctx.translate(p.x, p.y - 6);

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.moveTo(0, -5);
  ctx.lineTo(0, 5);
  ctx.stroke();

  ctx.restore();
}

export function drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const order = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      order.push([c, r]);
    }
  }

  order.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));

  for (const [c, r] of order) {
    const tile = world.tiles[r][c];
    if (tile.type === TILE_TYPES.DIRT) {
      drawDirtTile(ctx, c, r, camera);
    } else {
      drawGrassTile(ctx, c, r, camera);
    }

    drawPlantOverlay(ctx, tile, c, r, camera);
  }

  drawBox(ctx, world.box, camera);
  drawButton(ctx, button, camera);

  for (const min of mins) {
    if (min.state !== "delivered") {
      drawMin(ctx, min, camera);
    }
  }

  drawCursor(ctx, cursor, camera);
  drawCharacter(ctx, character, spriteBank, camera);
}