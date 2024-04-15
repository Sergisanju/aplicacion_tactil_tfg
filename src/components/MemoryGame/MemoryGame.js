// src/components/MemoryGame/MemoryGame.js
import React, { useState } from 'react';
import CategorySelection from './CategorySelection';
import LevelSelection from './LevelSelection';

const MemoryGame = () => {
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);

  // Si se ha seleccionado una categoría y un nivel, mostrar el juego
  // Si sólo se ha seleccionado una categoría, mostrar la selección de nivel
  // Si no se ha seleccionado nada, mostrar la selección de categoría
  return (
    <div>
      {category && level ? (
        // Componente del juego real con la categoría y el nivel seleccionados
        <MemoryGame category={category} level={level} />
      ) : category ? (
        <LevelSelection category={category} setLevel={setLevel} />
      ) : (
        <CategorySelection setCategory={setCategory} />
      )}
    </div>
  );
};

export default MemoryGame;
