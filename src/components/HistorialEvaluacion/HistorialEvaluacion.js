import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './HistorialEvaluacion.css'; // Asegúrate de crear este archivo CSS para estilos

const HistorialEvaluacion = () => {
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }

        const userId = user.uid;
        const resultadosCollectionRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${userId}/resultados`);
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
  }, [firestore, auth]);

  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  return (
    <div className="historial-evaluacion-container">
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

export default HistorialEvaluacion;