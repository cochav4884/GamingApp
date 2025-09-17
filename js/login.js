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
    const user = users.find(u => 
      u.username === username && 
      u.password === password && 
      u.role === role
    );

    if (user) {
      // Hide error
      loginError.style.display = "none";

      // Optionally store logged-in info in localStorage
      localStorage.setItem("username", username);
      localStorage.setItem("role", role);

      // Redirect to main lobby page
      window.location.href = "index.html";
    } else {
      // Show error
      loginError.style.display = "block";
    }
  });
});
