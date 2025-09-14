// main.js (full)
import { backgroundAssets } from "../js/background.js";
import { arrowBowAssets } from "./assets/arrowBowAssets.js";
import { axeclubAssets } from "./assets/axeclubAssets.js";
import { daggerAssets } from "./assets/daggerAssets.js";
import { gemstoneAssets } from "./assets/gemstoneAssets.js";
import { magicStaffAssets } from "./assets/magicStaffAssets.js";
import { mapScrollAssets } from "./assets/mapScrollAssets.js";
import { potionAssets } from "./assets/potionAssets.js";
import { shieldAssets } from "./assets/shieldAssets.js";
import { swordAssets } from "./assets/swordAssets.js";
import { treasureAssets } from "./assets/treasureAssets.js";

import { populateSidebar } from "./dragdrop.js";
import { setupDiceUI } from "./dice.js";
import { initDice3D, rollByName, removeDice, activeDice } from "./dice3D.js";

// -------------------- Initialize --------------------
const battlefield = document.getElementById("battlefield");
initDice3D(battlefield); // Pass actual container element

function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

// Right sidebar categories
const rightCategories = [
  { name: "ArrowBow", assets: arrowBowAssets },
  { name: "Axeclub", assets: axeclubAssets },
  { name: "Dagger", assets: daggerAssets },
  { name: "Gemstone", assets: gemstoneAssets },
  { name: "MagicStaff", assets: magicStaffAssets },
  { name: "MapScroll", assets: mapScrollAssets },
  { name: "Potion", assets: potionAssets },
  { name: "Shield", assets: shieldAssets },
  { name: "Sword", assets: swordAssets },
  { name: "Treasure", assets: treasureAssets },
];

