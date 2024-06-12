import React from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import './JuegosEvaluados.css'; 

const JuegosEvaluados = () => {
  const navigate = useNavigate(); // Hook para cambiar de ruta

  // Lista de nombres de juegos
  const juegos = ['cartas_de_memoria', 'categorizacion', 'secuenciacion'];

  // Navega a la página del juego seleccionado
  const handleSeleccionarJuego = (juego) => {
    navigate(`/historial-evaluacion/${juego}`);
  };

  // Convierte nombres de snake_case a formato Título De Juego
  const formatearNombreJuego = (nombreJuego) => {
    return nombreJuego
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  return (
    <div className="juegos-evaluados-container">
      <h1>Selecciona un Juego</h1>
      <div className="juegos-grid">
        {juegos.map((juego) => (
          <button
            key={juego} // Clave única para cada botón
            className="juego-button"
            onClick={() => handleSeleccionarJuego(juego)} // Manejador de clic
          >
            {formatearNombreJuego(juego)} {/* Muestra el nombre formateado */}
          </button>
        ))}
      </div>
    </div>
  );
};

export default JuegosEvaluados; // Exporta el componente
