const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let score = { success: 0, fail: 0 };
let activePuzzle = null;
let gamePieces = [];
let overlays = { success: null, fail: null };
let forceps = {
    x: 0,
    y: 0,
    width: 50,
    height: 150,
    image: null,
    heldPiece: null,
    rotation: 0,
    isLeftHeld: false,
    isRightHeld: false
};

// Assets to preload
const assetManifest = {
    backgrounds: ['1_brokenleg', '2_brokenarm-11', '3_brokenlegs', '3_weird', '4_choke', '5_badnews', '6_sexfreak'],
    overlays: {},
    pieces: ['highbone', 'lowbone', 'gerbil', 'leaf', 'choke', 'plug'],
    forcepsOpen: 'forceps_open.png',
    forcepsClosed: 'forceps_closed.png',
    baseBody: 'base_body.png'
};
let images = {};

function preloadImages(callback) {
    let total = 0, loaded = 0;
    const allFiles = [];

    assetManifest.backgrounds.forEach(name => {
        allFiles.push(`${name}.png`);
        allFiles.push(`${name}_fail.png`);
        allFiles.push(`${name}_success.png`);
    });

    allFiles.push(...assetManifest.pieces.map(p => `${p}.png`));
    allFiles.push(assetManifest.forcepsOpen, assetManifest.forcepsClosed, assetManifest.baseBody);

    total = allFiles.length;

    allFiles.forEach(filename => {
        const img = new Image();
        img.onload = () => {
            loaded++;
            if (loaded === total) callback();
        };
        img.src = `operationimages/${filename}`;
        images[filename] = img;
    });
}

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    forceps.x = e.clientX - rect.left;
    forceps.y = e.clientY - rect.top;
});

let debugPiecesOnTop = false;
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') debugPiecesOnTop = true;
    else if (e.key === 'ArrowDown') debugPiecesOnTop = false;
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

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.scale(this.scale, this.scale);
        ctx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        ctx.restore();
    }

    containsPoint(px, py) {
        const dx = this.x - px;
        const dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < 50;
    }
}

const puzzlePiecesMap = {
    '1_brokenleg': ['highbone', 'lowbone'],
    '2_brokenarm-11': ['highbone'],
    '3_brokenlegs': ['highbone', 'lowbone', 'highbone', 'lowbone'],
    '3_weird': ['gerbil', 'spider', 'leaf'],
    '4_choke': ['choke'],
    '5_badnews': ['highbone', 'highbone', 'highbone', 'lowbone', 'lowbone', 'leaf'],
    '6_sexfreak': ['plug', 'choke']
};

function spawnPiecesForPuzzle(puzzleName) {
    gamePieces = [];
    const names = puzzlePiecesMap[puzzleName];
    if (!names) return;

    const slotCenters = [
        { x: 300, y: 300 },
        { x: 600, y: 300 },
        { x: 900, y: 300 },
        { x: 450, y: 500 },
        { x: 750, y: 500 },
        { x: 600, y: 600 }
    ];

    for (let i = 0; i < names.length; i++) {
        const pieceName = names[i];
        const img = images[`${pieceName}.png`];
        const slot = slotCenters[i % slotCenters.length];
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;
        const rotation = (Math.random() - 0.5) * Math.PI;

        const piece = new GamePiece(pieceName, img, slot.x + offsetX, slot.y + offsetY, slot.x, slot.y, rotation);
        gamePieces.push(piece);
    }
}

function updateHeldPiece() {
    if (forceps.heldPiece) {
        forceps.heldPiece.x = forceps.x;
        forceps.heldPiece.y = forceps.y;
    }
}
setInterval(updateHeldPiece, 16);

let wheelDelta = 0;
canvas.addEventListener('wheel', (e) => {
    if (!forceps.heldPiece || !forceps.isLeftHeld) return;
    e.preventDefault();
    wheelDelta += e.deltaY;
    if (wheelDelta <= -100) {
        zoomHeldPiece();
        wheelDelta = 0;
    }
});

function zoomHeldPiece() {
    const piece = forceps.heldPiece;
    if (!piece) return;
    piece.scale += 0.05;
    if (piece.scale >= 1.0) {
        if (checkCollision(piece)) {
            overlays.fail = `${activePuzzle}_fail.png`;
            showOverlay(overlays.fail);
            score.fail++;
            piece.scale = 0.85;
        } else {
            overlays.success = `${activePuzzle}_success.png`;
            showOverlay(overlays.success);
            animateSuccess(piece);
        }
    }
}

function checkCollision(piece) {
    if (!forceps.isLeftHeld && !forceps.isRightHeld) return false;
    const maskImage = images[`${activePuzzle}.png`];
    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d');
    octx.drawImage(maskImage, 0, 0, canvas.width, canvas.height);
    const tipX = Math.floor(forceps.x);
    const tipY = Math.floor(forceps.y);
    const pixel = octx.getImageData(tipX, tipY, 1, 1).data;
    return pixel[3] > 50;
}

function showOverlay(imageKey) {
    const overlayImg = images[imageKey];
    let flashes = 0;
    const maxFlashes = 4;
    const flashInterval = setInterval(() => {
        if (flashes % 2 === 0) {
            ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        flashes++;
        if (flashes > maxFlashes) clearInterval(flashInterval);
    }, 150);
}

function animateSuccess(piece) {
    const growInterval = setInterval(() => {
        piece.scale += 0.05;
        if (piece.scale >= 1.25) {
            clearInterval(growInterval);
            const index = gamePieces.indexOf(piece);
            if (index !== -1) gamePieces.splice(index, 1);
            score.success++;
            document.getElementById('score').textContent = `Successes: ${score.success} | Fails: ${score.fail}`;
            if (gamePieces.length === 0) {
                setTimeout(() => {
                    ctx.drawImage(images[assetManifest.baseBody], 0, 0, canvas.width, canvas.height);
                    setTimeout(() => {
                        startGame();
                        document.getElementById('score').textContent = `Successes: ${score.success} | Fails: ${score.fail}`;
                    }, 4000);
                }, 500);
            }
        }
    }, 50);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (activePuzzle && !debugPiecesOnTop) {
        ctx.drawImage(images[`${activePuzzle}.png`], 0, 0, canvas.width, canvas.height);
    }

    for (const piece of gamePieces) {
        piece.draw(ctx);
    }

    if (activePuzzle && debugPiecesOnTop) {
        ctx.drawImage(images[`${activePuzzle}.png`], 0, 0, canvas.width, canvas.height);
    }

    if (forceps.image) {
        ctx.save();
        ctx.translate(forceps.x, forceps.y);
        ctx.rotate(forceps.rotation);
        ctx.drawImage(forceps.image, -forceps.width / 2, -forceps.height / 2, forceps.width, forceps.height);
        ctx.restore();
    }

    requestAnimationFrame(gameLoop);
}

function startGame() {
    const index = Math.floor(Math.random() * assetManifest.backgrounds.length);
    activePuzzle = assetManifest.backgrounds[index];
    forceps.image = images[assetManifest.forcepsOpen];
    spawnPiecesForPuzzle(activePuzzle);
    requestAnimationFrame(gameLoop);
}

preloadImages(startGame);
