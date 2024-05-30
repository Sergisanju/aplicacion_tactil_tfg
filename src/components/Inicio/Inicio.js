import React from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css';
import cartasMemoriaIcon from '../../assets/images/cartas-memoria-icon.png';
import categorizacionIcon from '../../assets/images/categorization-game-icon.png';

const Inicio = () => {
  return (
    <div className="contenedor-inicio">
      <div className="contenedor-titulo-inicio">
        <h1>Elige tu juego</h1>
      </div>
      <div className="seleccion-juego-inicio">
        <div className="carta-juego-inicio">
          <img src={cartasMemoriaIcon} alt="Juego de Memoria" />
          <Link to="/cartas-memoria"><button>Cartas de memoria</button></Link>
        </div>
        <div className="carta-juego-inicio">
          <img src={categorizacionIcon} alt="Juego de Categorización" />
          <Link to="/categorizacion"><button>Categorización</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
