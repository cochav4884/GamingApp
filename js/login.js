document.addEventListener("DOMContentLoaded", () => {
  // ==================== Login Form ====================
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  // Users database (hardcoded for demo purposes)
  const users = [
    { username: "creator1", password: "creator123", role: "creator" },
    { username: "host1", password: "host123", role: "host" },
    { username: "player1", password: "player123", role: "player" },
    { username: "player2", password: "player123", role: "player" },
  ];

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    const user = users.find(
      (u) =>
        u.username === username && u.password === password && u.role === role
    );

    if (user) {
      loginError.style.display = "none";

      // Store login info in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // Track all logged-in users
      let loggedInUsers =
        JSON.parse(localStorage.getItem("loggedInUsers")) || [];
      if (!loggedInUsers.some((u) => u.username === username)) {
        loggedInUsers.push({ username, role });
        localStorage.setItem("loggedInUsers", JSON.stringify(loggedInUsers));
      }

      // Redirect to main page
      window.location.href = "index.html";
    } else {
      loginError.style.display = "block";
    }
  });

  // ==================== Music Selection ====================
  const musicSelect = document.getElementById("musicSelect");
  const loginMusic = document.getElementById("loginMusic");

  if (musicSelect && loginMusic) {
    loginMusic.src = musicSelect.value;
    loginMusic.play().catch(() => console.log("Autoplay blocked"));

    musicSelect.addEventListener("change", () => {
      loginMusic.src = musicSelect.value;
      loginMusic.play();
    });
  }

  // ==================== Background Selector ====================
  const backgrounds = [
    "url('loginImages/dndbgimage2.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "url('loginImages/dndbgimage3.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #6a11cb, #2575fc)",
    "url('loginImages/dndbgimage4.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #43cea2, #185a9d)",
    "linear-gradient(to right, #f0e68c, #add8e6)",
  ];
  let currentBg = 0;
  const changeBgBtn = document.getElementById("changeBgBtn");

  // Set initial background
  document.body.style.background = backgrounds[currentBg];

  if (changeBgBtn) {
    changeBgBtn.addEventListener("click", () => {
      currentBg = (currentBg + 1) % backgrounds.length;
      document.body.style.background = backgrounds[currentBg];
    });
  }

  // ==================== Game Wrappers ====================
  const dinoWrapper = document.getElementById("dinoWrapper");
  const minisweeperWrapper = document.getElementById("minisweeperWrapper");
  const snakeWrapper = document.getElementById("snakeWrapper");
  const gameSelect = document.getElementById("gameSelect");

  // Hide all games initially
  [dinoWrapper, minisweeperWrapper, snakeWrapper].forEach((wrapper) =>
    wrapper.classList.add("hidden")
  );

  // ==================== Dino Game ====================
  const dinoCanvas = document.getElementById("dinoCanvas");
  const dinoCtx = dinoCanvas.getContext("2d");
  const startDinoBtn = document.getElementById("startDinoBtn");
  const stopDinoBtn = document.getElementById("stopDinoBtn");

  dinoCanvas.width = 400;
  dinoCanvas.height = 200;

  let dinoInterval,
    dinoScore = 0,
    obstacles = [];
  const dino = { x: 50, y: 120, width: 40, height: 40, dy: 0, jumping: false };
  const gravity = 0.6;
  const dinoImg = new Image();
  dinoImg.src = "loginImages/googleDino.png";
  const cactusImg = new Image();
  cactusImg.src = "loginImages/googleCactus.png";

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
    // Clear canvas
    dinoCtx.clearRect(0, 0, dinoCanvas.width, dinoCanvas.height);

    // Draw ground and background
    dinoCtx.fillStyle = "#f0f0f0";
    dinoCtx.fillRect(0, 0, dinoCanvas.width, dinoCanvas.height);
    dinoCtx.fillStyle = "#c2b280";
    dinoCtx.fillRect(0, 160, dinoCanvas.width, 40);

    // Update dino physics
    dino.dy += gravity;
    dino.y += dino.dy;
    if (dino.y > 120) {
      dino.y = 120;
      dino.dy = 0;
      dino.jumping = false;
    }

    // Draw dino
    if (dinoImg.complete)
      dinoCtx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    else dinoCtx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw obstacles and check collisions
    for (let obs of obstacles) {
      obs.x -= 3;
      if (cactusImg.complete)
        dinoCtx.drawImage(cactusImg, obs.x, obs.y, obs.width, obs.height);
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

    // Randomly spawn new obstacles
    if (Math.random() < 0.02) spawnObstacle();

    // Update score
    dinoScore++;
    dinoCtx.fillStyle = "#000";
    dinoCtx.font = "14px Arial";
    dinoCtx.fillText("Score: " + dinoScore, 10, 15);
  }

  document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.jumping) {
      dino.dy = -12;
      dino.jumping = true;
    }
  });

  function startDino() {
    resetDino();
    clearInterval(dinoInterval);
    dinoInterval = setInterval(updateDino, 20);
  }
  function stopDino() {
    clearInterval(dinoInterval);
    dinoInterval = null;
  }

  startDinoBtn.addEventListener("click", startDino);
  stopDinoBtn.addEventListener("click", stopDino);

  // ==================== MiniSweep Game ====================
  const gridSize = 8,
    mineCount = 10,
    grid = [];
  const gridElement = document.getElementById("minisweeperGrid");
  const startMiniSweepBtn = document.getElementById("startMiniSweepBtn");
  const stopMiniSweepBtn = document.getElementById("stopMiniSweepBtn");
  let miniSweepActive = false;

  function initMiniSweep() {
    miniSweepActive = true;
    gridElement.innerHTML = "";
    grid.length = 0;

    // Initialize grid
    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { mine: false, revealed: false, element: null, count: 0 };
        const cell = document.createElement("button");
        cell.className = "cell btn btn-sm m-0";
        cell.type = "button";
        cell.addEventListener(
          "click",
          () => miniSweepActive && revealCell(i, j)
        );
        grid[i][j].element = cell;
        gridElement.appendChild(cell);
      }
    }

    // Place mines randomly
    let placed = 0;
    while (placed < mineCount) {
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      if (!grid[r][c].mine) {
        grid[r][c].mine = true;
        placed++;
      }
    }

    // Count neighboring mines
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!grid[i][j].mine) {
          let count = 0;
          for (let dx = -1; dx <= 1; dx++)
            for (let dy = -1; dy <= 1; dy++)
              if (
                i + dx >= 0 &&
                i + dx < gridSize &&
                j + dy >= 0 &&
                j + dy < gridSize
              )
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
        const colors = [
          "",
          "blue",
          "green",
          "red",
          "darkblue",
          "brown",
          "cyan",
          "black",
          "gray",
        ];
        cell.element.style.color = colors[cell.count];
      }
      cell.element.style.backgroundColor = "#ddd";

      if (cell.count === 0)
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (
              i + dx >= 0 &&
              i + dx < gridSize &&
              j + dy >= 0 &&
              j + dy < gridSize
            )
              revealCell(i + dx, j + dy);
    }
  }

  startMiniSweepBtn.addEventListener("click", initMiniSweep);
  stopMiniSweepBtn.addEventListener("click", () => (miniSweepActive = false));

  // ==================== Snake Game ====================
  const snakeCanvas = document.getElementById("snakeCanvas");
  const snakeScore = document.getElementById("snakeScore");
  const startSnakeBtn = document.getElementById("startSnakeBtn");
  const stopSnakeBtn = document.getElementById("stopSnakeBtn");

  let snakeInterval,
    snakeDirection = "RIGHT";

  function initSnake() {
    const ctx = snakeCanvas.getContext("2d");
    const gridSize = 10;
    const gridCols = snakeCanvas.width / gridSize;
    const gridRows = snakeCanvas.height / gridSize;

    let snake = [{ x: 9, y: 9 }];
    let score = 0;
    let apple = {
      x: Math.floor(Math.random() * gridCols),
      y: Math.floor(Math.random() * gridRows),
    };

    const snakeHeadImg = new Image();
    const snakeBodyImg = new Image();
    const appleImg = new Image();
    snakeHeadImg.src = "loginImages/googleSnakeHead.png";
    snakeBodyImg.src = "loginImages/googleSnake.png";
    appleImg.src = "loginImages/googleApple.png";

    function drawGame() {
      const newHead = { ...snake[0] };
      if (snakeDirection === "UP") newHead.y--;
      if (snakeDirection === "DOWN") newHead.y++;
      if (snakeDirection === "LEFT") newHead.x--;
      if (snakeDirection === "RIGHT") newHead.x++;

      // Collision detection
      if (
        newHead.x < 0 ||
        newHead.y < 0 ||
        newHead.x >= gridCols ||
        newHead.y >= gridRows ||
        snake.some((part) => part.x === newHead.x && part.y === newHead.y)
      ) {
        clearInterval(snakeInterval);
        alert("Game Over! Score: " + score);
        snakeScore.textContent = "Score: 0";
        return;
      }

      snake.unshift(newHead);

      if (newHead.x === apple.x && newHead.y === apple.y) {
        score++;
        snakeScore.textContent = "Score: " + score;
        apple = {
          x: Math.floor(Math.random() * gridCols),
          y: Math.floor(Math.random() * gridRows),
        };
      } else {
        snake.pop();
      }

      ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);
      ctx.drawImage(
        appleImg,
        apple.x * gridSize,
        apple.y * gridSize,
        gridSize,
        gridSize
      );
      snake.forEach((part, idx) => {
        if (idx === 0)
          ctx.drawImage(
            snakeHeadImg,
            part.x * gridSize,
            part.y * gridSize,
            gridSize,
            gridSize
          );
        else
          ctx.drawImage(
            snakeBodyImg,
            part.x * gridSize,
            part.y * gridSize,
            gridSize,
            gridSize
          );
      });
    }

    clearInterval(snakeInterval);
    snakeInterval = setInterval(drawGame, 120);

    // ==================== Key Controls ====================
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();

      if (e.code === "ArrowUp" && snakeDirection !== "DOWN")
        snakeDirection = "UP";
      if (e.code === "ArrowDown" && snakeDirection !== "UP")
        snakeDirection = "DOWN";
      if (e.code === "ArrowLeft" && snakeDirection !== "RIGHT")
        snakeDirection = "LEFT";
      if (e.code === "ArrowRight" && snakeDirection !== "LEFT")
        snakeDirection = "RIGHT";

      if (key === "w" && snakeDirection !== "DOWN") snakeDirection = "UP";
      if (key === "s" && snakeDirection !== "UP") snakeDirection = "DOWN";
      if (key === "a" && snakeDirection !== "RIGHT") snakeDirection = "LEFT";
      if (key === "d" && snakeDirection !== "LEFT") snakeDirection = "RIGHT";
    });
  }

  startSnakeBtn.addEventListener("click", initSnake);
  stopSnakeBtn.addEventListener("click", () => clearInterval(snakeInterval));

  // ==================== Game Selection ====================
  gameSelect.addEventListener("change", () => {
    [dinoWrapper, minisweeperWrapper, snakeWrapper].forEach((wrapper) =>
      wrapper.classList.add("hidden")
    );

    // Stop all games
    stopDino();
    miniSweepActive = false;
    clearInterval(snakeInterval);

    // Show selected game
    if (gameSelect.value === "dino") dinoWrapper.classList.remove("hidden");
    if (gameSelect.value === "minisweeper")
      minisweeperWrapper.classList.remove("hidden");
    if (gameSelect.value === "snake") snakeWrapper.classList.remove("hidden");
  });
});
