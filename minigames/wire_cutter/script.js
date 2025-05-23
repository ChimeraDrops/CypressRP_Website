
const canvas = document.getElementById('hackingCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const outerRadius = 160;
const boxSize = 20;
const terminalCount = 12;
let highlightIndex = 0;

let wires = [];
const terminals = [];
for (let i = 0; i < terminalCount; i++) {
  const angle = (Math.PI * 2 / terminalCount) * i;
  const x = centerX + outerRadius * Math.cos(angle);
  const y = centerY + outerRadius * Math.sin(angle);
  terminals.push({ x, y });
}

let selectedWire = null;
let wireChallengeState = null;
let movingLine = 0;
let movingDir = 1;
let challengeTimer = null;
let lineHitY = false;

function generateWires() {
  const indices = Array.from({length: terminalCount}, (_, i) => i);
  indices.sort(() => Math.random() - 0.5);
  const colors = [
    'red', 'blue', 'green', 'yellow', 'cyan', 'magenta',
    'orange', 'purple', 'lime', 'teal', 'pink', 'brown'
  ];
  wires = [];
  for (let i = 0; i < 12; i += 2) {
    wires.push({
      start: indices[i],
      end: indices[i + 1],
      color: colors[i / 2],
      cut: false,
      clickedEnds: []
    });
  }
  selectedWire = getRandomWire();
}

function getRandomWire() {
  const remaining = wires.filter(w => !w.cut);
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function drawBox(x, y, highlight = false, color = '#888') {
  ctx.fillStyle = highlight ? color : '#888';
  ctx.fillRect(x - boxSize / 2, y - boxSize / 2, boxSize, boxSize);
}

function drawWire(wire) {
  const p1 = terminals[wire.start];
  const p2 = terminals[wire.end];
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = wire.cut ? '#777' : wire.color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawCenterTarget() {
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fillStyle = wireChallengeState ? '#0f0' : '#555';
  ctx.fill();
}

function drawChallengeLines() {
  if (!selectedWire || selectedWire.cut) return;

  ctx.beginPath();
  ctx.moveTo(0, wireChallengeState === 'vertical' ? centerY : movingLine);
  ctx.lineTo(canvas.width, wireChallengeState === 'vertical' ? centerY : movingLine);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  if (wireChallengeState === 'vertical') {
    ctx.beginPath();
    ctx.moveTo(movingLine, 0);
    ctx.lineTo(movingLine, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawInterface() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawCenterTarget();

  terminals.forEach((pos, i) => {
    const isClickedEnd = selectedWire && selectedWire.clickedEnds.includes(i);
    drawBox(pos.x, pos.y, highlightIndex === i || isClickedEnd, selectedWire?.color || '#fff');
  });

  wires.forEach(w => drawWire(w));
  drawChallengeLines();

  ctx.font = '20px Segoe UI';
  ctx.fillStyle = selectedWire ? selectedWire.color : '#0f0';
  ctx.textAlign = 'center';

  if (selectedWire) {
    ctx.fillText(selectedWire.color.toUpperCase(), centerX, canvas.height - 20);
  } else {
    ctx.fillText('ALL WIRES CUT', centerX, canvas.height - 40);
    document.getElementById('restartBtn').style.display = 'block';
  }
}

function rotateHighlight() {
  if (wireChallengeState) return;
  highlightIndex = (highlightIndex + 1) % terminalCount;
  drawInterface();
}

function startChallenge() {
  wireChallengeState = 'horizontal';
  movingLine = 0;
  movingDir = 1;
  lineHitY = false;

  challengeTimer = setInterval(() => {
    if (!wireChallengeState) return;
    movingLine += 4 * movingDir;
    const limit = (wireChallengeState === 'horizontal' ? canvas.height : canvas.width);
    if (movingLine > limit || movingLine < 0) movingDir *= -1;
    drawInterface();
  }, 16);
}

function completeChallenge() {
  clearInterval(challengeTimer);
  challengeTimer = null;
  selectedWire.cut = true;
  wireChallengeState = null;
  selectedWire = getRandomWire();
  drawInterface();
}

canvas.addEventListener('click', () => {
  if (wireChallengeState) {
    if (wireChallengeState === 'horizontal' && Math.abs(movingLine - centerY) < 10) {
      wireChallengeState = 'vertical';
      movingLine = 0;
      movingDir = 1;
    } else if (wireChallengeState === 'vertical' && Math.abs(movingLine - centerX) < 10) {
      completeChallenge();
    }
    return;
  }

  if (!selectedWire) return;

  if ((highlightIndex === selectedWire.start || highlightIndex === selectedWire.end) &&
      !selectedWire.clickedEnds.includes(highlightIndex)) {
    selectedWire.clickedEnds.push(highlightIndex);
  }

  if (selectedWire.clickedEnds.length === 2) {
    startChallenge();
  }

  drawInterface();
});

document.getElementById('restartBtn').addEventListener('click', () => {
  generateWires();
  document.getElementById('restartBtn').style.display = 'none';
  drawInterface();
});

generateWires();
let rotationInterval = setInterval(rotateHighlight, 500);
drawInterface();
