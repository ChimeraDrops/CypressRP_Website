// === GLOBALS ===

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let activePuzzle = null;
let images = {};
let gamePieces = [];
let debugPiecesOnTop = false;
let lastMouseX = null;
let failFlashCounter = 0;
let successFlashCounter = 0;
let bodyHitCanvas = document.createElement('canvas');
let bodyHitCtx = bodyHitCanvas.getContext('2d');


let forceps = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 50,
  height: 150,
  image: null,
  heldPiece: null,
  rotation: 0,
  isLeftHeld: false,
  isRightHeld: false
};

const assetManifest = {
  backgrounds: ['1_brokenleg', '2_brokenarm-11', '3_brokenlegs', '3_weird', '4_choke', '5_badnews', '6_sexfreak'],
  forcepsOpen: 'forceps_open.png',
  forcepsClosed: 'forceps_closed.png',
  baseBody: 'base_body.png'
};

if (!canvas) {
  alert("Canvas not found! Make sure <canvas id='gameCanvas'> is in the HTML.");
}

// === SPAWN DATA ===
const pieceSpawnData = {
  "1_brokenleg": [
    { piece: "highbone.png", x: 593, y: 838 },
    { piece: "lowbone.png", x: 593, y: 838 }
  ],
  "2_brokenarm-11": [
    { piece: "highbone.png", x: 700, y: 524 }
  ],
  "3_brokenlegs": [
    { piece: "highbone.png", x: 403, y: 824 },
    { piece: "lowbone.png", x: 403, y: 824 },
    { piece: "highbone.png", x: 593, y: 838 },
    { piece: "lowbone.png", x: 593, y: 838 }
  ],
  "3_weird": [
    { piece: "spider.png", x: 515, y: 504 },
    { piece: "leaf.png", x: 540, y: 584 },
    { piece: "gerbil.png", x: 493, y: 896 }
  ],
  "4_choke": [
    { piece: "choke.png", x: 495, y: 324 }
  ],
  "5_badnews": [
    { piece: "highbone.png", x: 403, y: 824 },
    { piece: "lowbone.png", x: 403, y: 824 },
    { piece: "highbone.png", x: 593, y: 838 },
    { piece: "lowbone.png", x: 593, y: 838 },
    { piece: "highbone.png", x: 695, y: 504 },
    { piece: "lowbone.png", x: 695, y: 504 },
    { piece: "leaf.png", x: 395, y: 504 }
  ],
  "6_sexfreak": [
    { piece: "plug.png", x: 495, y: 859 },
    { piece: "choke.png", x: 495, y: 344 }
  ]
};

// === CLASSES ===
class GamePiece {
  constructor(name, image, x, y, slotX, slotY, rotation = 0) {
    this.name = name;
    this.image = image;
    this.x = x;
    this.y = y;
    this.slotX = slotX;
    this.slotY = slotY;
    this.rotation = rotation;
    this.scale = 0.85;
    this.grabbed = false;
    this.extracted = false;
  }

  containsPoint(px, py) {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy) < 50;
  }
}

// === FUNCTIONS ===
function preloadImages(callback) {
  const allFiles = [];
  assetManifest.backgrounds.forEach(name => {
    allFiles.push(`${name}.png`, `${name}_fail.png`, `${name}_success.png`);
  });
  allFiles.push('highbone.png', 'lowbone.png', 'gerbil.png', 'leaf.png', 'spider.png', 'choke.png', 'plug.png');
  allFiles.push(assetManifest.forcepsOpen, assetManifest.forcepsClosed, assetManifest.baseBody);

  let loaded = 0;
  allFiles.forEach(file => {
    const img = new Image();
    img.onload = () => { if (++loaded === allFiles.length) callback(); };
    img.src = `operationimages/${file}`;
    images[file] = img;
  });
}

