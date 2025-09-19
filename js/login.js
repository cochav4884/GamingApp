document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

  // 🎵 Music setup
  const musicSelect = document.getElementById("musicSelect");
  const loginMusic = document.getElementById("loginMusic");

  if (musicSelect && loginMusic) {
    // Default song = first option
    loginMusic.src = musicSelect.value;

    // Try to play automatically
    loginMusic.play().catch(() => {
      console.log("Autoplay blocked, will play on user interaction");
    });

    // Change when user selects another
    musicSelect.addEventListener("change", () => {
      loginMusic.src = musicSelect.value;
      loginMusic.play();
    });
  }

  // Example users (replace with your real authentication later)
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

    // Check if user exists
    const user = users.find(
      (u) =>
        u.username === username && u.password === password && u.role === role
    );

    if (user) {
      loginError.style.display = "none";

      // Save current user
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // Add user to global logged-in list
      let loggedInUsers =
        JSON.parse(localStorage.getItem("loggedInUsers")) || [];

      if (!loggedInUsers.some((u) => u.username === username)) {
        loggedInUsers.push({ username, role });
        localStorage.setItem("loggedInUsers", JSON.stringify(loggedInUsers));
      }

      // Redirect to lobby
      window.location.href = "index.html";
    } else {
      loginError.style.display = "block";
    }
  });

  // ==================== Google Dinosaur Mini-Game ====================
const canvas = document.getElementById("dinoCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = 400;
  canvas.height = 200;

  let dino = { x: 50, y: 120, width: 40, height: 40, dy: 0, jumping: false };
  let gravity = 0.6;
  let obstacles = [];
  let score = 0;

  // Load images
  const dinoImg = new Image();
  dinoImg.src = "loginImages/googleDino.png";

  const cactusImg = new Image();
  cactusImg.src = "loginImages/googleCactus.png";

  function spawnObstacle() {
    obstacles.push({ x: canvas.width, y: 120, width: 20, height: 40 });
  }

  function update() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background (ground + sky)
    ctx.fillStyle = "#f0f0f0"; // light gray for sky
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#c2b280"; // brownish for ground
    ctx.fillRect(0, 160, canvas.width, 40); // ground at bottom 40px

    // Dino physics
    dino.dy += gravity;
    dino.y += dino.dy;
    if (dino.y > 120) {
      dino.y = 120;
      dino.dy = 0;
      dino.jumping = false;
    }

    // Draw Dino
    if (dinoImg.complete) {
      ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
    } else {
      ctx.fillStyle = "#00f";
      ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }

    // Obstacles
    for (let i = 0; i < obstacles.length; i++) {
      let obs = obstacles[i];
      obs.x -= 6;

      if (cactusImg.complete) {
        ctx.drawImage(cactusImg, obs.x, obs.y, obs.width, obs.height);
      } else {
        ctx.fillStyle = "#f00";
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      }

      // Collision detection
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

    // Randomly spawn obstacles
    if (Math.random() < 0.02) spawnObstacle();

    // Draw score
    score += 1;
    ctx.fillStyle = "#000";
    ctx.font = "14px Arial";
    ctx.fillText("Score: " + score, 10, 15);

    requestAnimationFrame(update);
  }

  // Jump on space or arrow up
  document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && !dino.jumping) {
      dino.dy = -12;
      dino.jumping = true;
    }
  });

  update();
}

});
