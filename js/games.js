// ------------------ Dino Game with High Score ------------------
let dinoInterval, obstacleInterval;
let dino = { x: 50, y: 160, width: 20, height: 20, vy: 0, jumping: false };
let obstacles = [];
let score = 0;
let highScore = parseInt(localStorage.getItem("dinoHighScore")) || 0;

function startDinoGame() {
  const canvas = document.getElementById("dinoCanvas");
  const ctx = canvas.getContext("2d");

  // Reset
  dino.y = 160;
  dino.vy = 0;
  dino.jumping = false;
  obstacles = [];
  score = 0;

  // Listen for jump
  document.addEventListener("keydown", jumpDino);

  dinoInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gravity
    if (dino.jumping) {
      dino.vy += 1;
      dino.y += dino.vy;
      if (dino.y >= 160) {
        dino.y = 160;
        dino.vy = 0;
        dino.jumping = false;
      }
    }

    // Draw ground
    ctx.fillStyle = "#888";
    ctx.fillRect(0, 180, canvas.width, 20);

    // Draw Dino
    ctx.fillStyle = "green";
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw obstacles
    ctx.fillStyle = "red";
    obstacles.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      obs.x -= 5;

      // Collision detection
      if (dino.x < obs.x + obs.width &&
          dino.x + dino.width > obs.x &&
          dino.y < obs.y + obs.height &&
          dino.y + dino.height > obs.y) {
        stopDinoGame();
        alert(`Game Over! Your score: ${score} | High Score: ${highScore}`);
      }

      // Increase score if obstacle passes Dino
      if (!obs.passed && obs.x + obs.width < dino.x) {
        obs.passed = true;
        score++;
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("dinoHighScore", highScore);
        }
      }
    });

    // Remove off-screen obstacles
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Display score and high score
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 10, 20);
    ctx.fillText("High Score: " + highScore, 10, 40);
  }, 30);

  // Spawn obstacles every 2 seconds
  obstacleInterval = setInterval(() => {
    const height = 20 + Math.random() * 20;
    obstacles.push({ x: canvas.width, y: 180 - height, width: 20, height, passed: false });
  }, 2000);
}

function jumpDino(e) {
  if (e.key === " " || e.key === "ArrowUp") {
    if (!dino.jumping) {
      dino.jumping = true;
      dino.vy = -12;
    }
  }
}

function stopDinoGame() {
  clearInterval(dinoInterval);
  clearInterval(obstacleInterval);
  obstacles = [];
  score = 0;

  const canvas = document.getElementById("dinoCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  document.removeEventListener("keydown", jumpDino);
}


// ------------------ MiniSweeper Game ------------------
let miniGrid = [];

function startMiniSweeper() {
  const gridSize = 5;
  const totalMines = 5;
  const gridContainer = document.getElementById("minisweeperGrid");

  gridContainer.innerHTML = "";
  miniGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill({mine:false, revealed:false}));

  let minesPlaced = 0;
  while (minesPlaced < totalMines) {
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);
    if (!miniGrid[row][col].mine) {
      miniGrid[row][col] = {mine: true, revealed: false};
      minesPlaced++;
    }
  }

  for (let r = 0; r < gridSize; r++) {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("d-flex", "justify-content-center");
    for (let c = 0; c < gridSize; c++) {
      const cellBtn = document.createElement("button");
      cellBtn.className = "btn btn-sm btn-secondary m-1";
      cellBtn.style.width = "40px";
      cellBtn.style.height = "40px";

      cellBtn.addEventListener("click", () => revealCell(r, c, cellBtn));

      rowDiv.appendChild(cellBtn);
    }
    gridContainer.appendChild(rowDiv);
  }
}

function revealCell(row, col, button) {
  const cell = miniGrid[row][col];
  if (cell.revealed) return;

  cell.revealed = true;
  if (cell.mine) {
    button.style.backgroundColor = "red";
    alert("Boom! You hit a mine!");
    stopMiniSweeper();
  } else {
    button.style.backgroundColor = "lightgreen";
  }
}

function stopMiniSweeper() {
  const gridContainer = document.getElementById("minisweeperGrid");
  gridContainer.innerHTML = "";
  miniGrid = [];
}


// ------------------ Snake Game ------------------
let snake = [];
let direction = "RIGHT";
let nextDirection = "RIGHT";
let food = {};
let snakeInterval;
let snakeScore = 0;

const snakeCanvas = document.getElementById("snakeCanvas");
const snakeCtx = snakeCanvas.getContext("2d");
const scoreDisplay = document.getElementById("snakeScore");

