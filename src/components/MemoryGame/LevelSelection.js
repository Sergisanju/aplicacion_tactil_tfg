// src/components/MemoryGame/LevelSelection.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LevelSelection = () => {
  const { category } = useParams();
  let navigate = useNavigate();
  const levels = [2, 3, 4];

  const handleLevelSelect = (level) => {
    navigate(`/memory-game/${category}/${level}/difficulty`);
  };

  return (
    <div>
      <h1>Cartas de memoria - {category}</h1>
      <h2>Escoge un nivel</h2>
      <div>
        {levels.map((level) => (
          <button key={level} onClick={() => handleLevelSelect(level)}>
            {level} pares
          </button>
        ))}
      </div>
    </div>
  );
};

export default LevelSelection;
