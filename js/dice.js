const diceTypes = [
  { name: "d4", sides: 4, color: "#f44336" },
  { name: "d6", sides: 6, color: "#2196f3" },
  { name: "d8", sides: 8, color: "#4caf50" },
  { name: "d10", sides: 10, color: "#ff9800" },
  { name: "d20", sides: 20, color: "#9c27b0" },
  { name: "d50", sides: 50, color: "#795548" }
];

const diceOptions = document.getElementById("diceOptions");
const rollBtn = document.getElementById("rollBtn");
const diceValue = document.getElementById("diceValue");
const battlefield = document.getElementById("battlefield");

let selectedDie = null;

// Dice roll sound (optional)
const diceSound = new Audio("dice-roll.mp3"); // optional

// Populate dice thumbnails with placeholder colors
diceTypes.forEach(die => {
  const div = document.createElement("div");
  div.className = "dice-thumb";
  div.innerText = die.name;
  div.dataset.sides = die.sides;
  div.style.backgroundColor = die.color; // temporary color placeholder

  div.addEventListener("click", () => {
    document.querySelectorAll(".dice-thumb").forEach(d => d.classList.remove("selected"));
    div.classList.add("selected");
    selectedDie = die;
  });

  diceOptions.appendChild(div);
});

// Roll button
rollBtn.addEventListener("click", () => {
  if (!selectedDie) return alert("Select a die first!");

  const diceEl = document.createElement("div");
  diceEl.className = "rolling-dice";
  diceEl.style.left = "10px";
  diceEl.style.top = "10px";
  diceEl.style.backgroundColor = selectedDie.color; // match thumbnail
  diceEl.innerText = selectedDie.name; // show placeholder text
  battlefield.appendChild(diceEl);

  // Play sound if available
  if (diceSound) {
    diceSound.currentTime = 0;
    diceSound.play();
  }

  const sides = selectedDie.sides;
  let rollValue = 1;

  // Animate shake in place
  let rollInterval = setInterval(() => {
    rollValue = Math.floor(Math.random() * sides) + 1;
    diceEl.innerText = rollValue;
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    const rotate = (Math.random() - 0.5) * 20;
    diceEl.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotate}deg)`;
  }, 50);

  // After 1s, move to random spot
  setTimeout(() => {
    clearInterval(rollInterval);
    const maxX = battlefield.clientWidth - 30;
    const maxY = battlefield.clientHeight - 30;
    const targetX = Math.random() * maxX;
    const targetY = Math.random() * maxY;

    diceEl.style.transition = "transform 1s cubic-bezier(.36,.07,.19,.97)";
    diceEl.style.transform = `translate(${targetX}px, ${targetY}px) rotate(360deg)`;

    // Bounce back to Dice Box
    setTimeout(() => {
      diceEl.style.transition = "transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)";
      diceEl.style.transform = "translate(0px, 0px) rotate(0deg)";

      // Remove and show final result
      setTimeout(() => {
        battlefield.removeChild(diceEl);
        diceValue.innerText = rollValue;
      }, 500);
    }, 1000);
  }, 1000);
});
