// host.js

// ====================
// Host Tools Reset
// ====================
export function resetHostTools() {
  // Deselect any active tool buttons
  document
    .querySelectorAll(".tool-button.active")
    .forEach((btn) => btn.classList.remove("active"));

  // Close the host sidebar if open
  closeHostSidebar();

  // Reset any global host tool state
  window.activeTool = null;
}

// ====================
// Host Assets
// ====================
export const hostAssets = [
  { name: "Weapons", icon: "hostImages/weaponsIcon.png" },
  { name: "Tools", icon: "hostImages/toolsIcon.png" },
  { name: "Items", icon: "hostImages/itemsIcon.png" },
  { name: "Treasures", icon: "hostImages/treasuresIcon.png" },
  { name: "Materials", icon: "hostImages/materialsIcon.png" },
];

// Names of host tools for visibility check
const hostToolNames = ["Weapons", "Tools", "Items", "Treasures", "Materials"];

// ====================
// Populate Host Sidebar
// ====================
export function populateHostSidebar(containerId, battlefield) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear previous items

  hostAssets.forEach((asset) => {
    const li = document.createElement("li");

    const img = document.createElement("img");
    img.src = asset.icon;
    img.alt = asset.name;
    img.className = "asset-thumb host-asset";
    img.style.cursor = "grab";
    img.draggable = true;

    // Drag start event
    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ name: asset.name, image: asset.icon })
      );
    });

    const label = document.createElement("span");
    label.innerText = asset.name;
    label.style.display = "block";
    label.style.textAlign = "center";
    label.style.fontSize = "12px";
    label.style.marginTop = "4px";

    li.appendChild(img);
    li.appendChild(label);
    container.appendChild(li);
  });
}

// ====================
// Open/Close Host Sidebar
// ====================
export function openHostSidebar() {
  const sidebar = document.getElementById("HostSidebar");
  const tab = document.getElementById("HostTab");
  if (sidebar && tab) {
    sidebar.classList.add("active");
    document.getElementById("main").classList.add("left-open");
    tab.style.display = "none";
  }
}

export function closeHostSidebar() {
  const sidebar = document.getElementById("HostSidebar");
  const tab = document.getElementById("HostTab");
  if (sidebar && tab) {
    sidebar.classList.remove("active");
    document.getElementById("main").classList.remove("left-open");
    tab.style.display = "block";
  }
}

// ====================
// Attach Host Sidebar Events
// ====================
export function setupHostSidebar() {
  const sidebar = document.getElementById("HostSidebar");
  const tab = document.getElementById("HostTab");

  tab.addEventListener("click", () => openHostSidebar());

  const closeBtn = sidebar.querySelector(".closebtn");
  if (closeBtn) closeBtn.addEventListener("click", () => closeHostSidebar());

  // Populate on load
  populateHostSidebar("hostAssetList", document.getElementById("battlefield"));
}

// ====================
// Reset Battlefield
// ====================

// Full reset (background + assets)
export function resetBattlefield() {
  const battlefield = document.getElementById("battlefield");
  if (!battlefield) return;

  battlefield.style.backgroundImage = "none";

  const assets = battlefield.querySelectorAll(".battlefield-asset");
  assets.forEach((asset) => asset.remove());

  resetHostTools();

  populateHostSidebar("hostAssetList", battlefield);

  console.log("Battlefield has been reset!");
}

// Soft Reset (assets only, keep background)
export function softResetBattlefield() {
  const battlefield = document.getElementById("battlefield");
  if (!battlefield) return;

  const assets = battlefield.querySelectorAll(".battlefield-asset");
  assets.forEach((asset) => asset.remove());

  console.log("Battlefield assets cleared (background kept).");
}

// ====================
// Host Mode & Asset Placement
// ====================

// Boolean to track host-only mode
let hostMode = false;

// Track host tool assets on grid
let hostToolAssetsOnGrid = []; // {name, image, x, y, visible: false}

// Open Battlefield button
const openBtn = document.getElementById("openBattlefieldBtn");
if (openBtn) {
  openBtn.addEventListener("click", () => {
    hostMode = !hostMode;
    if (hostMode) {
      openHostSidebar();
      console.log("Host-only battlefield mode ON");
    } else {
      console.log("Host-only battlefield mode OFF");
    }
  });
}

// ====================
// Battlefield Drag & Drop
// ====================
const battlefield = document.getElementById("battlefield");
if (battlefield) {
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

      // === Hide only host tool assets ===
      if (hostToolNames.includes(asset.name)) {
        img.classList.add("host-only"); // invisible to players
        hostToolAssetsOnGrid.push({
          name: asset.name,
          image: asset.image,
          x,
          y,
          visible: false,
        });
      }

      // === Decorative assets ===
      // No host-only class added → visible immediately

      battlefield.appendChild(img);
    } catch (err) {
      console.error("Failed to drop asset:", err);
    }
  });
}
