const canvas = document.getElementById("waveCanvas");
const ctx = canvas.getContext("2d");
const timerDisplay = document.getElementById("timer");
const successDisplay = document.getElementById("success");
const failureDisplay = document.getElementById("failure");

const colors = ["#FF4081", "#00BCD4", "#4CAF50", "#FFC107"];

let stage = 0;
const totalStages = 3;
let timeLeft = 20;
let timerInterval;
let animationFrame;

const defaultPlayerWave = {
  frequency: 1.0,
  amplitude: 50,
  colorIndex: 0
};

let targetWave = {};
let playerWave = { ...defaultPlayerWave };
let waveOpacity = 1;
let glitchDirection = -1;

function getPlayerColor() {
  return colors[playerWave.colorIndex];
}

function generateTargetWave() {
  let newColor;
  do {
    newColor = colors[Math.floor(Math.random() * colors.length)];
  } while (newColor === getPlayerColor());

  return {
    frequency: +(Math.random() * 4.5 + 0.5).toFixed(2),
    amplitude: Math.floor(Math.random() * 90 + 10),
    color: newColor
  };
}

function drawWave(wave, isPlayer = false) {
  ctx.save();
  ctx.globalAlpha = isPlayer ? waveOpacity : 1;
  ctx.beginPath();
  ctx.strokeStyle = isPlayer ? getPlayerColor() : wave.color;
  ctx.lineWidth = 2;
  for (let x = 0; x < canvas.width; x++) {
    const y = canvas.height / 2 + Math.sin(x * wave.frequency * 0.01) * wave.amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawWave(targetWave, false);
  drawWave(playerWave, true);
}

function checkMatch() {
  const freqMargin = targetWave.frequency * 0.1;
  const ampMargin = targetWave.amplitude * 0.1;
  const freqMatch = Math.abs(playerWave.frequency - targetWave.frequency) <= freqMargin;
  const ampMatch = Math.abs(playerWave.amplitude - targetWave.amplitude) <= ampMargin;
  const colorMatch = getPlayerColor().toLowerCase() === targetWave.color.toLowerCase();

  if (freqMatch && ampMatch && colorMatch) {
    clearInterval(timerInterval);
    stage++;
    if (stage >= totalStages) {
      successDisplay.style.display = "block";
      timerDisplay.textContent = "";
    } else {
      startStage();
    }
  }
}

function setupKnob(id, param, min, max, step = 0.1) {
  const knob = document.getElementById(id);
  let startX, startVal;
  knob.onmousedown = e => {
    startX = e.clientX;
    startVal = playerWave[param];
    document.onmousemove = e => {
      const delta = (e.clientX - startX) * step;
      let newVal = startVal + delta;
      newVal = Math.max(min, Math.min(max, newVal));
      playerWave[param] = +(param === 'frequency' ? newVal.toFixed(2) : newVal.toFixed(0));
      render();
      checkMatch();
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
}

function setupColorKnob() {
  const knob = document.getElementById("knobColor");
  let startX;
  knob.onmousedown = e => {
    startX = e.clientX;
    document.onmousemove = e => {
      const delta = e.clientX - startX;
      const direction = Math.sign(delta);
      const stepSize = 30;
      if (Math.abs(delta) > stepSize) {
        startX = e.clientX;
        playerWave.colorIndex = (playerWave.colorIndex + direction + colors.length) % colors.length;
        render();
        checkMatch();
      }
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  };
}

function startTimer() {
  timeLeft = 20;
  timerDisplay.textContent = `⏱️ Time left: ${timeLeft}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏱️ Time left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      failureDisplay.style.display = "block";
      timerDisplay.textContent = "";
    }
  }, 1000);
}

function animate() {
  waveOpacity += glitchDirection * 0.03;
  if (waveOpacity <= 0.5 || waveOpacity >= 1) glitchDirection *= -1;
  render();
  animationFrame = requestAnimationFrame(animate);
}

function startStage() {
  targetWave = generateTargetWave();
  playerWave = { ...defaultPlayerWave };
  render();
  startTimer();
}

function init() {
  setupKnob("knobFreq", "frequency", 0.5, 5.0, 0.01);
  setupKnob("knobAmp", "amplitude", 10, 100, 0.2);
  setupColorKnob();
  startStage();
  animate();
}

init();
