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

// main.js - at the very top
const username = localStorage.getItem("username");
const role = localStorage.getItem("role");

if (!username || !role) {
  // Not logged in, redirect to login
  window.location.href = "login.html";
}

function updateLoggedInList() {
  const userList = document.getElementById("userList");
  userList.innerHTML = "";
  const loggedInUsers = JSON.parse(localStorage.getItem("loggedInUsers")) || [];
  loggedInUsers.forEach((u) => {
    const li = document.createElement("li");
    li.textContent = `${u.username} (${u.role})`;
    userList.appendChild(li);
  });
}

// Update when page loads
updateLoggedInList();

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

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

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

  // ==================== Animate Dice Roll ====================
  rollBtn.addEventListener("click", () => {
    const selectedDie = document.querySelector(".dice-thumb.selected");
    if (!selectedDie) return alert("Select a die first!");
    const dieName = selectedDie.dataset.die;

    // Use rollByName to handle animation + result
    rollByName(dieName, (value) => {
      diceValue.innerText = value;
    });
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

  // ---------------- Left Sidebar Logic (Lobby & Background) ----------------
  const leftSidebars = [
    { tabId: "LobbyTab", sidebarId: "LobbySidebar", populate: null },
    {
      tabId: "BackgroundTab",
      sidebarId: "BackgroundSidebar",
      populate: populateBackgrounds,
    },
  ];

  // Generic open/close
  function openLeftSidebar(sidebar, tab, populateFunc) {
    sidebar.classList.add("active");
    document.getElementById("main").classList.add("left-open");
    tab.style.display = "none";
    if (populateFunc) populateFunc();
  }

  function closeLeftSidebar(sidebar, tab) {
    sidebar.classList.remove("active");
    document.getElementById("main").classList.remove("left-open");
    tab.style.display = "block";
  }

  // Attach events
  leftSidebars.forEach(({ tabId, sidebarId, populate }) => {
    const tab = document.getElementById(tabId);
    const sidebar = document.getElementById(sidebarId);

    tab.addEventListener("click", () =>
      openLeftSidebar(sidebar, tab, populate)
    );
    const closeBtn = sidebar.querySelector(".closebtn");
    if (closeBtn)
      closeBtn.addEventListener("click", () => closeLeftSidebar(sidebar, tab));
  });

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
