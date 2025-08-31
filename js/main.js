// -------------------- main.js --------------------
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

// -------------------- Categories --------------------
const categories = [
  { name: "Background", assets: backgroundAssets, isBackground: true },
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
  const rightContainer = document.getElementById("rightSidebarsContainer");
  const battlefield = document.getElementById("battlefield");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

  // -------------------- Create Right Sidebars & Tabs --------------------
  categories.forEach((cat, index) => {
    const sidebarId = cat.name + "Sidebar";
    const tabId = cat.name + "Tab";
    const rightClass = "right" + (index + 1);

    // Create tab
    const tab = document.createElement("div");
    tab.id = tabId;
    tab.className = "sidebar-tab-right";
    tab.innerText = cat.name.replace(/([A-Z])/g, " $1").trim();
    tab.addEventListener("click", () => openNav(cat.name, rightClass));
    rightContainer.appendChild(tab);

    // Create sidebar
    const sidebar = document.createElement("div");
    sidebar.id = sidebarId;
    sidebar.className = `sidebar-right ${cat.name}`;
    sidebar.innerHTML = `
      <a href="#" class="closebtn">&times;</a>
      <div class="lobby-title">${cat.name.replace(/([A-Z])/g, " $1").trim()}</div>
      <section>
        Choose Asset
        <ul id="${cat.name.toLowerCase()}List"></ul>
      </section>
    `;
    rightContainer.appendChild(sidebar);

    // Close button
    sidebar.querySelector(".closebtn")
      .addEventListener("click", () => closeNav(cat.name, rightClass));

    // Populate assets AFTER sidebar exists
    populateSidebar(cat.assets, `${cat.name.toLowerCase()}List`, battlefield, cat.isBackground);
  });

  // -------------------- Left Lobby --------------------
  const lobbyTab = document.getElementById("LobbyTab");
  const lobbySidebar = document.getElementById("LobbySidebar");

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

  lobbyTab.addEventListener("click", openNavLobby);
  lobbySidebar.querySelector(".closebtn").addEventListener("click", closeNavLobby);

  // -------------------- Right Sidebars Open/Close --------------------
  function openNav(id, className) {
    // Close all other sidebars
    categories.forEach(cat => {
      if (cat.name !== id) closeNav(cat.name, "right" + (categories.indexOf(cat) + 1));
    });

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

  // -------------------- Battlefield Drag & Drop --------------------
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

  // -------------------- Fullscreen --------------------
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
