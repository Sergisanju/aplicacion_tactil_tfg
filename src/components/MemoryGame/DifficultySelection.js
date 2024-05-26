// src/components/MemoryGame/DifficultySelection.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const DifficultySelection = () => {
  const { category, level } = useParams();
  let navigate = useNavigate();
  const difficulties = ['Facil', 'Medio', 'Dificil'];

  const handleDifficultySelect = (difficulty) => {
    navigate(`/memory-game/${category}/${level}/${difficulty}`);
  };  

  return (
    <div>
      <h1>Cartas de memoria</h1>
      <h2>Escoge la dificultad</h2>
      <div>
        {difficulties.map((difficulty) => (
          <button key={difficulty} onClick={() => handleDifficultySelect(difficulty)}>
            {difficulty}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelection;
