import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import memoryGameIcon from '../../assets/images/memory-game-icon.png';
import categorizationGameIcon from '../../assets/images/categorization-game-icon.png';

const Home = () => {
  return (
    <div className="homepage-container">
      <div className="homepage-title-container">
        <h1>Elige tu juego</h1>
      </div>
      <div className="homepage-game-selection">
        <div className="homepage-game-card">
          <img src={memoryGameIcon} alt="Memory Game" />
          <Link to="/memory-game"><button>Cartas de memoria</button></Link>
        </div>
        <div className="homepage-game-card">
          <img src={categorizationGameIcon} alt="Categorization Game" />
          <Link to="/categorization-game"><button>Categorización</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
