// === Candle Flame Logic ===
// const flameElements = [
//     document.getElementById("flame1"),
//     document.getElementById("flame2"),
//     document.getElementById("flame3")
//   ];
  
//   const frameCount = 6;
//   const middleFrames = [3, 4];
//   const minScale = 0.8;
//   const maxScale = 1.2;
//   const middleScale = (minScale + maxScale) / 2;
  
//   const flames = flameElements.map(() => ({
//     currentFrame: middleFrames[Math.floor(Math.random() * middleFrames.length)],
//     direction: Math.random() < 0.5 ? -1 : 1,
//     scale: middleScale,
//     scaleDirection: Math.random() < 0.5 ? -1 : 1
//   }));
  
//   function animateFlame(index) {
//     const flame = flames[index];
//     const img = flameElements[index];
  
//     img.src = `assets/images/candle/flame_${flame.currentFrame}.png`;
  
//     flame.scale += 0.02 * flame.scaleDirection;
//     if (flame.scale <= minScale || flame.scale >= maxScale) {
//       flame.scaleDirection *= -1;
//       flame.scale = Math.max(minScale, Math.min(maxScale, flame.scale));
//     }
  
//     if (Math.abs(flame.scale - middleScale) < 0.01) {
//       flame.scaleDirection = Math.random() < 0.5 ? -1 : 1;
//     }
  
//     img.style.transform = `scale(${flame.scale})`;
  
//     flame.currentFrame += flame.direction;
//     if (flame.currentFrame === 1 || flame.currentFrame === frameCount) {
//       flame.direction *= -1;
//     }
  
//     if (middleFrames.includes(flame.currentFrame)) {
//       flame.direction = Math.random() < 0.5 ? -1 : 1;
//     }
  
//     const nextDelay = Math.floor(Math.random() * 80) + 60;
//     setTimeout(() => animateFlame(index), nextDelay);
//   }
  
//   flames.forEach((_, index) => animateFlame(index));
  
  // === Fly Animation and Movement Logic ===
  const canvas = document.getElementById('flyCanvas');
  const ctx = canvas.getContext('2d');
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  const framePaths = Array.from({ length: 16 }, (_, i) =>
    `assets/images/fly_idle/frames/fly_idle${i + 1}.png`
  );
  
  const flyFrames = [];
  let isReady = false;
  let loadedCount = 0;
  
  framePaths.forEach((path) => {
    const img = new Image();
    img.src = path;
    img.onload = () => {
      loadedCount++;
      if (loadedCount === framePaths.length) {
        isReady = true;
        startFlock();
      }
    };
    flyFrames.push(img);
  });
  
  const FLY_COUNT = 6;
  const flies = [];
  
  function createFly() {
    const flameSize = 128;
    const flyScale = flameSize * 0.8 / 128;
    const width = 128 * flyScale;
    const height = 128 * flyScale;
  
    return {
        x: Math.random() * (canvas.width - width),
        y: Math.random() * (canvas.height - height),
        targetX: Math.random() * (canvas.width - width),
        targetY: Math.random() * (canvas.height - height),
        width,
        height,
        currentFrame: Math.floor(Math.random() * flyFrames.length),
        lastFrameTime: 0,
        frameInterval: 100 + Math.random() * 60,
        paused: false,
        pauseTimeout: null,
        clicked: false
      };
    }
  
  function startFlock() {
    for (let i = 0; i < FLY_COUNT; i++) {
      flies.push(createFly());
    }
    requestAnimationFrame(animateFlies);
  }
  
  function animateFlies(timestamp) {
    if (!isReady) return;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    flies.forEach((fly) => {
      // Movement
      fly.x += (fly.targetX - fly.x) * 0.05;
      fly.y += (fly.targetY - fly.y) * 0.05;
  
      // Pause logic
      if (!fly.paused && Math.random() < 0.005) {
        fly.paused = true;
        fly.pauseTimeout = setTimeout(() => {
          fly.paused = false;
          fly.targetX = Math.random() * (canvas.width - fly.width);
          fly.targetY = Math.random() * (canvas.height - fly.height);
        }, 300 + Math.random() * 1000);
      }
  
      if (!fly.paused && Math.hypot(fly.targetX - fly.x, fly.targetY - fly.y) < 10) {
        fly.targetX = Math.random() * (canvas.width - fly.width);
        fly.targetY = Math.random() * (canvas.height - fly.height);
      }
  
      // Frame update
      if (timestamp - fly.lastFrameTime > fly.frameInterval) {
        fly.currentFrame = (fly.currentFrame + 1) % flyFrames.length;
        fly.lastFrameTime = timestamp;
      }
  
      if (!fly.clicked) {
        ctx.drawImage(
          flyFrames[fly.currentFrame],
          fly.x,
          fly.y,
          fly.width,
          fly.height
        );
      }
    });
  
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
      
        flies.forEach((fly) => {
          if (
            !fly.clicked &&
            mouseX >= fly.x &&
            mouseX <= fly.x + fly.width &&
            mouseY >= fly.y &&
            mouseY <= fly.y + fly.height
          ) {
            fly.clicked = true;
            // Optional: play sound or log
            console.log("Fly clicked!");
          }
        });
      });
            
    requestAnimationFrame(animateFlies);
  }
  