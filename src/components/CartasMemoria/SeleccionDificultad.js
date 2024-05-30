import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SeleccionDificultad.css';

const SeleccionDeDificultad = () => {
  const { categoria, nivel } = useParams();
  const navigate = useNavigate();
  const dificultades = ['Facil', 'Medio', 'Dificil'];
  const [dificultadSeleccionada, setDificultadSeleccionada] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

  const manejarSeleccionDeDificultad = (dificultad) => {
    setDificultadSeleccionada(dificultad);
    setMostrarModalConfirmacion(true);
  };

  const aceptarParametrosJuego = () => {
    setMostrarModalConfirmacion(false);
    navigate(`/cartas-memoria/${categoria}/${nivel}/${dificultadSeleccionada}`);
  };

  const volverAtras = () => {
    setMostrarModalConfirmacion(false);
  };

  return (
    <div className="contenedor-dificultad-seleccion">
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

      {mostrarModalConfirmacion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Parámetros del Juego</h2>
            <p>Categoría: {categoria}</p>
            <p>Nivel: {nivel}</p>
            <p>Dificultad: {dificultadSeleccionada}</p>
            <button onClick={aceptarParametrosJuego}>Aceptar</button>
            <button onClick={volverAtras}>Volver</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleccionDeDificultad;