function spawnPiecesForPuzzle(puzzleName) {
  gamePieces = [];
  const entries = pieceSpawnData[puzzleName];
  if (!entries) return;

  const offsetX = (canvas.width - 1024) / 2;
  const offsetY = (canvas.height - 1024) / 2;

  for (const { piece, x, y } of entries) {
    const img = images[piece];
    const rotation = (Math.random() - 0.5) * Math.PI;
    const screenX = x + offsetX;
    const screenY = y + offsetY;

    const p = new GamePiece(piece.replace(".png", ""), img, screenX, screenY, screenX, screenY, rotation);
    gamePieces.push(p);
  }
}

function drawCenteredImage(img) {
  const x = (canvas.width - 1024) / 2;
  const y = (canvas.height - 1024) / 2;
  ctx.drawImage(img, x, y);
}

function drawPieces() {
  for (const piece of gamePieces.filter(p => !p.extracted)) drawPiece(piece);
}

function drawExtractedPieces() {
  for (const piece of gamePieces.filter(p => p.extracted)) drawPiece(piece);
}

function drawPiece(piece) {
  ctx.save();
  ctx.translate(piece.x, piece.y);
  ctx.rotate(piece.rotation);
  ctx.scale(piece.scale, piece.scale);
  ctx.drawImage(piece.image, -piece.image.width / 2, -piece.image.height / 2);
  ctx.restore();
}

function drawForceps() {
  if (forceps.image) {
    ctx.save();
    ctx.translate(forceps.x, forceps.y);
    ctx.rotate(forceps.rotation);
    ctx.drawImage(forceps.image, -forceps.width / 2, -forceps.height / 2, forceps.width, forceps.height);
    ctx.restore();
    const tip = getForcepsTipPosition();
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 4, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }
}

function getForcepsTipPosition() {
  const angle = forceps.rotation;
  const offsetX = 15;
  const offsetY = -50;
  const rotatedX = offsetX * Math.cos(angle) - offsetY * Math.sin(angle);
  const rotatedY = offsetX * Math.sin(angle) + offsetY * Math.cos(angle);
  return { x: forceps.x + rotatedX, y: forceps.y + rotatedY };
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPieces();
  if (activePuzzle) drawCenteredImage(images[`${activePuzzle}.png`]);
  drawExtractedPieces();
  drawForceps();
  if (forceps.heldPiece && (forceps.isLeftHeld || forceps.isRightHeld)) {
    const tip = getForcepsTipPosition();
    forceps.heldPiece.x = tip.x;
    forceps.heldPiece.y = tip.y;
  }
  requestAnimationFrame(gameLoop);
}

function isCollidingWithOpaquePixel(piece) {
  const offsetX = (canvas.width - 1024) / 2;
  const offsetY = (canvas.height - 1024) / 2;

  // Convert world space to image space
  const localX = piece.x - offsetX;
  const localY = piece.y - offsetY;

  if (localX < 0 || localY < 0 || localX >= 1024 || localY >= 1024) {
    return false; // Outside body bounds
  }

  const pixel = bodyHitCtx.getImageData(localX, localY, 1, 1).data;
  const alpha = pixel[3]; // alpha channel
  return alpha > 50; // collision if opaque
}

