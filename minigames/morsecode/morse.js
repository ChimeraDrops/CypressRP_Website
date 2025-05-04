const morseCode = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.',
    G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..',
    M: '--', N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.',
    S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
    Y: '-.--', Z: '--..'
  };
  
  const wordsByLength = {
    4: ["MATH", "BIRD", "WIND", "FIRE", "JUMP"],
    6: ["PLANET", "BUTTON", "GARDEN", "HANDLE", "STREAM"],
    8: ["ELEPHANT", "MOUNTAIN", "TREASURE", "PLATFORM", "SECURITY"]
  };
  
  let stage = 1;
  let word = '';
  let timer;
  let timeLeft = 60;
  let gameOver = false;
  let replayTimeout;
  
  const morseOutput = document.getElementById('morseOutput');
  const inputField = document.getElementById('inputField');
  const timerDiv = document.getElementById('timer');
  
  function playBeep(symbol, delay, context) {
    const duration = symbol === '.' ? 100 : 300;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, context.currentTime + delay / 1000);
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.1, context.currentTime + delay / 1000);
    oscillator.start(context.currentTime + delay / 1000);
    oscillator.stop(context.currentTime + delay / 1000 + duration / 1000);
  }
  
  function playMorse(word) {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    morseOutput.innerText = '';
    let delay = 3000;
    for (let letter of word) {
      const morse = morseCode[letter];
      morseOutput.innerText += morse + ' ';
      for (let symbol of morse) {
        playBeep(symbol, delay, context);
        delay += 400;
      }
      delay += 600;
    }
    clearTimeout(replayTimeout);
    if (!gameOver) {
      replayTimeout = setTimeout(() => playMorse(word), delay + 3000);
    }
  }
  
  function generateWord(stage) {
    const length = stage === 1 ? 4 : stage === 2 ? 6 : 8;
    const options = wordsByLength[length];
    return options[Math.floor(Math.random() * options.length)].toUpperCase();
  }
  
  function startStage() {
    inputField.value = '';
    timeLeft = stage === 1 ? 60 : stage === 2 ? 70 : 90;
    timerDiv.innerText = `Time left: ${timeLeft}s`;
    word = generateWord(stage);
    setTimeout(() => playMorse(word), 3000);
    clearInterval(timer);
    timer = setInterval(() => {
      timeLeft--;
      timerDiv.innerText = `Time left: ${timeLeft}s`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearTimeout(replayTimeout);
        gameOver = true;
        alert(`Time's up! The correct word was ${word}\nGame over.`);
      }
    }, 1000);
  }
  
  function nextStage() {
    stage++;
    if (stage > 3) {
      alert("Congratulations, you've completed all stages!");
    } else {
      startStage();
    }
  }
  
  document.getElementById('submitBtn').addEventListener('click', () => {
    const input = inputField.value.toUpperCase();
    if (input === word) {
      clearInterval(timer);
      clearTimeout(replayTimeout);
      if (stage >= 3) {
        alert("Congratulations, you've completed all stages!");
      } else {
        alert('Correct! Moving to next stage.');
        nextStage();
      }
    } else {
      clearInterval(timer);
      clearTimeout(replayTimeout);
      gameOver = true;
      alert('Incorrect. Game over.');
    }
  });
  
  function buildReferenceTable() {
    const table = document.getElementById('morseTable');
    for (let [letter, code] of Object.entries(morseCode)) {
      const div = document.createElement('div');
      div.classList.add('ref-cell');
      div.innerText = `${letter}: ${code}`;
      table.appendChild(div);
    }
  }
  
  buildReferenceTable();
  startStage();
  