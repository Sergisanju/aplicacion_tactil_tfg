import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './ResultadosCategorizacion.css'; 

const ResultadosCategorizacion = () => {
  const { sessionId } = useParams(); // Obtiene el ID de la sesión desde la URL
  const [resultados, setResultados] = useState([]); // Estado para almacenar los resultados del juego
  const [error, setError] = useState(null); // Estado para almacenar mensajes de error
  const firestore = getFirestore(); // Inicializa Firestore
  const auth = getAuth(); // Inicializa Firebase Auth
  const navigate = useNavigate(); // Hook para la navegación programática

  useEffect(() => {
    // Función asíncrona para obtener los resultados del juego desde Firestore
    const fetchResultados = async () => {
      try {
        const user = auth.currentUser; // Obtiene el usuario autenticado actualmente
        if (!user) {
          throw new Error("User not authenticated"); // Lanza un error si no hay usuario autenticado
        }

        const userId = user.uid; // ID del usuario
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/categorizacion/usuarios/${userId}/resultados`);
        // Consulta para obtener los resultados que coincidan con el sessionId
        const q = query(resultadosCollectionRef, where('sessionId', '==', sessionId));
        const querySnapshot = await getDocs(q); // Ejecuta la consulta

        const resultadosList = []; // Lista para almacenar los resultados obtenidos
        querySnapshot.forEach((doc) => {
          resultadosList.push({ id: doc.id, ...doc.data() }); // Agrega cada resultado a la lista
        });

        setResultados(resultadosList); // Actualiza el estado con los resultados obtenidos
      } catch (error) {
        console.error("Error fetching resultados:", error); // Muestra el error en la consola
        setError(error.message); 
      }
    };

    fetchResultados(); // Llama a la función para obtener los resultados cuando el componente se monta
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

  // Formatea los nombres de categorías para ser más legibles
  const formatearNombreCategoria = (nombre) => {
    return nombre.split('_').map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)).join(' ');
  };

  return (
    <div className="resultados-container">
      <h1>Resultados del Juego de Categorización</h1> {/* Título */}
      {error ? (
        <p>Error: {error}</p> 
      ) : (
        <ul className="resultados-lista">
          {resultados.map((resultado) => (
            <li key={resultado.id} className="resultado-items">
              <h2>Nivel: {resultado.nivel}</h2> {/* Nivel del juego */}
              <p>Categorías: {resultado.categorias.map(formatearNombreCategoria).join(', ')}</p> {/* Categorías del juego */}
              <p>Dificultad: {resultado.dificultad}</p> {/* Dificultad del juego */}
              <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p> {/* Duración en formato mm:ss */}
              <p>Errores: {resultado.errores}</p> {/* Errores cometidos */}
              <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p> {/* Fecha del resultado */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultadosCategorizacion;
