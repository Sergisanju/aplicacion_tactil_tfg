import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './ResultadosSecuenciacion.css'; 
const Resultados = () => {
  const { sessionId } = useParams(); // Obtiene el ID de la sesión desde la URL
  const [resultados, setResultados] = useState([]); // Estado para almacenar los resultados del juego
  const [error, setError] = useState(null); // Estado para almacenar mensajes de error
  const firestore = getFirestore(); // Inicializa Firestore
  const auth = getAuth(); // Inicializa Firebase Auth
  const navigate = useNavigate(); // Hook para la navegación programática

  useEffect(() => {
    const user = auth.currentUser; // Obtiene el usuario autenticado actualmente
    if (!user) {
      setError("User not authenticated");
      return;
    }

    const userId = user.uid; // ID del usuario
    const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/secuenciacion/usuarios/${userId}/resultados`);
    const q = query(resultadosCollectionRef, where('sessionId', '==', sessionId));

    // Usar onSnapshot para suscribirse a actualizaciones en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const resultadosList = []; // Lista para almacenar los resultados obtenidos
      querySnapshot.forEach((doc) => {
        resultadosList.push({ id: doc.id, ...doc.data() }); // Agrega cada resultado a la lista
      });
      setResultados(resultadosList); // Actualiza el estado con los resultados obtenidos
    }, (error) => {
      console.error("Error fetching resultados:", error); // Muestra el error en la consola
      setError(error.message); // Almacena el mensaje de error en el estado
    });

    // Limpieza al desmontar el componente
    return () => unsubscribe();

  }, [firestore, auth, sessionId]); // Ejecuta el efecto cuando cambian firestore, auth, o sessionId

  useEffect(() => {
    // Función para manejar el evento de retroceso en el navegador
    const handlePopState = () => {
      navigate('/'); // Redirige a la página de inicio
    };

    window.addEventListener('popstate', handlePopState); // Agrega el evento al cargar el componente

    return () => {
      window.removeEventListener('popstate', handlePopState); // Limpia el evento al desmontar el componente
    };
  }, [navigate]); // Ejecuta el efecto cuando cambia navigate

  // Convierte segundos a formato mm:ss
  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  // Convierte el nombre del juego de snake_case a Título De Juego
  const formatearNombreJuego = (nombreJuego) => {
    return nombreJuego
      .split('_') // Divide el string en palabras separadas por guiones bajos
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase()) // Capitaliza la primera letra de cada palabra
      .join(' '); // Une las palabras con espacios
  };

  return (
    <div className="resultados-container">
      <h1>Resultados del Juego</h1> {/* Título */}
      {error ? (
        <p>Error: {error}</p> // Muestra el mensaje de error
      ) : (
        <ul className="resultados-lista">
          {resultados.map((resultado) => (
            <li key={resultado.id} className="resultado-items">
              <h2>{formatearNombreJuego(resultado.categoria)}</h2> {/* Categoría del juego */}
              <p>Dificultad: {resultado.dificultad}</p> {/* Dificultad del juego */}
              <p>Intentos: {resultado.intentos}</p> {/* Intentos totales */}
              {resultado.duracion && <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>} {/* Duración en formato mm:ss */}
              <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p> {/* Fecha del resultado */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Resultados;
