let round = 0;
let timerInterval;
let timeLeft = 20;
let correctWireId = null;
let successCount = 0;
let gameOver = false;
let popupTimer = null;

window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startButton");
  const startScreen = document.getElementById("startScreen");

  startBtn.addEventListener("click", () => {
    // Play music
    const music = document.getElementById("bg-music");
    if (music && music.paused) {
      music.volume = 0.3;
      music.play().catch((err) => {
        console.warn("🎵 Music blocked:", err);
      });
    }

    // Hide start screen and begin game
    startScreen.style.display = "none";
    startRound();
  });
});

function startRound() {
  if (gameOver) return;
  console.log("🔄 Starting new round. Success count:", successCount);

  round++;
  updateStatus("");
  updateRoundDisplay();
  resetTimer();
  generatePuzzle();
  startTimer();
}

function generatePuzzle() {
    window._puzzleRetryCount = 0;

  console.log("🧠 Generating new puzzle...");
  const leftNodes = document.querySelectorAll(".source");
  const rightNodes = document.querySelectorAll(".target");

  // Reactivate all boxes
  document.querySelectorAll(".source, .target").forEach((node) => {
    node.classList.remove("inactive");
  });

  // Generate 5 random numbers between 1 and 9
  const leftNumbers = [];
  while (leftNumbers.length < 5) {
    const rand = Math.floor(Math.random() * 9) + 1;
    if (!leftNumbers.includes(rand)) leftNumbers.push(rand);
  }

  leftNodes.forEach((node, i) => {
    node.textContent = leftNumbers[i];
    node.dataset.value = leftNumbers[i];
  });

  // Build equations from numbers
  const templates = [
    (x) => `x + 3 = ${x + 3}`,
    (x) => `2x = ${2 * x}`,
    (x) => `x - 1 = ${x - 1}`,
    (x) => `x * 1 = ${x}`,
    (x) => `x / 1 = ${x}`
  ];

  const equations = leftNumbers.map((num, i) => ({
    solution: num,
    equation: templates[i % templates.length](num)
  }));

  const shuffledEquations = shuffle([...equations]);

  // Assign text to right side and store correct solutions
  rightNodes.forEach((node, i) => {
    node.textContent = shuffledEquations[i].equation;
    node.dataset.solution = shuffledEquations[i].solution;
  });

  // Select a random correct wire
  const correctIndex = Math.floor(Math.random() * 5);
  correctWireId = `wire-${correctIndex}`;
  const connections = [null, null, null, null, null];

  const correctTargetIndex = shuffledEquations.findIndex(
    (eq) => eq.solution === leftNumbers[correctIndex]
  );
  connections[correctIndex] = correctTargetIndex;

  // Track used targets
  const usedTargets = new Set([correctTargetIndex]);

  // Assign remaining wires to incorrect (mismatched) targets
  for (let i = 0; i < 5; i++) {
    if (i === correctIndex) continue;

    const candidates = [];
    for (let j = 0; j < 5; j++) {
      if (
        !usedTargets.has(j) &&
        shuffledEquations[j].solution !== leftNumbers[i]
      ) {
        candidates.push(j);
      }
    }

    if (candidates.length === 0) {
    console.warn(`⚠️ Retry: no valid target for source index ${i}. Rebuilding puzzle...`);
    if (!window._puzzleRetryCount) window._puzzleRetryCount = 0;
    window._puzzleRetryCount++;

    if (window._puzzleRetryCount > 10) {
        console.error("❌ Too many puzzle generation retries. Aborting.");
        gameOver = true;
        showFailPopup("⚠️ Puzzle generation failed. Play Again?");
        return;
    }

  generatePuzzle(); // try again with new numbers
  return;
}


    const target = candidates[Math.floor(Math.random() * candidates.length)];
    connections[i] = target;
    usedTargets.add(target);
  }

  // 🖊 Draw wires
  requestAnimationFrame(() => {
    setTimeout(() => {
      const svg = document.getElementById("wire-canvas");
      if (!svg) {
        console.error("❌ SVG container not found.");
        return;
      }

      svg.innerHTML = "";
      const container = document.getElementById("game");
      const containerRect = container.getBoundingClientRect();
      svg.setAttribute("width", containerRect.width);
      svg.setAttribute("height", containerRect.height);
      const svgRect = svg.getBoundingClientRect();

      for (let i = 0; i < 5; i++) {
        const source = leftNodes[i];
        const target = rightNodes[connections[i]];

        if (!source || !target) {
          console.warn(`⚠️ Missing source or target node for wire ${i}`, source, target);
          continue;
        }

        const srcRect = source.getBoundingClientRect();
        const tgtRect = target.getBoundingClientRect();

        const startX = srcRect.right - svgRect.left;
        const startY = srcRect.top + srcRect.height / 2 - svgRect.top;

        const endX = tgtRect.left - svgRect.left;
        const endY = tgtRect.top + tgtRect.height / 2 - svgRect.top;

        const segments = 4;
        const amplitude = 50 + Math.random() * 30;
        const totalLengthX = endX - startX;
        const totalLengthY = endY - startY;

        let path = `M ${startX},${startY}`;
        let prevX = startX;
        let prevY = startY;

        for (let s = 1; s <= segments; s++) {
          const t = s / segments;
          const nextX = startX + t * totalLengthX;
          const nextY = startY + t * totalLengthY;
          const midX = (prevX + nextX) / 2;
          const midY = (prevY + nextY) / 2 + (s % 2 === 0 ? -amplitude : amplitude);
          path += ` Q ${midX},${midY} ${nextX},${nextY}`;
          prevX = nextX;
          prevY = nextY;
        }

        const wirePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        wirePath.setAttribute("d", path);
        wirePath.setAttribute("fill", "none");
        wirePath.setAttribute("stroke", "#00f2ff");
        wirePath.setAttribute("stroke-width", "3");
        wirePath.setAttribute("id", `wire-${i}`);
        wirePath.dataset.src = source.id;
        wirePath.dataset.tgt = target.id;
        wirePath.style.filter = "drop-shadow(0 0 5px #00f2ff) drop-shadow(0 0 10px #00f2ff)";
        wirePath.style.cursor = "pointer";
        wirePath.style.opacity = "1.0";

        wirePath.addEventListener("click", () => handleWireClick(`wire-${i}`));
        svg.appendChild(wirePath);
        console.log("✅ Wire added:", wirePath.id);
      }

      document.querySelectorAll(".node").forEach((node) => {
        const delay = (Math.random() * 3).toFixed(2);
        node.style.animationDelay = `${delay}s`;
      });
    }, 0);
  });
}

