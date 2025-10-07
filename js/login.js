document.addEventListener("DOMContentLoaded", () => {

  // ==================== Users ====================
  const players = [
    { name: "Spartan Nebula", roles: ["creator", "creatorHost"], color: "Orange", password: "SNOrange123" },
    { name: "Zaphina", roles: ["player"], color: "Green", password: "ZGreen123" },
    { name: "Mercy", roles: ["player", "host"], color: "Violet", password: "MViolet123" },
    { name: "Slime", roles: ["player", "host"], color: "Yellow", password: "SYellow123" },
    { name: "LJ", roles: ["player"], color: "Blue", password: "LJBlue123" },
    { name: "Orbital", roles: ["player"], color: "Red", password: "ORed123" },
    { name: "Cyle", roles: ["player"], color: "White", password: "CWhite123" },
    { name: "Silver", roles: ["player", "host"], color: "Pink", password: "Spink123" },
    { name: "StarLord", roles: ["administrator"], color: "Black", password: "SLBlack123" }
  ];

  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const roleSelect = document.getElementById("role");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("loginError");

  // ==================== Dynamic Role Selection ====================
  usernameInput.addEventListener("input", () => {
    const user = players.find(p => p.name === usernameInput.value.trim());
    roleSelect.innerHTML = '<option value="" disabled selected>Select your role</option>';
    if (user) {
      user.roles.forEach(r => {
        const option = document.createElement("option");
        option.value = r;
        option.textContent =
          r === "creatorHost" ? "Creator/Host" :
          r === "playerHost" ? "Player/Host" :
          r === "administrator" ? "Administrator" :
          r.charAt(0).toUpperCase() + r.slice(1);
        roleSelect.appendChild(option);
      });
    }
  });

  // ==================== Login Submission ====================
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const role = roleSelect.value;
    const password = passwordInput.value;

    const user = players.find(p => p.name === username && p.roles.includes(role) && p.password === password);
    if (!user) {
      loginError.style.display = "block";
    } else {
      loginError.style.display = "none";
      localStorage.setItem("username", user.name);
      localStorage.setItem("role", role);
      localStorage.setItem("color", user.color);
      alert(`Logged in as ${user.name} (${role})!`);
      window.location.href = "lobby.html";
    }
  });

  // ==================== Toggle Button ====================
  const toggleLoginBtn = document.getElementById("toggleLoginBtn");
  const loginCollapse = document.getElementById("loginCollapse");
  loginCollapse.addEventListener("shown.bs.collapse", () => {
    toggleLoginBtn.textContent = "Hide Login Panel";
  });
  loginCollapse.addEventListener("hidden.bs.collapse", () => {
    toggleLoginBtn.textContent = "Show Login Panel";
  });

  // ==================== Game Start/Stop Wiring ====================
  document.getElementById("startDinoBtn").addEventListener("click", () => {
    if (typeof startDinoGame === "function") startDinoGame();
  });
  document.getElementById("stopDinoBtn").addEventListener("click", () => {
    if (typeof stopDinoGame === "function") stopDinoGame();
  });

  document.getElementById("startMiniSweepBtn").addEventListener("click", () => {
    if (typeof startMiniSweeper === "function") startMiniSweeper();
  });
  document.getElementById("stopMiniSweepBtn").addEventListener("click", () => {
    if (typeof stopMiniSweeper === "function") stopMiniSweeper();
  });

  document.getElementById("startSnakeBtn").addEventListener("click", () => {
    if (typeof startSnakeGame === "function") startSnakeGame();
  });
  document.getElementById("stopSnakeBtn").addEventListener("click", () => {
    if (typeof stopSnakeGame === "function") stopSnakeGame();
  });

});
