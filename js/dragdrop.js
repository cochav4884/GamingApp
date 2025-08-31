export function populateSidebar(assetArray, listId, isBackground = false, battlefield) {
  const ul = document.getElementById(listId);
  if (!ul) return;
  ul.innerHTML = "";

  assetArray.forEach(asset => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = asset.image;
    img.alt = asset.name;
    img.classList.add("asset-thumb");

    if (isBackground && battlefield) {
      img.addEventListener("click", () => {
        battlefield.style.backgroundImage = `url(${asset.image})`;
        battlefield.style.backgroundSize = "cover";
        battlefield.style.backgroundPosition = "center";
      });
    } else {
      img.draggable = true;
      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("application/json", JSON.stringify(asset));
      });
    }

    li.appendChild(img);
    ul.appendChild(li);
  });
}