function handleWireClick(clickedId) {
  if (gameOver) return;

  const clickedWire = document.getElementById(clickedId);
  if (!clickedWire) return;

  clearInterval(timerInterval);

  if (clickedId === correctWireId) {
    successCount++;
    updateStatus("✅ Correct!", "green");
    // Optional: visually mark the cut wire without removing it
    clickedWire.style.opacity = "0.3";
    clickedWire.style.filter = "drop-shadow(0 0 2px #00f2ff)";
    clickedWire.style.pointerEvents = "none";

    const srcId = clickedWire.dataset.src;
    const tgtId = clickedWire.dataset.tgt;
    if (srcId) document.getElementById(srcId)?.classList.add("inactive");
    if (tgtId) document.getElementById(tgtId)?.classList.add("inactive");

 if (successCount === 3) {
 gameOver = true;
 showWinPopup();
 return;
 }
 else {
      showNextRoundPopup(5);
    }
  } else {
    gameOver = true;
    clickedWire.setAttribute("stroke", "red");
    clickedWire.style.filter = "drop-shadow(0 0 5px red) drop-shadow(0 0 10px red)";
    showFailPopup();

  }
}

function startTimer() {
  timeLeft = 20;
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
    clearInterval(timerInterval);
    gameOver = true;
    showFailPopup("⏰ Time's up! You Failed.");
    }

  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 20;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const el = document.getElementById("time");
  if (el) el.textContent = timeLeft;
}

function updateRoundDisplay() {
  const el = document.getElementById("round-count");
  if (el) el.textContent = successCount + 1;
}

