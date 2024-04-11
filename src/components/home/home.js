import React from 'react';
import './home.css'; // Asegúrate de tener tu archivo de estilos correspondiente
import memoryGameIcon from '../../assets/images/memory-game-icon.png';
import categorizationGameIcon from '../../assets/images/categorization-game-icon.png';

function Home() {
  return (
    <div className="home-container">
      <h1>Bienvenido a NombreAPP</h1>
      <h2>Elige tu juego</h2>
      <div className="games-container">
        <div className="game memory-game">
          <img src={memoryGameIcon} alt="Memory Game" />
          <button>Cartas de memoria</button>
        </div>
        <div className="game categorization-game">
          <img src={categorizationGameIcon} alt="Categorization Game" />
          <button>Categorización</button>
        </div>
      </div>
    </div>
  );
}

export default Home;
