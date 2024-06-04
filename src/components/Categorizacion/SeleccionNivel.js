import React from 'react';
import { Link } from 'react-router-dom';
import './SeleccionNivel.css';

const SeleccionDeNivel = () => {
  return (
    <div className="contenedor-nivel-seleccion">
      <h1>Categorizacion</h1>
      <h2>Escoge un nivel</h2>
      <div className="niveles">
        <Link to={`/categorizacion/2-categorias`} className="nivel-boton">2 categorías</Link>
        <Link to={`/categorizacion/3-categorias`} className="nivel-boton">3 categorías</Link>
        <Link to={`/categorizacion/4-categorias`} className="nivel-boton">4 categorías</Link>
      </div>
    </div>
  );
};

export default SeleccionDeNivel;
