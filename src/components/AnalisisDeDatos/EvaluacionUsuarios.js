import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './EvaluacionUsuarios.css';

const EvaluacionUsuarios = () => {
  const { usuarioId } = useParams();
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        console.log("Inicio de fetchResultados");

        if (!usuarioActual) {
          throw new Error("User not authenticated");
        }

        // Verificar que el usuario actual es un analista
        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) {
          throw new Error("Analista doc no existe");
        }

        if (analistaDoc.data().tipoUsuario !== 'Analista') {
          throw new Error("User is not an analyst");
        }

        // Verificar que el usuarioId está en la lista de asociados del analista
        const asociados = analistaDoc.data().asociados || [];
        if (!asociados.includes(usuarioId)) {
          throw new Error("User not associated with this analyst");
        }
        
        // Obtener resultados del usuario asociado
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuarioId}/resultados`);
        const querySnapshot = await getDocs(resultadosCollectionRef);

        const resultadosList = [];
        querySnapshot.forEach((doc) => {
          resultadosList.push({ id: doc.id, ...doc.data() });
        });

        setResultados(resultadosList);
      } catch (error) {
        console.error("Error fetching resultados:", error);
        setError(error.message);
      }
    };

    fetchResultados();
  }, [firestore, usuarioActual, usuarioId]);

  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  const exportarResultado = async (resultado) => {
    try {
      const usuarioDoc = await getDoc(doc(firestore, 'users', usuarioId));
      if (!usuarioDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }
      const { nombre, email } = usuarioDoc.data();
      const { categoria, nivel, dificultad, intentos, aciertos, errores, duracion, timestamp } = resultado;
      const fecha = new Date(timestamp).toLocaleString();
      const csvContent = `Nombre,Email,Categoría,Nivel,Dificultad,Intentos,Aciertos,Errores,Duración,Fecha\n${nombre},${email},${categoria},${nivel},${dificultad},${intentos},${aciertos},${errores},${convertirSegundosAMinutosSegundos(duracion)},${fecha}\n`;

      // Formatear el nombre del archivo
      const nombreArchivo = nombre.toLowerCase().replace(/ /g, '_');

      // Crear un Blob con el contenido CSV y el tipo correcto
      const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `resultado_cartas_memoria_${nombreArchivo}.csv`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al exportar los datos:', error);
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
              <h2>{resultado.categoria}</h2>
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
