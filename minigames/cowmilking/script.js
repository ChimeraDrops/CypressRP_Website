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
  "images/34BCH7PX/hand-1.png",
  "images/bG1931gF/hand-2.png",
  "images/xXwPv6vz/hand-3.png",
  "images/PphzcNFf/hand-4.png"
];

const udderFrames = {
  1: [
    "images/hJkLsLCJ/udder1-1.png",
    "images/k6Wxp2ZT/udder1-2.png",
    "images/LnhkGcvP/udder1-3.png"
  ],
  2: [
    "images/n9kqn6n7/udder2-1.png",
    "images/XB3wSV64/udder2-2.png",
    "images/gwbvXnpy/udder2-3.png"
  ],
  3: [
    "images/7bycY0xY/udder3-1.png",
    "images/w3crtMv5/udder3-2.png",
    "images/Q905ymTS/udder3-3.png"
  ],
  4: [
    "images/2VkKnYbs/udder4-1.png",
    "images/56sk3r86/udder4-2.png",
    "images/pyczQ0xL/udder4-3.png"
  ]
};

document.addEventListener("mousemove", (e) => {
  const gameRect = document.getElementById("game").getBoundingClientRect();

  const relX = e.clientX - gameRect.left;
  const relY = e.clientY - gameRect.top;

  const x = relX - 32;
  const y = relY - 32;
  hand.style.left = `${x}px`;
  hand.style.top = `${y}px`;

  if (gameOver || !isDragging || !currentTeat) return;

  const zone = document.querySelector(`.teat-zone[data-id="${currentTeat}"]`);
  if (!zone) return;

  const rect = zone.getBoundingClientRect();
  const inBounds = e.clientX >= rect.left && e.clientX <= rect.right &&
                   e.clientY >= rect.top && e.clientY <= rect.bottom;

  if (!inBounds) {
    if (handInZone) {
      resetUdderToBase();
      handInZone = false;
    }
    return;
  }

  handInZone = true;

  const distance = e.clientY - startY;
  const frames = udderFrames[currentTeat];
  let selectedFrame = null;

  if (distance >= 60 && frames[2]) {
    selectedFrame = frames[2];
    if (!squirtTriggered) {
      squirtMilk(currentTeat);
      squirtTriggered = true;
    }
  } else if (distance >= 40 && frames[1]) {
    selectedFrame = frames[1];
  } else if (distance >= 20 && frames[0]) {
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
    isDragging = true;
    currentTeat = id;
    startY = e.clientY;
    squirtTriggered = false;
    currentUdderFrame = "";
    handInZone = true;

    // Trigger squirt sound on click to satisfy browser autoplay rules
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
