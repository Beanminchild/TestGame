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

  ctx.fillStyle = "#4e342e";
  ctx.beginPath();
  ctx.moveTo(-20, 0); ctx.lineTo(0, 10); ctx.lineTo(0, 25); ctx.lineTo(-20, 15); ctx.fill();

  ctx.fillStyle = "#3e2723";
  ctx.beginPath();
  ctx.moveTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(0, 25); ctx.lineTo(20, 15); ctx.fill();

  ctx.fillStyle = "#5d4037";
  ctx.beginPath();
  ctx.moveTo(0, -10); ctx.lineTo(20, 0); ctx.lineTo(0, 10); ctx.lineTo(-20, 0);
  ctx.closePath(); ctx.fill();
  
  ctx.restore();
}

export function drawDominion(ctx, dominion, camera) {
  const p = isoToScreen(dominion.col, dominion.row, camera);

  ctx.save();
  ctx.translate(p.x, p.y);

  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.moveTo(-25, 0); ctx.lineTo(0, 12); ctx.lineTo(25, 0); ctx.lineTo(0, -12);
  ctx.fill();

  const bob = Math.sin(Date.now() / 500) * 5;
  ctx.translate(0, -25 + bob);
  
  ctx.fillStyle = "#90a4ae";
  ctx.beginPath();
  ctx.moveTo(0, -22); 
  ctx.lineTo(14, 0);  
  ctx.lineTo(0, 22);  
  ctx.lineTo(-14, 0); 
  ctx.fill();
  
  ctx.fillStyle = "#fff176";
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawWaterPond(ctx, pond, camera) {
  if (!pond) return;
  const c = pond.col;
  const r = pond.row;
  const size = 2; // 4x4 pond

  const time = Date.now() / 1000;

  ctx.save();
  
  // Base Water Layer
  const pTop = isoToScreen(c, r, camera);
  const pRight = isoToScreen(c + size, r, camera);
  const pBottom = isoToScreen(c + size, r + size, camera);
  const pLeft = isoToScreen(c, r + size, camera);

  ctx.beginPath();
  ctx.moveTo(pTop.x, pTop.y - TILE_H / 2);
  ctx.lineTo(pRight.x + TILE_W / 2, pRight.y);
  ctx.lineTo(pBottom.x, pBottom.y + TILE_H / 2);
  ctx.lineTo(pLeft.x - TILE_W / 2, pLeft.y);
  ctx.closePath();
  ctx.fillStyle = "#1e88e5";
  ctx.fill();

  // Moving "Squiggly" Ripple Effect
  for (let i = 0; i < 3; i++) {
    const shiftX = Math.sin(time + i) * 5;
    const shiftY = Math.cos(time * 0.8 + i) * 3;
    
    ctx.beginPath();
    // Offset each point slightly to create a moving wavy shape
    ctx.moveTo(pTop.x + shiftX, pTop.y - TILE_H / 2 + shiftY);
    ctx.lineTo(pRight.x + TILE_W / 2 - shiftX, pRight.y + shiftY);
    ctx.lineTo(pBottom.x - shiftX, pBottom.y + TILE_H / 2 - shiftY);
    ctx.lineTo(pLeft.x - TILE_W / 2 + shiftX, pLeft.y - shiftY);
    ctx.closePath();
    
    ctx.fillStyle = i % 2 === 0 ? "rgba(100, 181, 246, 0.4)" : "rgba(13, 71, 161, 0.3)";
    ctx.fill();
  }

  // White "Specular" Ripples
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 2;
  for (let j = 0; j < 2; j++) {
    const rx = pTop.x + Math.sin(time + j * 2) * 20;
    const ry = pTop.y + 20 + j * 10;
    ctx.beginPath();
    ctx.moveTo(rx - 15, ry);
    ctx.quadraticCurveTo(rx, ry + Math.sin(time * 2) * 5, rx + 15, ry);
    ctx.stroke();
  }

  ctx.restore();
}


function buildSpriteFrame(directionIndex, frameIndex, look = PLACEHOLDER_LOOK, options = {}) {
  const { showPigtails = true } = options;
  const sprite = document.createElement("canvas");
  sprite.width = 64;
  sprite.height = 64;
  const g = sprite.getContext("2d");

  const walkPose = WALK_POSES[frameIndex];
  const style = DIRECTION_STYLES[directionIndex];

  g.fillStyle = "rgba(0,0,0,0.15)";
  g.beginPath();
  g.ellipse(32, 52, 12, 6, 0, 0, Math.PI * 2);
  g.fill();

  const bx = 32 + style.bodyOffsetX;
  const by = 35 + style.bodyOffsetY;
  const hx = 32 + style.headOffsetX;
  const hy = 20 + style.headOffsetY;

  g.fillStyle = look.hair;
  const ptBounce = walkPose.legSwing * 0.5;
  
  function drawPigtail(x, y, isFront) {
    g.beginPath();
    g.ellipse(x, y + ptBounce, 5, 7, isFront ? 0.2 : -0.2, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#f4d683";
    g.fillRect(x - 3, y - 1 + ptBounce, 6, 2);
    g.fillRect(x - 1, y - 3 + ptBounce, 2, 6);
    g.fillStyle = look.hair;
  }

  if (showPigtails && (directionIndex === 6 || directionIndex === 5 || directionIndex === 7)) {
    drawPigtail(hx - 9, hy + 2, false);
    drawPigtail(hx + 9, hy + 2, true);
  }

  g.strokeStyle = look.pants;
  g.lineWidth = 5;
  g.lineCap = "round";
  g.beginPath();
  g.moveTo(bx - 3, by + 5);
  g.lineTo(bx - 5 + walkPose.legSwing, by + 16);
  g.moveTo(bx + 3, by + 5);
  g.lineTo(bx + 5 - walkPose.legSwing, by + 16);
  g.stroke();

  const bodyGrad = g.createRadialGradient(bx - 3, by - 3, 2, bx, by, 12);
  bodyGrad.addColorStop(0, "#7a95eb");
  bodyGrad.addColorStop(1, look.coat);
  g.fillStyle = bodyGrad;
  g.beginPath();
  g.ellipse(bx, by, 9, 11, 0, 0, Math.PI * 2);
  g.fill();

  const headGrad = g.createRadialGradient(hx - 2, hy - 2, 2, hx, hy, 10);
  headGrad.addColorStop(0, "#ffe0c2");
  headGrad.addColorStop(1, look.skin);
  g.fillStyle = headGrad;
  g.beginPath();
  g.arc(hx, hy, 8.5, 0, Math.PI * 2);
  g.fill();

  g.fillStyle = look.hair;
  g.beginPath();
  g.arc(hx, hy - 1, 9, Math.PI, 0);
  g.fill();
  
  if (directionIndex >= 1 && directionIndex <= 3) { 
    g.beginPath();
    g.moveTo(hx - 9, hy - 1);
    g.quadraticCurveTo(hx - 5, hy + 4, hx, hy - 1);
    g.quadraticCurveTo(hx + 5, hy + 4, hx + 9, hy - 1);
    g.fill();
  }

  if (showPigtails) {
    if (directionIndex >= 1 && directionIndex <= 3) {
      drawPigtail(hx - 10, hy + 2, false);
      drawPigtail(hx + 10, hy + 2, true);
    } else if (directionIndex === 0) {
      drawPigtail(hx - 2, hy + 2, false);
    } else if (directionIndex === 4) {
      drawPigtail(hx + 2, hy + 2, true);
    }
  }

  g.fillStyle = "#333";
  const eyeY = hy + 1;
  if (directionIndex === 2) {
    g.fillRect(hx - 4, eyeY, 2, 2); g.fillRect(hx + 2, eyeY, 2, 2);
  } else if (directionIndex === 1) {
    g.fillRect(hx - 1, eyeY, 2, 2); g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 3) {
    g.fillRect(hx - 6, eyeY, 2, 2); g.fillRect(hx - 1, eyeY, 2, 2);
  } else if (directionIndex === 0) {
    g.fillRect(hx + 4, eyeY, 2, 2);
  } else if (directionIndex === 4) {
    g.fillRect(hx - 6, eyeY, 2, 2);
  }

  g.strokeStyle = "#4a65bd";
  g.lineWidth = 4.5;
  g.beginPath();
  const armAngle = walkPose.armSwing * 0.1;
  g.moveTo(bx, by - 5);
  g.lineTo(bx - 8 + walkPose.armSwing, by + 4);
  g.moveTo(bx, by - 5);
  g.lineTo(bx + 8 - walkPose.armSwing, by + 4);
  g.stroke();

  return sprite;
}

export function createSpriteBank(look = PLACEHOLDER_LOOK, options = {}) {
  const bank = [];
  for (let dir = 0; dir < 8; dir++) {
    const frames = [];
    for (let frame = 0; frame < 2; frame++) {
      frames.push(buildSpriteFrame(dir, frame, look, options));
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

  ctx.fillStyle = (min.state === "following" || min.state === "carrying") ? "#f7c873" : "#8c5b2b";
  
  if (min.state === "going_to_box" || min.state === "returning_to_dominion") {
    ctx.fillStyle = "#64b5f6";
  }

  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();

  if (min.state === "carrying" || min.isDelivering || min.state === "returning_to_dominion") {
    ctx.fillStyle = "#d9b44a";
    ctx.beginPath();
    ctx.arc(0, -12, 5, 0, Math.PI * 2);
    ctx.fill();
  }

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

export function getTimeTint(progress) {
  const p = Math.min(1, Math.max(0, progress ?? 0));

  // Dawn (0% - 20%)
  if (p < 0.2) {
    return { r: 255, g: 240, b: 180, a: 0.15 };
  }
  // Full Day (20% - 60%) - Clear/No tint
  if (p < 0.6) {
    return { r: 255, g: 255, b: 255, a: 0 };
  }
  // Dusk (60% - 80%)
  if (p < 0.8) {
    return { r: 255, g: 130, b: 80, a: 0.4 };
  }
  // Night (80% - 100%)
  return { r: 40, g: 40, b: 120, a: 0.5 };
}

export function drawScene(ctx, canvas, character, spriteBank, camera, button, mins, cursor, world, shopkeeper, shopkeeperSpriteBank) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tint = getTimeTint(world.dayProgress || 0);
  ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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


    // time cycle tint over world 
  //const tint = getTimeTint(world.dayProgress || 0);
  if (tint.a > 0) {
    ctx.save();
    // 'multiply' makes the world look naturally darker/tinted
    // 'source-over' (default) just adds a colored film
    if (world.dayProgress > 0.6) {
        ctx.globalCompositeOperation = 'multiply';
    }
    ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${tint.a})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  drawBox(ctx, world.box, camera);
  drawDominion(ctx, world.dominion, camera);
  drawWaterPond(ctx, world.pond, camera);
  drawButton(ctx, button, camera);
  drawCharacter(ctx, shopkeeper, shopkeeperSpriteBank, camera);

  for (const min of mins) {
    if (min.state !== "delivered") {
      drawMin(ctx, min, camera);
    }
  }

 

  drawCursor(ctx, cursor, camera);
  drawCharacter(ctx, character, spriteBank, camera);
   
}