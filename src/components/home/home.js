import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Asegúrate de tener tu archivo de estilos correspondiente
import memoryGameIcon from '../../assets/images/memory-game-icon.png';
import categorizationGameIcon from '../../assets/images/categorization-game-icon.png';

const Home = () => {
  return (
    <div className="home">
      <h1>Bienvenido a NombreAPP</h1>
      <h2>Elige tu juego</h2>
      <div className="game-selection">
        <div className="game-card">
          <img src={memoryGameIcon} alt="Memory Game" />
          <Link to="/memory-game"><button>Cartas de memoria</button></Link>
        </div>
        <div className="game-card">
          <img src={categorizationGameIcon} alt="Categorization Game" />
          <Link to="/categorization-game"><button>Categorización</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
