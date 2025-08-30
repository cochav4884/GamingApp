import { arrowbowAssets, axeClubAssets } from './assets.js';

function populateSidebar(assetArray, listId) {
  const list = document.getElementById(listId);
  list.innerHTML = "";

  assetArray.forEach(asset => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = asset.image;
    img.alt = asset.name;
    img.draggable = true;
    img.classList.add("asset-thumb");

    // Drag event
    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", asset.image);
    });

    li.appendChild(img);
    list.appendChild(li);
  });
}

// Populate all sidebars
populateSidebar(arrowbowAssets, "arrowbowList");
populateSidebar(axeClubAssets, "axeclubList");

// Battlefield drop logic
const battlefield = document.getElementById("battlefield");

battlefield.addEventListener("dragover", (e) => {
  e.preventDefault();
});

battlefield.addEventListener("drop", (e) => {
  e.preventDefault();
  const src = e.dataTransfer.getData("text/plain");
  const x = e.offsetX;
  const y = e.offsetY;

  const img = document.createElement("img");
  img.src = src;
  img.style.position = "absolute";
  img.style.left = `${x}px`;
  img.style.top = `${y}px`;
  img.classList.add("battlefield-asset");

  battlefield.appendChild(img);
});
