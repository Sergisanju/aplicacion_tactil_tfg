import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './LevelSelection.css';

const LevelSelection = () => {
  const { category } = useParams();

  return (
    <div className="level-selection-container">
      <h1>Cartas de memoria</h1>
      <h2>Escoge un nivel</h2>
      <div className="levels">
        <Link to={`/memory-game/${category}/3-pares`} className="level-button">3 pares</Link>
        <Link to={`/memory-game/${category}/4-pares`} className="level-button">4 pares</Link>
        <Link to={`/memory-game/${category}/5-pares`} className="level-button">5 pares</Link>
        <Link to={`/memory-game/${category}/6-pares`} className="level-button">6 pares</Link>
      </div>
    </div>
  );
};

export default LevelSelection;
