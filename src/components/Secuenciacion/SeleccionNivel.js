import React from 'react';
import { Link, useParams } from 'react-router-dom';
import './SeleccionNivel.css';

const SeleccionDeNivel = () => {
  const { categoria } = useParams();

  return (
    <div className="contenedor-nivel-seleccion">
      <h1>Cartas de Memoria</h1>
      <h2>Escoge un nivel</h2>
      <div className="niveles">
        <Link to={`/cartas-memoria/${categoria}/3-pares`} className="nivel-boton">3 pares</Link>
        <Link to={`/cartas-memoria/${categoria}/4-pares`} className="nivel-boton">4 pares</Link>
        <Link to={`/cartas-memoria/${categoria}/5-pares`} className="nivel-boton">5 pares</Link>
        <Link to={`/cartas-memoria/${categoria}/6-pares`} className="nivel-boton">6 pares</Link>
      </div>
    </div>
  );
};

export default SeleccionDeNivel;