function isPieceCollidingWithBodyMask(piece) {
  const imgData = piece.image;
  const sampleStep = 6; // Larger step for faster performance
  const offsetX = (canvas.width - 1024) / 2;
  const offsetY = (canvas.height - 1024) / 2;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = imgData.width;
  tempCanvas.height = imgData.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(imgData, 0, 0);
  const piecePixels = tempCtx.getImageData(0, 0, imgData.width, imgData.height).data;

  let collidingPixelCount = 0;
  const collisionThreshold = 10; // Only fail if more than 10 pixels overlap

  for (let y = 0; y < imgData.height; y += sampleStep) {
    for (let x = 0; x < imgData.width; x += sampleStep) {
      const index = (y * imgData.width + x) * 4;
      const alpha = piecePixels[index + 3];
      if (alpha < 50) continue;

      // Local centered coordinates
      let localX = x - imgData.width / 2;
      let localY = y - imgData.height / 2;

      // Apply scale
      localX *= piece.scale;
      localY *= piece.scale;

      // Apply rotation
      const cos = Math.cos(piece.rotation);
      const sin = Math.sin(piece.rotation);
      const rotatedX = localX * cos - localY * sin;
      const rotatedY = localX * sin + localY * cos;

      // Translate to canvas space
      const screenX = piece.x + rotatedX;
      const screenY = piece.y + rotatedY;

      // Convert to overlay mask space
      const bodyX = Math.floor(screenX - offsetX);
      const bodyY = Math.floor(screenY - offsetY);

      if (
        bodyX < 0 || bodyY < 0 || bodyX >= 1024 || bodyY >= 1024
      ) continue;

      const bodyPixel = bodyHitCtx.getImageData(bodyX, bodyY, 1, 1).data;
      if (bodyPixel[3] > 50) {
        collidingPixelCount++;
        if (collidingPixelCount >= collisionThreshold) {
          return true; // too many overlaps = fail
        }
      }
    }
  }

  return false;
}


canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  forceps.x = e.clientX - rect.left;
  forceps.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    forceps.isLeftHeld = true;
    forceps.image = images[assetManifest.forcepsClosed];
    const tip = getForcepsTipPosition();
    for (let i = gamePieces.length - 1; i >= 0; i--) {
      const piece = gamePieces[i];
      if (piece.containsPoint(tip.x, tip.y)) {
        forceps.heldPiece = piece;
        piece.grabbed = true;
        break;
      }
    }
  }
  if (e.button === 2) {
    forceps.isRightHeld = true;
    forceps.image = images[assetManifest.forcepsClosed];
  }
});

canvas.addEventListener('mouseup', e => {
  lastMouseX = null;
  if (e.button === 0) {
    forceps.isLeftHeld = false;
    forceps.image = images[assetManifest.forcepsOpen];
    if (forceps.heldPiece) {
      const piece = forceps.heldPiece;
      if (piece.scale < 1.0 || piece.extracted) {
        piece.extracted = false;
        piece.scale = 0.85;
      }
      piece.grabbed = false;
      forceps.heldPiece = null;
    }
  }
  if (e.button === 2) {
    forceps.isRightHeld = false;
    forceps.image = images[assetManifest.forcepsOpen];
  }
});

canvas.addEventListener('wheel', e => {
  if (forceps.heldPiece) {
    const piece = forceps.heldPiece;
    if (forceps.isLeftHeld && !e.shiftKey) {
      piece.scale += 0.05;
      if (piece.scale >= 1.0) {
        if (isPieceCollidingWithBodyMask(piece)) {
          console.log("FAILED");
          piece.scale = 0.85;
          piece.extracted = false;
        } else {
          piece.extracted = true;
        }
      }
      if (piece.scale >= 1.25) {
        gamePieces = gamePieces.filter(p => p !== piece);
        forceps.heldPiece = null;
      }
    } else if (e.shiftKey) {
      const direction = e.deltaY < 0 ? 1 : -1;
      piece.rotation += direction * 0.1;
    }
  }
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') debugPiecesOnTop = true;
  if (e.key === 'ArrowDown') debugPiecesOnTop = false;
});

function startGame() {
  const index = Math.floor(Math.random() * assetManifest.backgrounds.length);
  activePuzzle = assetManifest.backgrounds[index];
  bodyHitCanvas.width = 1024;
  bodyHitCanvas.height = 1024;
  bodyHitCtx.clearRect(0, 0, 1024, 1024);
  bodyHitCtx.drawImage(images[`${activePuzzle}.png`], 0, 0);

  forceps.image = images[assetManifest.forcepsOpen];
  spawnPiecesForPuzzle(activePuzzle);
  requestAnimationFrame(gameLoop);
}

preloadImages(startGame);