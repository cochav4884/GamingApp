// js/dice.js
export const diceTypes = [
  { name: "d4", sides: 4, color: "#f44336" },
  { name: "d6", sides: 6, color: "#2196f3" },
  { name: "d8", sides: 8, color: "#4caf50" },
  { name: "d10", sides: 10, color: "#ff9800" },
  { name: "d12", sides: 12, color: "#ffeb3b" },
  { name: "d20", sides: 20, color: "#9c27b0" },
  { name: "d100", sides: 100, color: "#607d8b" },
];

export function setupDiceUI(diceOptions) {
  diceTypes.forEach(die => {
    const div = document.createElement("div");
    div.className = "dice-thumb";
    div.dataset.die = die.name;

    const img = document.createElement("img");
    img.src = `../diceImages/${die.name}.png`; // assumes dice images are named d4.png, d6.png, etc.
    img.alt = die.name;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.cursor = "pointer";

    div.appendChild(img);

    div.addEventListener("click", () => {
      document.querySelectorAll(".dice-thumb").forEach(d => d.classList.remove("selected"));
      div.classList.add("selected");
    });

    diceOptions.appendChild(div);
  });
}
