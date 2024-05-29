import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './LevelSelection.css';

const SeleccionDeNivel = () => {
  const { categoria } = useParams();

  return (
    <div className="nivel-seleccion-container">
      <h1>Cartas de Memoria</h1>
      <h2>Escoge un nivel</h2>
      <div className="niveles">
        <Link to={`/memory-game/${categoria}/3-pares`} className="nivel-boton">3 pares</Link>
        <Link to={`/memory-game/${categoria}/4-pares`} className="nivel-boton">4 pares</Link>
        <Link to={`/memory-game/${categoria}/5-pares`} className="nivel-boton">5 pares</Link>
        <Link to={`/memory-game/${categoria}/6-pares`} className="nivel-boton">6 pares</Link>
      </div>
    </div>
  );
};

export default SeleccionDeNivel;
