// src/components/MemoryGame/MemoryGame.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';
import './MemoryGame.css';

const MemoryGame = () => {
  const { category } = useParams();
  const [gameData, setGameData] = useState(null);
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
          // Obtener el JSON desde la URL
          const response = await axios.get(fileData.url);
          setGameData(response.data);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching game data: ", error);
      }
    };

    fetchGameData();
  }, [category, firestore]);

  return (
    <div className="memory-game-container">
      <h1>Juego de Cartas de Memoria</h1>
      <h2>Categoría: {category}</h2>
      {gameData ? (
        // Renderiza el contenido del archivo JSON
        <div>
          {/* Aquí puedes renderizar tu juego basado en gameData */}
          <pre>{JSON.stringify(gameData, null, 2)}</pre>
        </div>
      ) : (
        <p>Cargando datos del juego...</p>
      )}
    </div>
  );
};

export default MemoryGame;
