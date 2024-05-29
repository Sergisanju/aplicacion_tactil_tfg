import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DifficultySelection.css';

const SeleccionDeDificultad = () => {
  const { categoria, nivel } = useParams();
  let navigate = useNavigate();
  const dificultades = ['Facil', 'Medio', 'Dificil'];

  const manejarSeleccionDeDificultad = (dificultad) => {
    navigate(`/memory-game/${categoria}/${nivel}/${dificultad}`);
  };

  return (
    <div className="dificultad-seleccion-container">
      <h1>Cartas de Memoria</h1>
      <h2>Escoge la dificultad</h2>
      <div className="dificultad-botones">
        {dificultades.map((dificultad) => (
          <button
            key={dificultad}
            className={`dificultad-boton ${dificultad.toLowerCase()}`}
            onClick={() => manejarSeleccionDeDificultad(dificultad)}
          >
            {dificultad}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SeleccionDeDificultad;