function updateStatus(message, color = "white") {
  const status = document.getElementById("status");
  if (status) {
    status.textContent = message;
    status.style.color = color;
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function showNextRoundPopup(seconds) {
  if (gameOver || typeof seconds !== "number" || seconds < 0) return;

  const popup = document.createElement("div");
  popup.id = "nextRoundPopup";
  popup.style.position = "absolute";
  popup.style.top = "40%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#111";
  popup.style.border = "2px solid #00f2ff";
  popup.style.color = "#00f2ff";
  popup.style.padding = "30px 50px";
  popup.style.fontSize = "1.5em";
  popup.style.textAlign = "center";
  popup.style.zIndex = "9999";
  popup.style.boxShadow = "0 0 20px #00f2ff";
  popup.style.fontFamily = "Courier New, monospace";

  document.body.appendChild(popup);

  function updateCountdown() {
    if (gameOver) {
      popup.remove();
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = null;
      return;
    }

    if (seconds <= 0) {
      popup.remove();
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = null;
      console.log("🟢 Countdown done, starting next round");
      startRound();
    } else {
      popup.innerHTML = `✅ Correct!<br>Next Round in ${seconds}...`;
      console.log("⏳ Countdown:", seconds);
      seconds--;
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = setTimeout(updateCountdown, 1000);
    }
  }

  updateCountdown();
}

function showWinPopup() {
  const popup = document.createElement("div");
  popup.id = "winPopup";
  popup.style.position = "absolute";
  popup.style.top = "40%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#111";
  popup.style.border = "2px solid #00f2ff";
  popup.style.color = "#00f2ff";
  popup.style.padding = "40px 60px";
  popup.style.fontSize = "1.8em";
  popup.style.textAlign = "center";
  popup.style.zIndex = "9999";
  popup.style.boxShadow = "0 0 20px #00f2ff";
  popup.style.fontFamily = "Courier New, monospace";

  popup.innerHTML = `
    🎉 <strong>You Win!</strong><br><br>
    <button id="playAgainButton" style="
      margin-top: 20px;
      padding: 10px 20px;
      font-size: 1em;
      background: #00f2ff;
      color: black;
      border: none;
      cursor: pointer;
      border-radius: 5px;
      box-shadow: 0 0 10px #00f2ff;
    ">Play Again</button>
  `;

  document.body.appendChild(popup);

  document.getElementById("playAgainButton").addEventListener("click", () => {
    popup.remove();
    resetGame();
  });
}

function showFailPopup(message = "❌ Wrong Wire! You Failed.") {
  const popup = document.createElement("div");
  popup.id = "failPopup";
  popup.style.position = "absolute";
  popup.style.top = "40%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "#111";
  popup.style.border = "2px solid red";
  popup.style.color = "red";
  popup.style.padding = "40px 60px";
  popup.style.fontSize = "1.8em";
  popup.style.textAlign = "center";
  popup.style.zIndex = "9999";
  popup.style.boxShadow = "0 0 20px red";
  popup.style.fontFamily = "Courier New, monospace";

  popup.innerHTML = `
    ${message}<br><br>
    <button id="failPlayAgainButton" style="
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 1em;
        background: red;
        color: black;
        border: none;
        cursor: pointer;
        border-radius: 5px;
        box-shadow: 0 0 10px red;
    ">Play Again</button>
    `;


  document.body.appendChild(popup);

  document.getElementById("failPlayAgainButton").addEventListener("click", () => {
    popup.remove();
    resetGame();
  });
}


function resetGame() {
  successCount = 0;
  round = 0;
  gameOver = false;
  updateStatus("");
  updateRoundDisplay();
  startRound();
}

window.addEventListener("click", function playMusicOnce() {
  const music = document.getElementById("bg-music");
  if (music && music.paused) {
    music.volume = 0.3;
    const playPromise = music.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => console.log("🎵 Background music playing"))
        .catch((err) => console.warn("🎵 Music blocked:", err));
    }
  }
  window.removeEventListener("click", playMusicOnce); // run only once
});
