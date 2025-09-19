document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  // 🎵 Music setup
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

  // Example users
  const users = [
    { username: "creator1", password: "creator123", role: "creator" },
    { username: "host1", password: "host123", role: "host" },
    { username: "player1", password: "player123", role: "player" },
    { username: "player2", password: "player123", role: "player" },
  ];

  loginForm.addEventListener("submit", function (e) {
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
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      let loggedInUsers =
        JSON.parse(localStorage.getItem("loggedInUsers")) || [];
      if (!loggedInUsers.some((u) => u.username === username)) {
        loggedInUsers.push({ username, role });
        localStorage.setItem("loggedInUsers", JSON.stringify(loggedInUsers));
      }

      window.location.href = "index.html";
    } else {
      loginError.style.display = "block";
    }
  });

  // ==================== Background Change Button ====================
  const backgrounds = [
    "url('loginImages/dndbgimage2.jpg') no-repeat center center / cover",
    "linear-gradient(to right, #ff7e5f, #feb47b)",
    "url('loginImages/dndbgimage3.jpg') no-repeat center center/ cover",
    "linear-gradient(to right, #6a11cb, #2575fc)",
    "url('loginImages/dndbgimage4.jpg') no-repeat center center/ cover",
    "linear-gradient(to right, #43cea2, #185a9d)",
    "linear-gradient(to right, #f0e68c, #add8e6)",
  ];
  let currentBg = 0;
  const changeBgBtn = document.getElementById("changeBgBtn");
  document.body.style.background = backgrounds[currentBg];

  if (changeBgBtn) {
    changeBgBtn.addEventListener("click", () => {
      currentBg = (currentBg + 1) % backgrounds.length;
      document.body.style.background = backgrounds[currentBg];
    });
  }

  // ==================== Dino Game ====================
  const canvas = document.getElementById("dinoCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 200;

  let dino = { x: 50, y: 120, width: 40, height: 40, dy: 0, jumping: false };
  let gravity = 0.6;
  let obstacles = [];
  let score = 0;

  const dinoImg = new Image();
  dinoImg.src = "loginImages/googleDino.png";

  const cactusImg = new Image();
  cactusImg.src = "loginImages/googleCactus.png";

  function spawnObstacle() {
    obstacles.push({ x: canvas.width, y: 120, width: 20, height: 40 });
  }

  function updateDino() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#c2b280";
    ctx.fillRect(0, 160, canvas.width, 40);

    dino.dy += gravity;
    dino.y += dino.dy;
    if (dino.y > 120) {
      dino.y = 120;
      dino.dy = 0;
      dino.jumping = false;
    }

    if (dinoImg.complete)
      ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    else ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    for (let obs of obstacles) {
      obs.x -= 3;
      if (cactusImg.complete)
        ctx.drawImage(cactusImg, obs.x, obs.y, obs.width, obs.height);
      else ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

      if (
        dino.x < obs.x + obs.width &&
        dino.x + dino.width > obs.x &&
        dino.y < obs.y + obs.height &&
        dino.y + dino.height > obs.y
      ) {
        obstacles = [];
        score = 0;
      }
    }

    if (Math.random() < 0.02) spawnObstacle();
    score++;
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText("Score: " + score, 10, 15);

    requestAnimationFrame(updateDino);
  }

  document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.jumping) {
      dino.dy = -12;
      dino.jumping = true;
    }
  });

  updateDino();

  // ==================== MiniSweep Game ====================
  const gridSize = 8;
  const mineCount = 10;
  const grid = [];
  const gridElement = document.getElementById("minisweeperGrid");

  function initMiniSweep() {
    gridElement.innerHTML = "";
    grid.length = 0;

    for (let i = 0; i < gridSize; i++) {
      grid[i] = [];
      for (let j = 0; j < gridSize; j++) {
        grid[i][j] = { mine: false, revealed: false, element: null, count: 0 };
        const cell = document.createElement("button");
        cell.className = "cell btn btn-sm m-0";
        cell.addEventListener("click", () => revealCell(i, j));
        grid[i][j].element = cell;
        gridElement.appendChild(cell);
      }
    }

    let placed = 0;
    while (placed < mineCount) {
      let r = Math.floor(Math.random() * gridSize);
      let c = Math.floor(Math.random() * gridSize);
      if (!grid[r][c].mine) {
        grid[r][c].mine = true;
        placed++;
      }
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        if (!grid[i][j].mine) {
          let count = 0;
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              let ni = i + dx;
              let nj = j + dy;
              if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize) {
                if (grid[ni][nj].mine) count++;
              }
            }
          }
          grid[i][j].count = count;
        }
      }
    }
  }

function revealCell(i, j) {
  const cell = grid[i][j];
  if (cell.revealed) return;

  cell.revealed = true;
  cell.element.disabled = true;
  cell.element.style.border = "1px solid #999";
  cell.element.style.padding = "0";
  cell.element.style.fontWeight = "bold";

  if (cell.mine) {
    cell.element.textContent = "💣";
    cell.element.style.backgroundColor = "#ff4d4d";
    cell.element.style.color = "black";
    // Only show alert after a short delay so bomb is visible
    setTimeout(() => {
      alert("Game Over!");
      initMiniSweep();
    }, 100); // 100ms delay
  } else {
    if (cell.count > 0) {
      cell.element.textContent = cell.count;
      const colors = ["", "blue", "green", "red", "darkblue", "brown", "cyan", "black", "gray"];
      cell.element.style.color = colors[cell.count];
    }
    cell.element.style.backgroundColor = "#ddd";

    if (cell.count === 0) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          let ni = i + dx;
          let nj = j + dy;
          if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize) {
            revealCell(ni, nj);
          }
        }
      }
    }
  }
}


  initMiniSweep();

  // ==================== Game Selection Dropdown ====================
  const gameSelect = document.getElementById("gameSelect");
  const dinoWrapper = document.getElementById("dinoWrapper");
  const minisweeperWrapper = document.getElementById("minisweeperWrapper");

  // Hide both games initially using CSS class
  dinoWrapper.classList.add("hidden");
  minisweeperWrapper.classList.add("hidden");

  gameSelect.addEventListener("change", () => {
    if (gameSelect.value === "dino") {
      dinoWrapper.classList.remove("hidden");
      minisweeperWrapper.classList.add("hidden");
    } else if (gameSelect.value === "minisweeper") {
      minisweeperWrapper.classList.remove("hidden");
      dinoWrapper.classList.add("hidden");
    }
  });
});
