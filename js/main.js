// =====================
// main.js
// =====================

// --------------------
// Dummy Data (replace later with real imports)
// --------------------
const backgroundImages = [
  {
    name: "Grasslands",
    image: "https://via.placeholder.com/300x200/6ab04c/fff",
  },
  { name: "Dungeon", image: "https://via.placeholder.com/300x200/2f3640/fff" },
];

const dummyAssets = [
  { name: "Asset1", image: "https://via.placeholder.com/60" },
  { name: "Asset2", image: "https://via.placeholder.com/60" },
];

// --------------------
// Asset categories (excluding Background)
// --------------------
const categories = [
  { name: "ArrowBow", assets: dummyAssets },
  { name: "AxeClub", assets: dummyAssets },
  { name: "Sword", assets: dummyAssets },
  // …add more as needed
];

// --------------------
// DOMContentLoaded
// --------------------
document.addEventListener("DOMContentLoaded", () => {
  const rightContainer = document.getElementById("rightSidebarsContainer");
  const battlefield = document.getElementById("battlefield");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

  // =================================================
  // BACKGROUND SIDEBAR (special: click to set)
  // =================================================
  createSidebar("Background", backgroundImages, true);

  // =================================================
  // ASSET SIDEBARS (drag & drop)
  // =================================================
  categories.forEach((cat, index) => {
    createSidebar(cat.name, cat.assets, false, index + 1);
  });

  // =================================================
  // Create Sidebar function
  // =================================================
  function createSidebar(name, assets, isBackground = false, rightIndex = 1) {
    const sidebarId = name + "Sidebar";
    const tabId = name + "Tab";
    const rightClass = "right" + rightIndex;

    // Create tab
    const tab = document.createElement("div");
    tab.id = tabId;
    tab.className = "sidebar-tab-right";
    tab.innerText = name.replace(/([A-Z])/g, " $1").trim();
    tab.addEventListener("click", () => openNav(name, rightClass));
    rightContainer.appendChild(tab);

    // Create sidebar
    const sidebar = document.createElement("div");
    sidebar.id = sidebarId;
    sidebar.className = `sidebar-right ${name}`;
    sidebar.innerHTML = `
      <a href="#" class="closebtn">&times;</a>
      <div class="lobby-title">${name.replace(/([A-Z])/g, " $1").trim()}</div>
      <section>
        Choose ${isBackground ? "Background" : "Asset"}
        <ul id="${name.toLowerCase()}List"></ul>
      </section>
    `;
    rightContainer.appendChild(sidebar);

    // Close button
    sidebar
      .querySelector(".closebtn")
      .addEventListener("click", () => closeNav(name, rightClass));

    // Populate assets
    populateSidebar(assets, `${name.toLowerCase()}List`, isBackground);
  }

  // =================================================
  // Populate Sidebar
  // =================================================
  function populateSidebar(assetArray, ulId, isBackground = false) {
    const ul = document.getElementById(ulId);
    if (!ul) return;
    ul.innerHTML = "";

    assetArray.forEach((asset) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = asset.image;
      img.alt = asset.name;
      img.classList.add("asset-thumb");

      if (isBackground) {
        img.classList.add("background");
        img.setAttribute("draggable", "false"); // explicitly disable dragging
        img.addEventListener("click", () => {
          battlefield.style.backgroundImage = `url(${asset.image})`;
          battlefield.style.backgroundSize = "cover";
          battlefield.style.backgroundPosition = "center";
        });
      } else {
        img.classList.add("asset");
        img.draggable = true;
        img.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("application/json", JSON.stringify(asset));
        });
      }

      li.appendChild(img);
      ul.appendChild(li);
    });
  }

  // =================================================
  // Left Lobby
  // =================================================
  const lobbyTab = document.getElementById("LobbyTab");
  const lobbySidebar = document.getElementById("LobbySidebar");

  lobbyTab.addEventListener("click", openNavLobby);

  function openNavLobby() {
    lobbySidebar.style.width = "250px";
    document.getElementById("main").classList.add("left-open");
    lobbyTab.style.display = "none";
  }

  function closeNavLobby() {
    lobbySidebar.style.width = "0";
    document.getElementById("main").classList.remove("left-open");
    lobbyTab.style.display = "block";
  }

  lobbySidebar
    .querySelector(".closebtn")
    .addEventListener("click", closeNavLobby);

  // =================================================
  // Right Sidebars open/close
  // =================================================
  function openNav(id, className) {
    document.getElementById(id + "Sidebar").style.width = "250px";
    document.getElementById("main").classList.add(className + "-open");
    document.getElementById(id + "Tab").style.display = "none";
  }

  function closeNav(id, className) {
    document.getElementById(id + "Sidebar").style.width = "0";
    document.getElementById("main").classList.remove(className + "-open");
    document.getElementById(id + "Tab").style.display = "block";
  }

  window.openNav = openNav;
  window.closeNav = closeNav;

  // =================================================
  // Battlefield drag & drop (only assets, not backgrounds)
  // =================================================
  battlefield.addEventListener("dragover", (e) => e.preventDefault());
  battlefield.addEventListener("drop", (e) => {
    e.preventDefault();
    const asset = JSON.parse(e.dataTransfer.getData("application/json"));
    const img = document.createElement("img");
    img.src = asset.image;
    img.alt = asset.name;
    img.classList.add("battlefield-asset");
    const rect = battlefield.getBoundingClientRect();
    img.style.position = "absolute";
    img.style.left = e.clientX - rect.left - 25 + "px";
    img.style.top = e.clientY - rect.top - 25 + "px";
    battlefield.appendChild(img);
  });

  // =================================================
  // Fullscreen toggle
  // =================================================
  fullscreenBtn.addEventListener("click", () => {
    battlefield.classList.add("fullscreen");
    fullscreenBtn.style.display = "none";
    exitFullscreenBtn.style.display = "block";
  });

  exitFullscreenBtn.addEventListener("click", () => {
    battlefield.classList.remove("fullscreen");
    fullscreenBtn.style.display = "block";
    exitFullscreenBtn.style.display = "none";
  });
});
