document.addEventListener("DOMContentLoaded", () => {
  // ==================== Game Wrappers ====================
  const dinoWrapper = document.getElementById("dinoWrapper");
  const minisweeperWrapper = document.getElementById("minisweeperWrapper");
  const snakeWrapper = document.getElementById("snakeWrapper");
  const gameSelect = document.getElementById("gameSelect");

  [dinoWrapper, minisweeperWrapper, snakeWrapper].forEach(wrapper => wrapper.classList.add("hidden"));

  // ==================== Dino Game ====================
  const dinoCanvas = document.getElementById("dinoCanvas");
  const dinoCtx = dinoCanvas.getContext("2d");
  const startDinoBtn = document.getElementById("startDinoBtn");
  const stopDinoBtn = document.getElementById("stopDinoBtn");

  let dinoInterval, dinoScore = 0, obstacles = [];
  const dino = { x: 50, y: 120, width: 40, height: 40, dy: 0, jumping: false };
  const gravity = 0.6;
  const dinoImg = new Image(); dinoImg.src = "loginImages/googleDino.png";
  const cactusImg = new Image(); cactusImg.src = "loginImages/googleCactus.png";

  function resetDino() {
    dinoScore = 0;
    obstacles = [];
    dino.y = 120;
    dino.dy = 0;
    dino.jumping = false;
  }

  function spawnObstacle() {
    obstacles.push({ x: dinoCanvas.width, y: 120, width: 20, height: 40 });
  }

  function updateDino() {
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);

    // Background & ground
    dinoCtx.fillStyle = "#f0f0f0";
    dinoCtx.fillRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    dinoCtx.fillStyle = "#c2b280";
    dinoCtx.fillRect(0, 160, dinoCanvas.width, 40);

    // Dino physics
    dino.dy += gravity;
    dino.y += dino.dy;
    if (dino.y > 120) { dino.y = 120; dino.dy = 0; dino.jumping = false; }

    // Draw Dino
    if (dinoImg.complete) dinoCtx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    else dinoCtx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Obstacles
    for (let obs of obstacles) {
      obs.x -= 3;
      if (cactusImg.complete) dinoCtx.drawImage(cactusImg, obs.x, obs.y, obs.width, obs.height);
      else dinoCtx.fillRect(obs.x, obs.y, obs.width, obs.height);

      if (
        dino.x < obs.x + obs.width &&
        dino.x + dino.width > obs.x &&
        dino.y < obs.y + obs.height &&
        dino.y + dino.height > obs.y
      ) {
        stopDino();
        alert("Game Over! Score: " + dinoScore);
      }
    }

    if (Math.random() < 0.02) spawnObstacle();

    // Score
    dinoScore++;
    dinoCtx.fillStyle = "#000";
    dinoCtx.font = "14px Arial";
    dinoCtx.fillText("Score: " + dinoScore, 10, 15);
  }

  document.addEventListener("keydown", e => {
    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.jumping) {
      dino.dy = -12;
      dino.jumping = true;
    }
  });

  function startDino() { resetDino(); clearInterval(dinoInterval); dinoInterval = setInterval(updateDino, 20); }
  function stopDino() { clearInterval(dinoInterval); dinoInterval = null; }

  startDinoBtn.addEventListener("click", startDino);
  stopDinoBtn.addEventListener("click", () => { stopDino(); resetDino(); dinoWrapper.classList.add("hidden"); gameSelect.value = ""; });

  // ==================== MiniSweep Game ====================
  const gridSize = 8, mineCount = 10, grid = [];
  const gridElement = document.getElementById("minisweeperGrid");
  const startMiniSweepBtn = document.getElementById("startMiniSweepBtn");
  const stopMiniSweepBtn = document.getElementById("stopMiniSweepBtn");
  let miniSweepActive = false;

  function initMiniSweep() {
    miniSweepActive = true;
    gridElement.innerHTML = "";
    grid.length = 0;

    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { mine: false, revealed: false, element: null, count: 0 };
        const cell = document.createElement("button");
        cell.className = "cell btn btn-sm m-0";
        cell.type = "button";
        cell.addEventListener("click", () => miniSweepActive && revealCell(i, j));
        grid[i][j].element = cell;
        gridElement.appendChild(cell);
      }
    }

    let placed = 0;
    while (placed < mineCount) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if (!grid[r][c].mine) { grid[r][c].mine = true; placed++; }
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!grid[i][j].mine) {
          let count = 0;
          for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++)
              if (i + dx >= 0 && i + dx < gridSize && j + dy >= 0 && j + dy < gridSize)
                if (grid[i + dx][j + dy].mine) count++;
          grid[i][j].count = count;
        }
      }
    }
  }

  function revealCell(i, j) {
    const cell = grid[i][j];
    if (cell.revealed || !miniSweepActive) return;

    cell.revealed = true;
    cell.element.disabled = true;
    cell.element.style.border = "1px solid #999";
    cell.element.style.padding = "0";
    cell.element.style.fontWeight = "bold";

    if (cell.mine) {
      cell.element.textContent = "💣";
      cell.element.style.backgroundColor = "#ff4d4d";
      cell.element.style.color = "black";
      miniSweepActive = false;
      setTimeout(() => alert("Game Over!"), 100);
    } else {
      if (cell.count > 0) {
        cell.element.textContent = cell.count;
        const colors = ["","blue","green","red","darkblue","brown","cyan","black","gray"];
        cell.element.style.color = colors[cell.count];
      }
      cell.element.style.backgroundColor = "#ddd";

      if (cell.count === 0)
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (i + dx >= 0 && i + dx < gridSize && j + dy >= 0 && j + dy < gridSize)
              revealCell(i + dx, j + dy);
    }
  }

  startMiniSweepBtn.addEventListener("click", initMiniSweep);
  stopMiniSweepBtn.addEventListener("click", () => { miniSweepActive = false; gridElement.innerHTML = ""; minisweeperWrapper.classList.add("hidden"); gameSelect.value = ""; });

  // ==================== Snake Game ====================
  const snakeCanvas = document.getElementById("snakeCanvas");
  const snakeScore = document.getElementById("snakeScore");
  const startSnakeBtn = document.getElementById("startSnakeBtn");
  const stopSnakeBtn = document.getElementById("stopSnakeBtn");

  let snakeInterval, snakeDirection = "RIGHT";

  function initSnake() {
    const ctx = snakeCanvas.getContext("2d");
    const gridSize = 10;
    const gridCols = snakeCanvas.width / gridSize;
    const gridRows = snakeCanvas.height / gridSize;

    let snake = [{ x: 9, y: 9 }];
    let score = 0;
    let apple = { x: Math.floor(Math.random() * gridCols), y: Math.floor(Math.random() * gridRows) };

    const snakeHeadImg = new Image(); snakeHeadImg.src = "loginImages/googleSnakeHead.png";
    const snakeBodyImg = new Image(); snakeBodyImg.src = "loginImages/googleSnake.png";
    const appleImg = new Image(); appleImg.src = "loginImages/googleApple.png";

    function drawGame() {
      const newHead = { ...snake[0] };
      if (snakeDirection === "UP") newHead.y--;
      if (snakeDirection === "DOWN") newHead.y++;
      if (snakeDirection === "LEFT") newHead.x--;
      if (snakeDirection === "RIGHT") newHead.x++;

      if (newHead.x < 0 || newHead.y < 0 || newHead.x >= gridCols || newHead.y >= gridRows || snake.some(p => p.x === newHead.x && p.y === newHead.y)) {
        clearInterval(snakeInterval);
        alert("Game Over! Score: " + score);
        snakeScore.textContent = "Score: 0";
        return;
      }

      snake.unshift(newHead);
      if (newHead.x === apple.x && newHead.y === apple.y) { score++; snakeScore.textContent = "Score: " + score; apple = { x: Math.floor(Math.random() * gridCols), y: Math.floor(Math.random() * gridRows) }; }
      else snake.pop();

      ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
      ctx.drawImage(appleImg, apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);
      snake.forEach((part, idx) => { ctx.drawImage(idx === 0 ? snakeHeadImg : snakeBodyImg, part.x * gridSize, part.y * gridSize, gridSize, gridSize); });
    }

    clearInterval(snakeInterval);
    snakeInterval = setInterval(drawGame, 120);

    window.addEventListener("keydown", e => {
      if (e.code === "ArrowUp" && snakeDirection !== "DOWN") snakeDirection = "UP";
      if (e.code === "ArrowDown" && snakeDirection !== "UP") snakeDirection = "DOWN";
      if (e.code === "ArrowLeft" && snakeDirection !== "RIGHT") snakeDirection = "LEFT";
      if (e.code === "ArrowRight" && snakeDirection !== "LEFT") snakeDirection = "RIGHT";
    });
  }

  startSnakeBtn.addEventListener("click", initSnake);
  stopSnakeBtn.addEventListener("click", () => { clearInterval(snakeInterval); snakeInterval = null; snakeWrapper.classList.add("hidden"); snakeScore.textContent = "Score: 0"; gameSelect.value = ""; });

  // ==================== Game Selection ====================
  gameSelect.addEventListener("change", () => {
    [dinoWrapper, minisweeperWrapper, snakeWrapper].forEach(wrapper => wrapper.classList.add("hidden"));
    stopDino(); miniSweepActive = false; clearInterval(snakeInterval);

    if (gameSelect.value === "dino") dinoWrapper.classList.remove("hidden");
    if (gameSelect.value === "minisweeper") minisweeperWrapper.classList.remove("hidden");
    if (gameSelect.value === "snake") snakeWrapper.classList.remove("hidden");
  });
});
