// src/components/MemoryGame/MemoryGame.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import './MemoryGame.css';

const MemoryGame = () => {
  const { category } = useParams();
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState(null); // Añadir estado para errores
  const firestore = getFirestore();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        // Construir la referencia al documento en Firestore
        const docRef = doc(firestore, 'juegos', 'cartas_de_memoria', 'categories', category);
        
        // Obtener el documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fileData = docSnap.data();
          console.log("Document data:", fileData); // Agregar log para verificar los datos del documento
          
          // Verificar si el campo 'url' existe dentro del campo 'animales' o el campo correspondiente a la categoría
          const categoryData = fileData[category];
          if (categoryData && categoryData.url) {
            // Obtener el JSON desde la URL
            const response = await axios.get(categoryData.url);
            setGameData(response.data);
          } else {
            throw new Error("URL is undefined or missing in the category data");
          }
        } else {
          throw new Error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        setError(error.message); // Establecer el mensaje de error
      }
    };

    fetchGameData();
  }, [category, firestore]);

  return (
    <div className="memory-game-container">
      <h1>Juego de Cartas de Memoria</h1>
      <h2>Categoría: {category}</h2>
      {error ? (
        <p>Error: {error}</p>
      ) : gameData ? (
        <div>
          {/* Renderiza los datos del archivo JSON */}
          {Array.isArray(gameData) ? (
            gameData.map((item, index) => (
              <div key={index} className="game-item">
                <h3>{item.name}</h3>
                <p>{item.value}</p>
              </div>
            ))
          ) : (
            <pre>{JSON.stringify(gameData, null, 2)}</pre>
          )}
        </div>
      ) : (
        <p>Cargando datos del juego...</p>
      )}
    </div>
  );
};

export default MemoryGame;
