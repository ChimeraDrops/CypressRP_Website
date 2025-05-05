// Core data structure to use instead of random slot spawning
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
  
  function spawnPiecesForPuzzle(puzzleName) {
    gamePieces = [];
    const entries = pieceSpawnData[puzzleName];
    if (!entries) return;
  
    for (const { piece, x, y } of entries) {
      const img = images[piece];
      const offset = 20; // back up slightly from slot so it peeks in
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
  
    // Draw body behind pieces if not debugging
    if (activePuzzle && !debugPiecesOnTop) {
      drawCenteredImage(images[`${activePuzzle}.png`]);
    }
  
    drawPieces();
  
    // Draw overlay above pieces if debugging
    if (activePuzzle && debugPiecesOnTop) {
      drawCenteredImage(images[`${activePuzzle}.png`]);
    }
  
    drawForceps();
  
    requestAnimationFrame(gameLoop);
  }
  