// LobbyDiceSelector.js
import React, { useState } from "react";
import Dice from "../js/dice";
import "../styles/dice.css";

const diceTypes = ["d4", "d6", "d8", "d10", "d20", "d50"];

const LobbyDiceSelector = ({ onRoll }) => {
  const [selectedDice, setSelectedDice] = useState(null);
  const [rolling, setRolling] = useState(false);

  const handleDiceClick = (type) => {
    if (!rolling) setSelectedDice(type);
  };

  const handleRoll = () => {
    if (!selectedDice) return;
    setRolling(true);

    // Random roll value
    const sides = parseInt(selectedDice.slice(1));
    const finalValue = Math.floor(Math.random() * sides) + 1;

    // Trigger parent callback (battlefield animation)
    if (onRoll) onRoll(selectedDice, finalValue);

    // Stop rolling animation after 1s
    setTimeout(() => {
      setRolling(false);
    }, 1000);
  };

  return (
    <div className="lobby-dice-selector">
      <div className="dice-options">
        {diceTypes.map((type) => (
          <div
            key={type}
            className={`dice ${selectedDice === type ? "selected" : ""}`}
            onClick={() => handleDiceClick(type)}
          >
            <Dice type={type} size={40} rolling={rolling && selectedDice === type} />
          </div>
        ))}
      </div>
      <button
        className="roll-button"
        onClick={handleRoll}
        disabled={!selectedDice || rolling}
      >
        Roll
      </button>
    </div>
  );
};

export default LobbyDiceSelector;
