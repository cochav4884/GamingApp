import {
  arrowbowAssets,
  axeClubAssets,
  daggerAssets,
  gemstoneAssets,
  magicStaffAssets,
  mapScrollAssets,
  potionAssets,
  shieldAssets,
  swordAssets,
  treasureAssets,
  backgroundAssets
} from './assets.js';

// --------------------
// Asset categories and lists
// --------------------
const categories = [
  { name: "Background", assets: backgroundAssets },
  { name: "ArrowBow", assets: arrowbowAssets },
  { name: "AxeClub", assets: axeClubAssets },
  { name: "Dagger", assets: daggerAssets },
  { name: "Gemstone", assets: gemstoneAssets },
  { name: "MagicStaff", assets: magicStaffAssets },
  { name: "MapScroll", assets: mapScrollAssets },
  { name: "Potion", assets: potionAssets },
  { name: "Shield", assets: shieldAssets },
  { name: "Sword", assets: swordAssets },
  { name: "Treasure", assets: treasureAssets }
];

// --------------------
// Create right sidebars & tabs dynamically
// --------------------
const rightContainer = document.getElementById("rightSidebarsContainer");

categories.forEach((cat, index) => {
  const sidebarId = cat.name + "Sidebar";
  const tabId = cat.name + "Tab";
  const rightClass = "right" + (index + 1);

  // Create Tab
  const tab = document.createElement("div");
  tab.id = tabId;
  tab.className = "sidebar-tab-right";
  tab.innerText = cat.name.replace(/([A-Z])/g, " $1").trim();
  tab.onclick = () => openNav(cat.name, rightClass);
  rightContainer.appendChild(tab);

  // Create Sidebar
  const sidebar = document.createElement("div");
  sidebar.id = sidebarId;
  sidebar.className = `sidebar-right ${cat.name}`;
  sidebar.innerHTML = `
    <a href="javascript:void(0)" class="closebtn" onclick="closeNav('${cat.name}', '${rightClass}')">&times;</a>
    <div class="lobby-title">${cat.name.replace(/([A-Z])/g, " $1").trim()}</div>
    <section>
      Choose Asset
      <ul id="${cat.name.toLowerCase()}List"></ul>
    </section>
  `;
  rightContainer.appendChild(sidebar);

  // Populate assets
  populateSidebar(cat.assets, `${cat.name.toLowerCase()}List`);
});

// --------------------
// Populate a sidebar UL with images
// --------------------
function populateSidebar(assetArray, ulId) {
  const ul = document.getElementById(ulId);
  if (!ul) return;

  ul.innerHTML = ''; // clear existing content

  assetArray.forEach(asset => {
    const li = document.createElement('li');
    const img = document.createElement('img');
    img.src = asset.image;
    img.alt = asset.name;
    img.classList.add('asset-thumb');
    img.draggable = true;

    // Drag start
    img.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('application/json', JSON.stringify(asset));
    });

    li.appendChild(img);
    ul.appendChild(li);
  });
}

// --------------------
// Sidebar open/close functions
// --------------------
function openNavLobby() {
  document.getElementById("LobbySidebar").style.width = "250px";
  document.getElementById("main").classList.add("left-open");
  document.getElementById("LobbyTab").style.display = "none";
}

function closeNavLobby() {
  document.getElementById("LobbySidebar").style.width = "0";
  document.getElementById("main").classList.remove("left-open");
  document.getElementById("LobbyTab").style.display = "block";
}

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

// --------------------
// Battlefield drag & drop
// --------------------
document.addEventListener('DOMContentLoaded', () => {
  const battlefield = document.getElementById('battlefield');
  if (!battlefield) return;

  battlefield.addEventListener('dragover', (e) => e.preventDefault());

  battlefield.addEventListener('drop', (e) => {
    e.preventDefault();
    const asset = JSON.parse(e.dataTransfer.getData('application/json'));

    const img = document.createElement('img');
    img.src = asset.image;
    img.alt = asset.name;
    img.classList.add('battlefield-asset');

    const rect = battlefield.getBoundingClientRect();
    img.style.position = 'absolute';
    img.style.left = (e.clientX - rect.left - 25) + 'px';
    img.style.top = (e.clientY - rect.top - 25) + 'px';

    battlefield.appendChild(img);

    asset.found = true;
  });
});

// --------------------
// Fullscreen buttons
// --------------------
const battlefield = document.getElementById("battlefield");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const exitFullscreenBtn = document.getElementById("exitFullscreenBtn");

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
