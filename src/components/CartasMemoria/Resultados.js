import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Resultados.css'; // Puedes crear un archivo CSS para estilos

const Resultados = () => {
  const { sessionId } = useParams();
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
        const q = query(resultadosCollectionRef, where('sessionId', '==', sessionId));
        const querySnapshot = await getDocs(q);

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
  }, [firestore, auth, sessionId]);

  const convertirSegundosAMinutosSegundos = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
  };

  return (
    <div className="resultados-container">
      <h1>Resultados del Juego</h1>
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

export default Resultados;
