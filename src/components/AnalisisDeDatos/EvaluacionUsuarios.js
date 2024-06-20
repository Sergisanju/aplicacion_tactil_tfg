import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './EvaluacionUsuarios.css';

const EvaluacionUsuarios = () => {
  const { usuarioId, juego } = useParams(); // Obtiene el ID del usuario y el juego desde la URL
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
          throw new Error("Usuario no es analista"); // Verifica si el usuario actual es un analista
        }

        // Verificar que el usuarioId está en la lista de asociados del analista
        const asociados = analistaDoc.data().asociados || [];
        if (!asociados.includes(usuarioId)) {
          throw new Error("Usuario no asociado con el analista"); // Verifica si el usuario está asociado con el analista
        }

        // Obtener resultados del usuario asociado del juego especificado
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/${juego}/usuarios/${usuarioId}/resultados`);
        const querySnapshot = await getDocs(resultadosCollectionRef);
        const resultadosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), juego }));
        setResultados(resultadosList); // Actualiza el estado con los resultados obtenidos
      } catch (error) {
        console.error("Error fetching resultados:", error);
        setError(error.message); // Actualiza el estado de error
      }
    };

    fetchResultados(); // Llama a la función para obtener los resultados cuando el componente se monta
  }, [firestore, usuarioActual, usuarioId, juego]); // Ejecuta el efecto cuando cambian firestore, usuarioActual, usuarioId o juego

  // Función para formatear el nombre del juego
  const formatearNombreJuego = (nombreJuego) => {
    return nombreJuego
      .split('_') // Divide el nombre en partes usando guion bajo
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1)) // Capitaliza la primera letra de cada parte
      .join(' '); // Une las partes con espacios
  };

  // Función para formatear las categorías
  const formatearCategorias = (categorias) => {
    if (Array.isArray(categorias)) {
      // Si categorias es un array
      return categorias.map(categoria =>
        categoria
          .split('_')
          .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
          .join(' ')
      ).join(', ');
    } else if (typeof categorias === 'string') {
      // Si categorias es un string
      return categorias
        .split('_')
        .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
        .join(' ');
    } else {
      return 'N/A';
    }
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
      const { categoria, categorias, dificultad, elementosClasificados, errores, duracion, timestamp, juego, intentos, aciertos, nivel } = resultado; // Desestructura los datos del resultado
      const fecha = new Date(timestamp).toLocaleString(); // Convierte la fecha a formato local
      const categoriasFormateadas = formatearCategorias(categoria || categorias); // Formatea las categorías

      // Define el contenido CSV según el tipo de juego
      let csvContent = '';
      let nombreArchivo = `${nombre.toLowerCase().replace(/ /g, '_')}_${juego}`;

      switch (juego) {
        case 'cartas_de_memoria':
          csvContent = `Nombre,Email,Juego,Categoría,Nivel,Dificultad,Intentos,Aciertos,Errores,Duración,Fecha\n${nombre},${email},${formatearNombreJuego(juego)},${categoriasFormateadas},${nivel},${dificultad},${intentos},${aciertos},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;
          break;
        case 'secuenciacion':
          csvContent = `Nombre,Email,Juego,Categoría,Dificultad,Intentos,Duración,Fecha\n${nombre},${email},${formatearNombreJuego(juego)},${categoriasFormateadas},${dificultad},${intentos},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;
          break;
        case 'categorizacion':
          csvContent = `Nombre,Email,Juego,Categorías,Dificultad,Elementos Clasificados,Errores,Duración,Fecha\n${nombre},${email},${formatearNombreJuego(juego)},${categoriasFormateadas},${dificultad},${elementosClasificados},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;
          break;
        default:
          throw new Error('Tipo de juego no soportado para exportación');
      }

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

  // Renderiza la información específica para cada juego
  const renderizarResultado = (resultado) => {
    const categoriasFormateadas = formatearCategorias(resultado.categoria || resultado.categorias);
    
    switch (resultado.juego) {
      case 'cartas_de_memoria':
        return (
          <>
            <p>Categoría: {categoriasFormateadas}</p>
            <p>Nivel: {resultado.nivel ?? 'N/A'}</p>
            <p>Dificultad: {resultado.dificultad ?? 'N/A'}</p>
            <p>Intentos: {resultado.intentos ?? 'N/A'}</p>
            <p>Aciertos: {resultado.aciertos ?? 'N/A'}</p>
            <p>Errores: {resultado.errores ?? 'N/A'}</p>
            <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>
            <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p>
          </>
        );
      case 'secuenciacion':
        return (
          <>
            <p>Categoría: {categoriasFormateadas}</p>
            <p>Dificultad: {resultado.dificultad ?? 'N/A'}</p>
            <p>Intentos: {resultado.intentos ?? 'N/A'}</p>
            <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>
            <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p>
          </>
        );
      case 'categorizacion':
        return (
          <>
            <p>Categorías: {categoriasFormateadas}</p>
            <p>Dificultad: {resultado.dificultad ?? 'N/A'}</p>
            <p>Elementos Clasificados: {resultado.elementosClasificados ?? 'N/A'}</p>
            <p>Errores: {resultado.errores ?? 'N/A'}</p>
            <p>Duración: {convertirSegundosAMinutosSegundos(resultado.duracion)}</p>
            <p>Fecha: {new Date(resultado.timestamp).toLocaleString()}</p>
          </>
        );
      default:
        return <p>Datos no disponibles para este juego</p>;
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
              <h2>{formatearNombreJuego(resultado.juego)}</h2>
              {renderizarResultado(resultado)} {/* Renderiza resultados específicos */}
              <button onClick={() => exportarResultado(resultado)}>Exportar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EvaluacionUsuarios;
