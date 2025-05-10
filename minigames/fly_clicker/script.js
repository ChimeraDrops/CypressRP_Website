// === Fly & Bee Clicker Game ===

const canvas = document.getElementById('flyCanvas');
const ctx = canvas.getContext('2d');
const flies = [];
const bees = [];
const FLY_COUNT = 6;
const BEE_COUNT = 10;
const chopsticksOpen = new Image();
const chopsticksClosed = new Image();
chopsticksOpen.src = 'assets/images/chopsticks/chopsticks_open.png';
chopsticksClosed.src = 'assets/images/chopsticks/chopsticks_closed.png';

let isMouseDown = false;
let chopsticksOffsetX = 800; // Adjust to match red dot x offset
let chopsticksOffsetY = 700; // Adjust to match red dot y offset


let mouseX = 0;
let mouseY = 0;

document.getElementById('startButton').addEventListener('click', () => {
  document.getElementById('loadScreen').style.display = 'none';
  startFlock();
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});


function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// === Asset Loading ===
const flyFramePaths = Array.from({ length: 16 }, (_, i) =>
  `assets/images/fly_idle/frames/fly_idle${i + 1}.png`
);
const beeFramePaths = [
  'assets/images/bee/bee_1.png',
  'assets/images/bee/bee_2.png',
  'assets/images/bee/bee_3.png',
  'assets/images/bee/bee_4.png'
];

const flyFrames = [];
const beeFrames = [];
let flyLoaded = 0;
let beeLoaded = 0;
let isReady = false;

flyFramePaths.forEach((path) => {
  const img = new Image();
  img.src = path;
  img.onload = () => {
    flyLoaded++;
  if (flyLoaded === flyFramePaths.length && beeLoaded === beeFramePaths.length) {
    isReady = true;
    document.getElementById('startButton').disabled = false; // Optional: enable Start button
  }
  };
  flyFrames.push(img);
});

beeFramePaths.forEach((path) => {
  const img = new Image();
  img.src = path;
  img.onload = () => {
    beeLoaded++;
    if (flyLoaded === flyFramePaths.length && beeLoaded === beeFramePaths.length) {
      isReady = true;
    }
  };
  beeFrames.push(img);
});

function createFly() {
  const size = 128 * 0.8;
  return {
    x: Math.random() * (canvas.width - size),
    y: Math.random() * (canvas.height - size),
    targetX: Math.random() * (canvas.width - size),
    targetY: Math.random() * (canvas.height - size),
    width: size,
    height: size,
    currentFrame: Math.floor(Math.random() * flyFrames.length),
    lastFrameTime: 0,
    frameInterval: 100 + Math.random() * 60,
    paused: false,
    pauseTimeout: null,
    clicked: false
  };
}

function createBee() {
  const size = 128 * 0.8;
  return {
    x: Math.random() * (canvas.width - size),
    y: Math.random() * (canvas.height - size),
    targetX: Math.random() * (canvas.width - size),
    targetY: Math.random() * (canvas.height - size),
    width: size,
    height: size,
    currentFrame: 0,
    direction: 1,
    lastFrameTime: 0,
    frameInterval: 120 + Math.random() * 50,
    paused: false,
    pauseTimeout: null
  };
}

function startFlock() {
  for (let i = 0; i < FLY_COUNT; i++) flies.push(createFly());
  for (let i = 0; i < BEE_COUNT; i++) bees.push(createBee());
  requestAnimationFrame(animate);
}

function showWinScreen() {
  document.getElementById('winScreen').style.display = 'flex';
}


