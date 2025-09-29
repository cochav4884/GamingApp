// ====================
// Creator Controls
// ====================

// Shared state for all players (syncs with localStorage)
export let allPlayers = JSON.parse(localStorage.getItem("allPlayers")) || [];

// ====================
// Open/Close Sidebar
// ====================
export function openCreatorSidebar() {
  const sidebar = document.getElementById("CreatorSidebar");
  const tab = document.getElementById("CreatorTab");
  if (sidebar && tab) {
    sidebar.classList.add("active");
    document.getElementById("main").classList.add("left-open");
    tab.style.display = "none";
  }
}

export function closeCreatorSidebar() {
  const sidebar = document.getElementById("CreatorSidebar");
  const tab = document.getElementById("CreatorTab");
  if (sidebar && tab) {
    sidebar.classList.remove("active");
    document.getElementById("main").classList.remove("left-open");
    tab.style.display = "block";
  }
}

// ====================
// Setup Creator Sidebar
// ====================
export function setupCreatorSidebar() {
  const sidebar = document.getElementById("CreatorSidebar");
  const tab = document.getElementById("CreatorTab");
  if (!sidebar || !tab) return;

  tab.addEventListener("click", () => openCreatorSidebar());

  const closeBtn = sidebar.querySelector(".closebtn");
  if (closeBtn) closeBtn.addEventListener("click", () => closeCreatorSidebar());

  // Refresh button
  if (!document.getElementById("creatorRefreshBtn")) {
    const refreshBtn = document.createElement("button");
    refreshBtn.id = "creatorRefreshBtn";
    refreshBtn.innerText = "Refresh Player List";
    refreshBtn.className = "btn btn-secondary mb-2";
    refreshBtn.addEventListener("click", () => refreshPlayerList());
    sidebar.prepend(refreshBtn);
  }

  refreshPlayerList();
}

// ====================
// Refresh Creator Player List
// ====================
export function refreshPlayerList() {
  allPlayers = JSON.parse(localStorage.getItem("allPlayers")) || [];
  const container = document.getElementById("creatorPlayerList");
  if (!container) return;

  container.innerHTML = "<h3>Players</h3>";

  allPlayers.forEach((player) => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.marginBottom = "6px";
    div.style.gap = "6px";

    const nameSpan = document.createElement("span");
    nameSpan.innerText = player.name;

    if (player.onBattlefield) {
      const removeBtn = document.createElement("button");
      removeBtn.innerText = "Remove from Battlefield";
      removeBtn.className = "btn btn-sm btn-warning";
      removeBtn.addEventListener("click", () =>
        removeFromBattlefield(player.name)
      );

      const logoutBtn = document.createElement("button");
      logoutBtn.innerText = "Remove from Game";
      logoutBtn.className = "btn btn-sm btn-danger";
      logoutBtn.addEventListener("click", () => logoutPlayer(player.name));

      div.appendChild(nameSpan);
      div.appendChild(removeBtn);
      div.appendChild(logoutBtn);

    } else {
      const logoutBtn = document.createElement("button");
      logoutBtn.innerText = "Remove from Game";
      logoutBtn.className = "btn btn-sm btn-danger";
      logoutBtn.addEventListener("click", () => logoutPlayer(player.name));

      div.appendChild(nameSpan);
      div.appendChild(logoutBtn);
    }

    container.appendChild(div);
  });
}

// ====================
// Add Player to Battlefield
// ====================
export function addPlayerToBattlefield(name, color = "#FF0000") {
  const battlefield = document.getElementById("battlefield");
  if (!battlefield) return;

  const player = allPlayers.find((p) => p.name === name);
  if (!player) return;
  if (player.onBattlefield && player.element) return;

  const dot = document.createElement("div");
  dot.classList.add("player-dot");
  dot.style.backgroundColor = color;
  dot.style.position = "absolute";
  dot.style.left = "0px";
  dot.style.top = "0px";
  dot.style.width = "25px";
  dot.style.height = "25px";
  dot.style.borderRadius = "50%";
  dot.style.zIndex = "100";

  const nameEl = document.createElement("span");
  nameEl.innerText = name;
  nameEl.style.position = "absolute";
  nameEl.style.left = "0px";
  nameEl.style.bottom = "30px";
  nameEl.style.fontSize = "12px";
  nameEl.style.color = "#fff";
  nameEl.style.fontWeight = "bold";
  dot.appendChild(nameEl);

  battlefield.appendChild(dot);

  player.onBattlefield = true;
  player.element = dot;

  localStorage.setItem("allPlayers", JSON.stringify(allPlayers));
  localStorage.setItem("allPlayersUpdatedAt", Date.now()); // trigger update

  refreshPlayerList();
}

// ====================
// Remove Player from Battlefield
// ====================
export function removeFromBattlefield(name) {
  const player = allPlayers.find((p) => p.name === name);
  if (!player) return;

  if (player.element) player.element.remove();
  player.onBattlefield = false;
  player.element = null;

  localStorage.setItem("allPlayers", JSON.stringify(allPlayers));
  localStorage.setItem("allPlayersUpdatedAt", Date.now());

  refreshPlayerList();
}

// ====================
// Logout Player
// ====================
export function logoutPlayer(name) {
  const index = allPlayers.findIndex((p) => p.name === name);
  if (index === -1) return;

  const player = allPlayers[index];
  if (player.element) player.element.remove();

  allPlayers.splice(index, 1);
  localStorage.setItem("allPlayers", JSON.stringify(allPlayers));
  localStorage.setItem("allPlayersUpdatedAt", Date.now());

  refreshPlayerList();

  // redirect removed player to login
  const currentUser = localStorage.getItem("username");
  if (currentUser === name) {
    alert("You have been removed from the game.");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  }
}

// ====================
// Listen to localStorage changes to sync across tabs
// ====================
window.addEventListener("storage", (e) => {
  if (e.key === "allPlayersUpdatedAt") {
    refreshPlayerList();
  }
});
