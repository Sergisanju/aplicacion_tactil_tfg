import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './HistorialEvaluacion.css'; 
const HistorialEvaluacion = () => {
  const { juego } = useParams(); // Obtiene el nombre del juego desde la URL
  const [resultados, setResultados] = useState([]); // Estado para almacenar los resultados
  const [error, setError] = useState(null); // Estado para manejar errores
  const firestore = getFirestore(); // Instancia de Firestore
  const auth = getAuth(); // Instancia de Firebase Auth

  useEffect(() => {
    // Función para obtener los resultados de evaluación del usuario
    const fetchResultados = async () => {
      try {
        const user = auth.currentUser; // Obtiene el usuario autenticado
        if (!user) {
          throw new Error("User not authenticated"); // Error si no hay usuario
        }

        const userId = user.uid; // ID del usuario
        // Referencia a la colección de resultados específicos del juego
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/${juego}/usuarios/${userId}/resultados`);
        const querySnapshot = await getDocs(resultadosCollectionRef); // Obtiene los documentos

        const resultadosList = []; // Array para almacenar los resultados
        querySnapshot.forEach((doc) => {
          resultadosList.push({ id: doc.id, ...doc.data() }); // Añade cada resultado al array
        });

        setResultados(resultadosList); // Actualiza el estado con los resultados
      } catch (error) {
        console.error("Error fetching resultados:", error); // Muestra el error en consola
        setError(error.message); // Actualiza el estado de error
      }
    };

    fetchResultados(); // Llama a la función de obtención de resultados
  }, [firestore, auth, juego]); // Dependencias del useEffect

  // Convierte duración en segundos a formato mm:ss
  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  // Convierte el nombre del juego de snake_case a Título De Juego
  const formatearNombreJuego = (nombreJuego) => {
    return nombreJuego
      .split('_')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
      .join(' ');
  };

  return (
    <div className="historial-evaluacion-container">
      <h1>Historial de Evaluación para {formatearNombreJuego(juego)}</h1>
      {error ? (
        <p>Error: {error}</p> // Muestra el error si existe
      ) : (
        <ul className="resultados-list">
          {resultados.map((resultado) => (
            <li key={resultado.id} className="resultado-item">
              <h2>{resultado.categoria}</h2>
              <p>Nivel: {resultado.nivel}</p>
              <p>Dificultad: {resultado.dificultad}</p>
              <p>Intentos: {resultado.intentos}</p>
              <p>Aciertos: {resultado.aciertos}</p>
              <p>Errores: {resultado.errores}</p>
              <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>
              <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistorialEvaluacion; // Exporta el componente