function animate(timestamp) {
  if (!isReady) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  flies.forEach(fly => {
    if (fly.clicked) return;

    const unclickedFlies = flies.filter(f => !f.clicked);
    const isLastFly = unclickedFlies.length === 1;

    if (isLastFly) {
      const dx = fly.x + fly.width / 2 - mouseX;
      const dy = fly.y + fly.height / 2 - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        fly.targetX = fly.x + Math.cos(angle) * 150;
        fly.targetY = fly.y + Math.sin(angle) * 150;
        fly.targetX = Math.max(0, Math.min(canvas.width - fly.width, fly.targetX));
        fly.targetY = Math.max(0, Math.min(canvas.height - fly.height, fly.targetY));
      }
    }

    fly.x += (fly.targetX - fly.x) * 0.05;
    fly.y += (fly.targetY - fly.y) * 0.05;

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

    if (timestamp - fly.lastFrameTime > fly.frameInterval) {
      fly.currentFrame = (fly.currentFrame + 1) % flyFrames.length;
      fly.lastFrameTime = timestamp;
    }

    ctx.drawImage(flyFrames[fly.currentFrame], fly.x, fly.y, fly.width, fly.height);
  });

  bees.forEach(bee => {
    bee.x += (bee.targetX - bee.x) * 0.05;
    bee.y += (bee.targetY - bee.y) * 0.05;

    if (!bee.paused && Math.random() < 0.005) {
      bee.paused = true;
      bee.pauseTimeout = setTimeout(() => {
        bee.paused = false;
        bee.targetX = Math.random() * (canvas.width - bee.width);
        bee.targetY = Math.random() * (canvas.height - bee.height);
      }, 300 + Math.random() * 1000);
    }

    if (!bee.paused && Math.hypot(bee.targetX - bee.x, bee.targetY - bee.y) < 10) {
      bee.targetX = Math.random() * (canvas.width - bee.width);
      bee.targetY = Math.random() * (canvas.height - bee.height);
    }

    if (timestamp - bee.lastFrameTime > bee.frameInterval) {
      bee.currentFrame += bee.direction;
      if (bee.currentFrame === beeFrames.length - 1 || bee.currentFrame === 0) {
        bee.direction *= -1;
      }
      bee.lastFrameTime = timestamp;
    }

    ctx.drawImage(beeFrames[bee.currentFrame], bee.x, bee.y, bee.width, bee.height);
  });

  const chopsticksImg = isMouseDown ? chopsticksClosed : chopsticksOpen;
  const scale = 0.3; // adjust this to make them smaller or larger
  const width = chopsticksImg.width * scale;
  const height = chopsticksImg.height * scale;

  ctx.drawImage(
    chopsticksImg,
    mouseX - chopsticksOffsetX * scale,
    mouseY - chopsticksOffsetY * scale,
    width,
    height
  );

const activeFlies = flies.filter(f => !f.clicked);

if (activeFlies.length === 0 && bees.length > 0) {
  bees.forEach(bee => {
    bee.targetX = -200; // fly left off screen
    bee.leaveOnExit = true;
    if (bee.leaveOnExit && bee.x + bee.width < 0) {
      bees.splice(bees.indexOf(bee), 1);
    }
  });
  if (flies.every(f => f.clicked) && bees.length === 0) {
  showWinScreen();
  }

}

  if (flies.every(f => f.clicked) && bees.length === 0) {
    showWinScreen();
  }
  
  requestAnimationFrame(animate);
}

canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});

canvas.addEventListener('mouseup', () => {
  isMouseDown = false;
});

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  flies.forEach(fly => {
    if (
      !fly.clicked &&
      mouseX >= fly.x && mouseX <= fly.x + fly.width &&
      mouseY >= fly.y && mouseY <= fly.y + fly.height
    ) {
      fly.clicked = true;
      console.log("Fly clicked!");
    }
  });

  bees.forEach(bee => {
    if (
      mouseX >= bee.x && mouseX <= bee.x + bee.width &&
      mouseY >= bee.y && mouseY <= bee.y + bee.height
    ) {
      flies.push(createFly());
      console.log("Bee clicked – spawned a fly!");
    }
  });
});

document.getElementById('restartButton').addEventListener('click', () => {
  document.getElementById('winScreen').style.display = 'none';
  flies.length = 0;
  bees.length = 0;
  startFlock();
});
