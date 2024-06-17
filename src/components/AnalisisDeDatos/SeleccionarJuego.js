import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './SeleccionarJuego.css';

const SeleccionarJuego = () => {
  const { usuarioId } = useParams(); // Obtiene usuarioId de los parámetros de la URL
  const navigate = useNavigate();

  const manejarSeleccionJuego = (juego) => {
    navigate(`/analisis-datos/${usuarioId}/evaluaciones/${juego}`);
  };

  return (
    <div className="seleccionar-juego-container">
      <h1>Seleccionar Juego</h1>
      <div className="lista-juegos">
        <button className="boton-juego" onClick={() => manejarSeleccionJuego('cartas_de_memoria')}>Cartas de Memoria</button>
        <button className="boton-juego" onClick={() => manejarSeleccionJuego('secuenciacion')}>Secuenciación</button>
        <button className="boton-juego" onClick={() => manejarSeleccionJuego('categorizacion')}>Categorización</button>
      </div>
    </div>
  );
};

export default SeleccionarJuego;
