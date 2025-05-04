document.addEventListener('DOMContentLoaded', () => {
  const hand = document.getElementById("hand");
  const teatZones = document.querySelectorAll(".teat-zone");
  const milkFill = document.getElementById("milk-fill");
  const udderAnim = document.getElementById("udder-anim");
  const squirtSound = document.getElementById("squirt-sound");

  const handFrames = [
    "images/hand-1.png",
    "images/hand-2.png",
    "images/hand-3.png",
    "images/hand-4.png"
  ];

  let currentFrame = 0;
  let isMouseDown = false;
  let milkLevel = 0;

  document.addEventListener("mousemove", e => {
    hand.style.left = (e.pageX - 540) + "px";
    hand.style.top = (e.pageY + 70) + "px";
  });

  document.addEventListener("mousedown", () => {
    isMouseDown = true;
    animateHand(true);
  });

  document.addEventListener("mouseup", () => {
    isMouseDown = false;
    animateHand(false);
    udderAnim.src = "";
  });

  function animateHand(closing) {
    let i = 0;
    const interval = setInterval(() => {
      if (!isMouseDown && closing) return clearInterval(interval);
      if (i >= handFrames.length) {
        clearInterval(interval);
        return;
      }
      hand.src = handFrames[closing ? i : handFrames.length - 1 - i];
      i++;
    }, 50);
  }

  teatZones.forEach(zone => {
    zone.addEventListener("mousedown", () => {
      const id = zone.getAttribute("data-id");
      if (isMouseDown) {
        animateUdder(id);
        squirtSound.currentTime = 0;
        squirtSound.play();
        milkLevel = Math.min(milkLevel + 5, 100);
        milkFill.style.height = milkLevel + "%";
      }
    });

    zone.addEventListener("mouseup", () => {
      udderAnim.src = "";
    });

    zone.addEventListener("mouseleave", () => {
      if (!isMouseDown) udderAnim.src = "";
    });
  });

  function animateUdder(id) {
    let frame = 1;
    const anim = setInterval(() => {
      if (frame > 3 || !isMouseDown) {
        clearInterval(anim);
        return;
      }
      udderAnim.src = `images/udder${id}-${frame}.png`;
      frame++;
    }, 60);
  }
});