const cellSize = 20;
const canvasSize = 200;
const cellsPerRow = canvasSize / cellSize;

function startSnakeGame() {
  clearInterval(snakeInterval);
  snake = [{x: 2, y: 2}];
  direction = "RIGHT";
  nextDirection = "RIGHT";
  snakeScore = 0;
  scoreDisplay.textContent = `Score: ${snakeScore}`;
  placeFood();
  drawSnake();

  snakeInterval = setInterval(updateSnake, 200);

  document.addEventListener("keydown", handleKeyDown);
}

function stopSnakeGame() {
  clearInterval(snakeInterval);
  snakeCtx.clearRect(0, 0, canvasSize, canvasSize);
  snake = [];
  snakeScore = 0;
  scoreDisplay.textContent = `Score: ${snakeScore}`;
  document.removeEventListener("keydown", handleKeyDown);
}

function handleKeyDown(e) {
  switch(e.key) {
    case "ArrowUp": case "w": case "W":
      if (direction !== "DOWN") nextDirection = "UP";
      break;
    case "ArrowDown": case "s": case "S":
      if (direction !== "UP") nextDirection = "DOWN";
      break;
    case "ArrowLeft": case "a": case "A":
      if (direction !== "RIGHT") nextDirection = "LEFT";
      break;
    case "ArrowRight": case "d": case "D":
      if (direction !== "LEFT") nextDirection = "RIGHT";
      break;
  }
}

function updateSnake() {
  direction = nextDirection;
  const head = {...snake[0]};
  switch(direction) {
    case "UP": head.y--; break;
    case "DOWN": head.y++; break;
    case "LEFT": head.x--; break;
    case "RIGHT": head.x++; break;
  }

  if (head.x < 0 || head.y < 0 || head.x >= cellsPerRow || head.y >= cellsPerRow ||
      snake.some(s => s.x === head.x && s.y === head.y)) {
    alert("Game Over!");
    stopSnakeGame();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    snakeScore++;
    scoreDisplay.textContent = `Score: ${snakeScore}`;
    placeFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function drawSnake() {
  snakeCtx.clearRect(0, 0, canvasSize, canvasSize);
  snakeCtx.fillStyle = "green";
  snake.forEach(segment => snakeCtx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize));
  snakeCtx.fillStyle = "red";
  snakeCtx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
}

function placeFood() {
  let valid = false;
  while(!valid) {
    const x = Math.floor(Math.random() * cellsPerRow);
    const y = Math.floor(Math.random() * cellsPerRow);
    if (!snake.some(s => s.x === x && s.y === y)) {
      food = {x, y};
      valid = true;
    }
  }
}

// ===================== Game Button Listeners =====================

document.addEventListener("DOMContentLoaded", () => {
  // DINO GAME
  const startDinoBtn = document.getElementById("startDinoBtn");
  const stopDinoBtn = document.getElementById("stopDinoBtn");
  if (startDinoBtn && stopDinoBtn) {
    startDinoBtn.addEventListener("click", startDinoGame);
    stopDinoBtn.addEventListener("click", stopDinoGame);
  }

  // MINI SWEEPER
  const startMiniSweepBtn = document.getElementById("startMiniSweepBtn");
  const stopMiniSweepBtn = document.getElementById("stopMiniSweepBtn");
  if (startMiniSweepBtn && stopMiniSweepBtn) {
    startMiniSweepBtn.addEventListener("click", startMiniSweeper);
    stopMiniSweepBtn.addEventListener("click", stopMiniSweeper);
  }

  // SNAKE
  const startSnakeBtn = document.getElementById("startSnakeBtn");
  const stopSnakeBtn = document.getElementById("stopSnakeBtn");
  if (startSnakeBtn && stopSnakeBtn) {
    startSnakeBtn.addEventListener("click", startSnakeGame);
    stopSnakeBtn.addEventListener("click", stopSnakeGame);
  }
});

// ===================== Game Selector =====================
const gameSelect = document.getElementById("gameSelect");

if (gameSelect) {
  gameSelect.addEventListener("change", (e) => {
    const value = e.target.value;

    document.querySelectorAll("#dinoWrapper, #minisweeperWrapper, #snakeWrapper")
      .forEach(div => div.classList.add("hidden"));

    if (value === "dino") document.getElementById("dinoWrapper").classList.remove("hidden");
    if (value === "minisweeper") document.getElementById("minisweeperWrapper").classList.remove("hidden");
    if (value === "snake") document.getElementById("snakeWrapper").classList.remove("hidden");
  });
}
