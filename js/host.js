// Host Tools
// Assets
// Weapons, Tools, Items, Treasures, Materials

// host.js

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

