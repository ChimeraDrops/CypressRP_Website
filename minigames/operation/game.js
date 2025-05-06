// === GLOBALS ===
  
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let activePuzzle = null;
let images = {};
let gamePieces = [];
let debugPiecesOnTop = false;

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
  "6_sexfreak": [
    { piece: "plug.png", x: 516, y: 332 },
    { piece: "choke.png", x: 515, y: 826 }
  ],
  "2_brokenarm-11": [
    { piece: "highbone.png", x: 711, y: 389 }
  ],
  "3_brokenlegs": [
    { piece: "highbone.png", x: 413, y: 656 },
    { piece: "highbone.png", x: 457, y: 663 },
    { piece: "lowbone.png", x: 587, y: 671 },
    { piece: "lowbone.png", x: 631, y: 678 }
  ],
  "3_weird": [
    { piece: "spider.png", x: 436, y: 490 },
    { piece: "leaf.png", x: 564, y: 560 },
    { piece: "gerbil.png", x: 511, y: 863 }
  ],
  "4_choke": [
    { piece: "choke.png", x: 511, y: 189 }
  ],
  "5_badnews": [
    { piece: "highbone.png", x: 443, y: 459 },
    { piece: "highbone.png", x: 718, y: 493 },
    { piece: "highbone.png", x: 418, y: 667 },
    { piece: "lowbone.png", x: 585, y: 670 },
    { piece: "lowbone.png", x: 629, y: 677 },
    { piece: "leaf.png", x: 439, y: 806 }
  ],
  "1_brokenleg": [
    { piece: "highbone.png", x: 450, y: 600 },
    { piece: "lowbone.png", x: 600, y: 620 }
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
  }

  containsPoint(px, py) {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy) < 40;
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

  for (const { piece, x, y } of entries) {
    const img = images[piece];
    const offset = 20;
    const spawnX = x + (Math.random() - 0.5) * offset;
    const spawnY = y + (Math.random() - 0.5) * offset;
    const rotation = (Math.random() - 0.5) * Math.PI;
    const p = new GamePiece(piece.replace(".png", ""), img, spawnX, spawnY, x, y, rotation);
    gamePieces.push(p);
  }
}

function drawCenteredImage(img) {
  const x = (canvas.width - 1024) / 2;
  const y = (canvas.height - 1024) / 2;
  ctx.drawImage(img, x, y);
}

function drawPieces() {
  for (const piece of gamePieces) {
    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.scale(piece.scale, piece.scale);
    ctx.drawImage(piece.image, -piece.image.width / 2, -piece.image.height / 2);
    ctx.restore();
  }
}

function drawForceps() {
  if (forceps.image) {
    ctx.save();
    ctx.translate(forceps.x, forceps.y);
    ctx.rotate(forceps.rotation);
    ctx.drawImage(forceps.image, -forceps.width / 2, -forceps.height / 2, forceps.width, forceps.height);
    ctx.restore();
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activePuzzle && !debugPiecesOnTop) {
    drawCenteredImage(images[`${activePuzzle}.png`]);
  }
  drawPieces();
  if (activePuzzle && debugPiecesOnTop) {
    drawCenteredImage(images[`${activePuzzle}.png`]);
  }
  drawForceps();
  requestAnimationFrame(gameLoop);
}

// === EVENT HANDLERS ===
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  forceps.x = e.clientX - rect.left;
  forceps.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    forceps.isLeftHeld = true;
    forceps.image = images[assetManifest.forcepsClosed];
    for (let i = gamePieces.length - 1; i >= 0; i--) {
      if (gamePieces[i].containsPoint(forceps.x, forceps.y)) {
        forceps.heldPiece = gamePieces[i];
        gamePieces[i].grabbed = true;
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
  if (e.button === 0) {
    forceps.isLeftHeld = false;
    forceps.image = images[assetManifest.forcepsOpen];
    if (forceps.heldPiece) {
      forceps.heldPiece.grabbed = false;
      forceps.heldPiece = null;
    }
  }
  if (e.button === 2) {
    forceps.isRightHeld = false;
    forceps.image = images[assetManifest.forcepsOpen];
  }
});

canvas.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') debugPiecesOnTop = true;
  if (e.key === 'ArrowDown') debugPiecesOnTop = false;
});

// === START ===
function startGame() {
    console.log("Active puzzle:", activePuzzle);
    console.log("Forceps image loaded?", forceps.image instanceof Image);
  const index = Math.floor(Math.random() * assetManifest.backgrounds.length);
  activePuzzle = assetManifest.backgrounds[index];
  forceps.image = images[assetManifest.forcepsOpen];
  spawnPiecesForPuzzle(activePuzzle);
  requestAnimationFrame(gameLoop);
}

preloadImages(startGame);
