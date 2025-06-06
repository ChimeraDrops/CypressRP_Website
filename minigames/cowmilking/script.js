const hand = document.getElementById("hand");
const udderAnim = document.getElementById("udder-anim");
const milkFill = document.getElementById("milk-fill");
const teatZones = document.querySelectorAll(".teat-zone");
const squirtSound = document.getElementById("squirt-sound");

let milkLevel = 0;
let lastTeat = null;
let isDragging = false;
let currentTeat = null;
let startY = 0;
let squirtTriggered = false;
let currentUdderFrame = "";
let handInZone = false;
let gameOver = false;

const handFrames = [
  "images/hand-1.png",
  "images/hand-2.png",
  "images/hand-3.png",
  "images/hand-4.png"
];

const udderFrames = {
  1: ["images/udder1-1.png", "images/udder1-2.png", "images/udder1-3.png"],
  2: ["images/udder2-1.png", "images/udder2-2.png", "images/udder2-3.png"],
  3: ["images/udder3-1.png", "images/udder3-2.png", "images/udder3-3.png"],
  4: ["images/udder4-1.png", "images/udder4-2.png", "images/udder4-3.png"]
};

document.addEventListener("mousemove", (e) => {
  const gameRect = document.getElementById("game").getBoundingClientRect();
  const relX = e.clientX - gameRect.left;
  const relY = e.clientY - gameRect.top;

  hand.style.left = `${relX - 32}px`;
  hand.style.top = `${relY - 32}px`;

  if (gameOver || !isDragging || !currentTeat) return;

  const distance = e.clientY - startY;
  const frames = udderFrames[currentTeat];
  let selectedFrame = null;

  if (distance >= 60) {
    selectedFrame = frames[2];
    if (!squirtTriggered) {
      squirtMilk(currentTeat);
      squirtTriggered = true;
    }
  } else if (distance >= 40) {
    selectedFrame = frames[1];
  } else if (distance >= 20) {
    selectedFrame = frames[0];
  }

  if (selectedFrame && selectedFrame !== currentUdderFrame) {
    udderAnim.style.display = "block";
    udderAnim.src = selectedFrame;
    currentUdderFrame = selectedFrame;
  }
});

teatZones.forEach(zone => {
  const id = parseInt(zone.dataset.id);

  zone.addEventListener("mousedown", (e) => {
    if (gameOver || lastTeat === id) return;

    currentTeat = id;
    isDragging = true;
    startY = e.clientY;
    squirtTriggered = false;
    currentUdderFrame = "";
    handInZone = true;

    squirtSound.volume = 1.0;
    squirtSound.currentTime = 0;
    squirtSound.play().catch(err => console.warn("Audio blocked:", err));

    animateHandIn();
  });
});

document.addEventListener("mouseup", () => {
  if (isDragging) {
    isDragging = false;
    currentTeat = null;
    animateHandOut();
    resetUdderToBase();
  }
});

function animateHandIn() {
  hand.src = handFrames[0];
  setTimeout(() => hand.src = handFrames[1], 250);
  setTimeout(() => hand.src = handFrames[2], 500);
  setTimeout(() => hand.src = handFrames[3], 750);
}

function animateHandOut() {
  hand.src = handFrames[2];
  setTimeout(() => hand.src = handFrames[1], 250);
  setTimeout(() => hand.src = handFrames[0], 500);
}

function resetUdderToBase() {
  udderAnim.src = "";
  currentUdderFrame = "";
}

function squirtMilk(teatID) {
  if (gameOver) return;

  lastTeat = teatID;
  milkLevel = Math.min(milkLevel + 10, 100);
  milkFill.style.height = milkLevel + "%";

  if (milkLevel >= 100) {
    gameOver = true;
    setTimeout(() => {
      alert("The bucket is full! Game over.");
    }, 200);
  }
}