document.addEventListener("DOMContentLoaded", () => {
  const tabContainer = document.getElementById("sidebarTabContainer");
  const panelsContainer = document.getElementById("rightPanels");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

  // Dice UI elements
  const diceOptions = document.getElementById("diceOptions");
  const rollBtn = document.getElementById("rollBtn");
  const diceValue = document.getElementById("diceValue");

  setupDiceUI(diceOptions); // dice thumbnails

  // ==================== Animate 3D dice across battlefield (3-sec roll) ====================
 rollBtn.addEventListener("click", () => {
  const selectedDie = document.querySelector(".dice-thumb.selected");
  if (!selectedDie) return alert("Select a die first!");
  const dieName = selectedDie.dataset.die;

  // Create dice mesh directly (no physics body)
  const diceObj = rollByName(dieName, null, { physics: false });
  if (!diceObj) return;

  const mesh = diceObj.mesh;

  // Place dice on far right
  mesh.position.set(7, 1, 0);

  // Animate across field in 3 seconds
  let start = null;
  const duration = 3000; // ms
  const startX = 7;
  const endX = -7;

  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;

    if (progress < 1) {
      mesh.position.x = startX + (endX - startX) * progress;
      requestAnimationFrame(animate);
    } else {
      // End of roll: choose result
      const result = diceObj.dieType.sides
        ? Math.floor(Math.random() * diceObj.dieType.sides) + 1
        : "?";

      diceValue.innerText = result;

      // Remove dice mesh from scene
      removeDice(diceObj);
    }
  }

  requestAnimationFrame(animate);
});

  // ==================== Right Sidebars + Tabs ====================
  rightCategories.forEach((cat, index) => {
    const sidebarId = cat.name + "Sidebar";
    const tabId = cat.name + "Tab";
    const rightClass = "right" + (index + 1);

    const tab = document.createElement("div");
    tab.id = tabId;
    tab.className = "sidebar-tab";
    tab.innerText = cat.name.replace(/([A-Z])/g, " $1").trim();
    tab.addEventListener("click", () => openRightSidebar(cat.name, rightClass));
    tabContainer.appendChild(tab);

    const sidebar = document.createElement("div");
    sidebar.id = sidebarId;
    sidebar.className = `sidebar-right ${cat.name}`;
    sidebar.innerHTML = `
      <a href="#" class="closebtn">&times;</a>
      <div class="lobby-title">${cat.name
        .replace(/([A-Z])/g, " $1")
        .trim()}</div>
      <section>
        Choose Asset
        <ul id="${cat.name.toLowerCase()}List"></ul>
      </section>
    `;
    panelsContainer.appendChild(sidebar);

    sidebar
      .querySelector(".closebtn")
      .addEventListener("click", () => closeRightSidebar(cat.name, rightClass));

    populateSidebar(
      cat.assets,
      `${cat.name.toLowerCase()}List`,
      false,
      battlefield
    );
  });

  // ==================== Left Sidebar (Lobby & Background) ====================
  const lobbyTab = document.getElementById("LobbyTab");
  const lobbySidebar = document.getElementById("LobbySidebar");

  function openLeftSidebar(sidebar, tab) {
    sidebar.style.width = "250px";
    document.getElementById("main").classList.add("left-open");
    tab.style.display = "none";
  }

  function closeLeftSidebar(sidebar, tab) {
    sidebar.style.width = "0";
    document.getElementById("main").classList.remove("left-open");
    tab.style.display = "block";
  }

  if (lobbyTab)
    lobbyTab.addEventListener("click", () =>
      openLeftSidebar(lobbySidebar, lobbyTab)
    );
  const lbClose = lobbySidebar.querySelector(".closebtn");
  if (lbClose)
    lbClose.addEventListener("click", () =>
      closeLeftSidebar(lobbySidebar, lobbyTab)
    );

  const bgTab = document.getElementById("BackgroundTab");
  const bgSidebar = document.getElementById("BackgroundSidebar");
  const bgList = document.getElementById("backgroundList");

  function populateBackgrounds() {
    bgList.innerHTML = "";
    backgroundAssets.forEach((asset) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = asset.image;
      img.alt = asset.name;
      img.className = "asset-thumb background";
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        battlefield.style.backgroundImage = `url(${asset.image})`;
        battlefield.style.backgroundSize = "cover";
        battlefield.style.backgroundPosition = "center";
      });
      li.appendChild(img);
      bgList.appendChild(li);
    });
  }

  function openBackgroundSidebar(sidebar, tab) {
    sidebar.style.width = "250px";
    document.getElementById("main").classList.add("left-open");
    tab.style.display = "none";
    populateBackgrounds();
  }

  function closeBackgroundSidebar(sidebar, tab) {
    sidebar.style.width = "0";
    document.getElementById("main").classList.remove("left-open");
    tab.style.display = "block";
  }

  bgTab.addEventListener("click", () =>
    openBackgroundSidebar(bgSidebar, bgTab)
  );
  bgSidebar
    .querySelector(".closebtn")
    .addEventListener("click", () => closeBackgroundSidebar(bgSidebar, bgTab));

  // ==================== Right Sidebar Open/Close ====================
  function openRightSidebar(id, className) {
    rightCategories.forEach((cat) => {
      if (cat.name !== id)
        closeRightSidebar(
          cat.name,
          "right" + (rightCategories.indexOf(cat) + 1)
        );
    });
    const sidebarEl = document.getElementById(id + "Sidebar");
    if (sidebarEl) sidebarEl.style.width = "250px";
    document.getElementById("main").classList.add(className + "-open");
    const tabEl = document.getElementById(id + "Tab");
    if (tabEl) tabEl.style.display = "none";
  }

  function closeRightSidebar(id, className) {
    const sidebarEl = document.getElementById(id + "Sidebar");
    if (sidebarEl) sidebarEl.style.width = "0";
    document.getElementById("main").classList.remove(className + "-open");
    const tabEl = document.getElementById(id + "Tab");
    if (tabEl) tabEl.style.display = "block";
  }

  window.openNav = openRightSidebar;
  window.closeNav = closeRightSidebar;

  // ==================== Battlefield Drag & Drop ====================
  battlefield.addEventListener("dragover", (e) => e.preventDefault());
  battlefield.addEventListener("drop", (e) => {
    e.preventDefault();
    try {
      const asset = JSON.parse(e.dataTransfer.getData("application/json"));
      const img = document.createElement("img");
      img.src = asset.image;
      img.alt = asset.name;
      img.classList.add("battlefield-asset");

      const rect = battlefield.getBoundingClientRect();
      let x = e.clientX - rect.left - 12.5;
      let y = e.clientY - rect.top - 12.5;
      x = Math.round(x / 25) * 25;
      y = Math.round(y / 25) * 25;

      img.style.position = "absolute";
      img.style.left = x + "px";
      img.style.top = y + "px";
      img.style.width = "25px";
      img.style.height = "25px";
      img.style.objectFit = "cover";

      battlefield.appendChild(img);
    } catch (err) {
      console.error("Failed to drop asset:", err);
    }
  });

  battlefield.addEventListener("mousedown", (e) => {
    const target = e.target;
    if (!target.classList.contains("battlefield-asset")) return;
    e.preventDefault();

    const rect = battlefield.getBoundingClientRect();
    const offsetX = e.clientX - target.offsetLeft - rect.left;
    const offsetY = e.clientY - target.offsetTop - rect.top;

    function onMouseMove(moveEvent) {
      let x = moveEvent.clientX - rect.left - offsetX;
      let y = moveEvent.clientY - rect.top - offsetY;
      x = Math.round(x / 25) * 25;
      y = Math.round(y / 25) * 25;

      target.style.left = x + "px";
      target.style.top = y + "px";
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  // ==================== Fullscreen ====================
  function updateFullscreenButtons() {
    if (document.fullscreenElement) {
      fullscreenBtn.style.display = "none";
      exitFullscreenBtn.style.display = "block";
    } else {
      fullscreenBtn.style.display = "block";
      exitFullscreenBtn.style.display = "none";
    }
  }

  // Set initial state
  updateFullscreenButtons();

  fullscreenBtn.addEventListener("click", () => {
    if (battlefield.requestFullscreen) battlefield.requestFullscreen();
    else if (battlefield.webkitRequestFullscreen)
      battlefield.webkitRequestFullscreen();
    else if (battlefield.msRequestFullscreen) battlefield.msRequestFullscreen();
  });

  exitFullscreenBtn.addEventListener("click", () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    else if (document.msExitFullscreen) document.msExitFullscreen();
  });

  document.addEventListener("fullscreenchange", updateFullscreenButtons);
});
