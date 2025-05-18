document.addEventListener('DOMContentLoaded', () => {
  const drone = document.getElementById('drone');
  const obstaclesContainer = document.getElementById('obstacles-container');
  const music = document.getElementById('background-music');
  const startButton = document.getElementById('start-button');

  const totalSlots = 5;
  const slotHeight = 100;
  const droneHeight = 40;
  let dronePosition = 2;
  let score = 0;
  let highScore = localStorage.getItem('highScore') || 0;

  function updateDronePosition() {
    const slotCenter = dronePosition * slotHeight + slotHeight / 2;
    const topOffset = slotCenter - droneHeight / 2;
    drone.style.top = `${topOffset}px`;
  }

  function startGame() {
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.position = 'absolute';
    scoreDisplay.style.top = '10px';
    scoreDisplay.style.left = '10px';
    scoreDisplay.style.fontSize = '18px';
    scoreDisplay.style.color = 'white';
    scoreDisplay.style.fontFamily = 'monospace';
    scoreDisplay.style.zIndex = '100';
    scoreDisplay.innerText = `Score: 0 | High Score: ${highScore}`;
    document.getElementById('game-container').appendChild(scoreDisplay);

    updateDronePosition();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'w' && dronePosition > 0) {
        dronePosition--;
      } else if (e.key === 's' && dronePosition < totalSlots - 1) {
        dronePosition++;
      }
      updateDronePosition();
    });

    function spawnWall() {
      const gapStart = Math.floor(Math.random() * totalSlots);
      const gapBuffer = 20;
      const gapHeight = droneHeight + gapBuffer * 2;
      const slotCenter = gapStart * slotHeight + slotHeight / 2;
      const gapTop = slotCenter - gapHeight / 2;

      const topWall = document.createElement('div');
      topWall.classList.add('wall');
      topWall.style.height = `${gapTop}px`;
      topWall.style.top = `0`;
      obstaclesContainer.appendChild(topWall);

      const bottomWall = document.createElement('div');
      bottomWall.classList.add('wall');
      const bottomTop = gapTop + gapHeight;
      const bottomHeight = 500 - bottomTop;
      bottomWall.style.height = `${bottomHeight}px`;
      bottomWall.style.top = `${bottomTop}px`;
      obstaclesContainer.appendChild(bottomWall);

      setTimeout(() => {
        const droneCenter = dronePosition * slotHeight + slotHeight / 2;
        const droneTop = droneCenter - droneHeight / 2;
        const droneBottom = droneCenter + droneHeight / 2;

        if (droneTop < gapTop || droneBottom > gapTop + gapHeight) {
          alert(`💥 You crashed into a wall!\nFinal Score: ${score}`);
          if (score > highScore) {
            localStorage.setItem('highScore', score);
          }
          window.location.reload();
        } else {
          score++;
          scoreDisplay.innerText = `Score: ${score} | High Score: ${Math.max(score, highScore)}`;
        }
      }, 750);
    }

    setInterval(spawnWall, 2500);
  }

  // Start button event
  startButton.addEventListener('click', () => {
    startButton.style.display = 'none';
    music.volume = 0.5;
    music.play();
    startGame();
  });
});
