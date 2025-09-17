document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");

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

      // Prevent duplicates
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
});
