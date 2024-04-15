// src/components/MemoryGame/LevelSelection.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const LevelSelection = () => {
  const { category } = useParams();
  //console.log("Category selected:", category); // Esto debe mostrar 'animales' en la consola si se selecciona esa categoría
  let navigate = useNavigate();
  const levels = [2, 3, 4];

  const handleLevelSelect = (level) => {
    navigate(`/memory-game/${category}/${level}`);
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
