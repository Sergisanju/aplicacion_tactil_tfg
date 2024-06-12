import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SeleccionDificultadCartas.css';

const SeleccionDeDificultad = () => {
  // Obtiene los parámetros de categoría y nivel desde la URL
  const { categoria, nivel } = useParams();
  // Hook para la navegación programática
  const navigate = useNavigate();
  // Lista de dificultades disponibles
  const dificultades = ['Facil', 'Medio', 'Dificil'];
  // Estado para almacenar la dificultad seleccionada
  const [dificultadSeleccionada, setDificultadSeleccionada] = useState(null);
  // Estado para controlar la visibilidad del modal de confirmación
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);

  // Maneja la selección de dificultad y muestra el modal de confirmación
  const manejarSeleccionDeDificultad = (dificultad) => {
    setDificultadSeleccionada(dificultad);
    setMostrarModalConfirmacion(true);
  };

  // Navega a la ruta del juego con los parámetros seleccionados
  const aceptarParametrosJuego = () => {
    setMostrarModalConfirmacion(false);
    navigate(`/cartas-memoria/${categoria}/${nivel}/${dificultadSeleccionada}`);
  };

  // Oculta el modal de confirmación
  const volverAtras = () => {
    setMostrarModalConfirmacion(false);
  };

  return (
    <div className="contenedor-dificultad-seleccion">
      <h1>Cartas de Memoria</h1> {/* Título principal */}
      <h2>Escoge la dificultad</h2> {/* Subtítulo */}
      <div className="dificultad-botones">
        {/* Mapea las dificultades y crea un botón para cada una */}
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

      {/* Modal de confirmación que se muestra si hay una dificultad seleccionada */}
      {mostrarModalConfirmacion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Parámetros del Juego</h2> {/* Título del modal */}
            <p>Categoría: {categoria}</p> {/* Muestra la categoría seleccionada */}
            <p>Nivel: {nivel}</p> {/* Muestra el nivel seleccionado */}
            <p>Dificultad: {dificultadSeleccionada}</p> {/* Muestra la dificultad seleccionada */}
            <button className="volver" onClick={volverAtras}>Volver</button> {/* Botón para cancelar */}
            <button className="aceptar" onClick={aceptarParametrosJuego}>Aceptar</button> {/* Botón para aceptar */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SeleccionDeDificultad;
