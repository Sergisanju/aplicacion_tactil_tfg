import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './EvaluacionUsuarios.css';

const EvaluacionUsuarios = () => {
  const { usuarioId } = useParams(); // Obtiene el ID del usuario desde la URL
  const [resultados, setResultados] = useState([]); // Estado para almacenar los resultados de las evaluaciones
  const [error, setError] = useState(null); // Estado para almacenar cualquier error
  const firestore = getFirestore(); // Instancia de Firestore
  const auth = getAuth(); // Instancia de Firebase Auth
  const usuarioActual = auth.currentUser; // Usuario actualmente autenticado

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        if (!usuarioActual) {
          throw new Error("User not authenticated"); // Verifica si el usuario está autenticado
        }

        // Verificar que el usuario actual es un analista
        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) {
          throw new Error("Analista doc no existe"); // Verifica si el documento del analista existe
        }

        if (analistaDoc.data().tipoUsuario !== 'Analista') {
          throw new Error("User is not an analyst"); // Verifica si el usuario actual es un analista
        }

        // Verificar que el usuarioId está en la lista de asociados del analista
        const asociados = analistaDoc.data().asociados || [];
        if (!asociados.includes(usuarioId)) {
          throw new Error("User not associated with this analyst"); // Verifica si el usuario está asociado con el analista
        }

        // Obtener resultados del usuario asociado de diferentes juegos
        const juegos = ['cartas_de_memoria', 'categorizacion']; // Lista de juegos
        let resultadosList = [];

        for (const juego of juegos) {
          const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/${juego}/usuarios/${usuarioId}/resultados`);
          const querySnapshot = await getDocs(resultadosCollectionRef);

          querySnapshot.forEach((doc) => {
            resultadosList.push({ id: doc.id, ...doc.data(), juego }); // Incluye el nombre del juego en los datos
          });
        }

        setResultados(resultadosList); // Actualiza el estado con los resultados obtenidos
      } catch (error) {
        console.error("Error fetching resultados:", error); 
        setError(error.message); 
      }
    };

    fetchResultados(); // Llama a la función para obtener los resultados cuando el componente se monta
  }, [firestore, usuarioActual, usuarioId]); // Ejecuta el efecto cuando cambian firestore, usuarioActual, o usuarioId

  // Función para formatear el nombre del juego
  const formatearNombreJuego = (nombreJuego) => {
    return nombreJuego
      .split('_') // Divide el nombre en partes usando guion bajo
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)) // Capitaliza la primera letra de cada parte
      .join(' '); // Une las partes con espacios
  };

  // Convierte duración de segundos a formato mm:ss
  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  // Exporta los datos de un resultado específico a un archivo CSV
  const exportarResultado = async (resultado) => {
    try {
      const usuarioDoc = await getDoc(doc(firestore, 'users', usuarioId));
      if (!usuarioDoc.exists()) {
        throw new Error('Usuario no encontrado'); // Verifica si el documento del usuario existe
      }
      const { nombre, email } = usuarioDoc.data(); // Obtiene el nombre y email del usuario
      const { categoria, nivel, dificultad, intentos, aciertos, errores, duracion, timestamp, juego } = resultado; // Desestructura los datos del resultado, incluyendo el juego
      const fecha = new Date(timestamp).toLocaleString(); // Convierte la fecha a formato local
      const csvContent = `Nombre,Email,Juego,Categoría,Nivel,Dificultad,Intentos,Aciertos,Errores,Duración,Fecha\n${nombre},${email},${formatearNombreJuego(juego)},${categoria},${nivel},${dificultad},${intentos},${aciertos},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;

      // Formatear el nombre del archivo
      const nombreArchivo = `${nombre.toLowerCase().replace(/ /g, '_')}_${juego}`;

      // Crear un Blob con el contenido CSV y el tipo correcto
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `resultado_${nombreArchivo}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar los datos:', error); // Muestra el error en la consola
    }
  };

  return (
    <div className="evaluacion-usuarios-container">
      <h1>Historial de Evaluación</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <ul className="resultados-list">
          {resultados.map((resultado) => (
            <li key={resultado.id} className="resultado-item">
              <h2>{formatearNombreJuego(resultado.juego)}</h2> {/* Aplica la función aquí */}
              <p>Categoría: {resultado.categoria}</p>
              <p>Nivel: {resultado.nivel}</p>
              <p>Dificultad: {resultado.dificultad}</p>
              <p>Intentos: {resultado.intentos}</p>
              <p>Aciertos: {resultado.aciertos}</p>
              <p>Errores: {resultado.errores}</p>
              <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>
              <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p>
              <button onClick={() => exportarResultado(resultado)}>Exportar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EvaluacionUsuarios;
