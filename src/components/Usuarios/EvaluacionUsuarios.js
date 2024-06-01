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

        console.log("Usuario autenticado:", usuarioActual.uid);

        // Verificar que el usuario actual es un analista
        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) {
          throw new Error("Analista doc no existe");
        }

        console.log("Documento del analista:", analistaDoc.data());

        if (analistaDoc.data().tipoUsuario !== 'Analista') {
          throw new Error("User is not an analyst");
        }

        console.log("El usuario es un analista");

        // Verificar que el usuarioId está en la lista de asociados del analista
        const asociados = analistaDoc.data().asociados || [];
        if (!asociados.includes(usuarioId)) {
          throw new Error("User not associated with this analyst");
        }

        console.log("El usuario está asociado con este analista");

        // Obtener resultados del usuario asociado
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuarioId}/resultados`);
        const querySnapshot = await getDocs(resultadosCollectionRef);

        console.log("Query snapshot obtenido");

        const resultadosList = [];
        querySnapshot.forEach((doc) => {
          resultadosList.push({ id: doc.id, ...doc.data() });
        });

        console.log("Lista de resultados:", resultadosList);

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EvaluacionUsuarios;
