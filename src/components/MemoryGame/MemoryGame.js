import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './MemoryGame.css';

const MemoryGame = () => {
  const { category, level, difficulty } = useParams();
  const pairs = parseInt(level.split('-')[0]); // Extract the number of pairs from the level parameter
  const [gameData, setGameData] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [incorrectPairs, setIncorrectPairs] = useState([]);
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const docRef = doc(firestore, 'juegos', 'cartas_de_memoria', 'categories', category);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const fileData = docSnap.data();
          const categoryData = fileData[category];
          if (categoryData && categoryData.data) {
            const filteredData = filterByDifficulty(categoryData.data, difficulty);
            const selectedPairs = selectPairs(filteredData, pairs);
            setGameData(shuffleArray([...selectedPairs, ...selectedPairs])); // Duplicar y mezclar
          } else {
            throw new Error("Data field is undefined or missing in the document");
          }
        } else {
          throw new Error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        setError(error.message);
      }
    };

    fetchGameData();
  }, [category, difficulty, pairs, firestore]);

  const filterByDifficulty = (data, difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'facil':
        return data.filter(item => item.dificultad === 0);
      case 'medio':
        return data.filter(item => item.dificultad <= 1);
      case 'dificil':
        return data.filter(item => item.dificultad <= 2);
      default:
        return data;
    }
  };

  const selectPairs = (data, pairs) => {
    const shuffledData = shuffleArray(data);
    return shuffledData.slice(0, pairs);
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const handleCardClick = (index) => {
    if (selectedCards.length === 2 || selectedCards.includes(index) || matchedPairs.includes(index)) return;

    const newSelectedCards = [...selectedCards, index];
    setSelectedCards(newSelectedCards);

    if (newSelectedCards.length === 2) {
      const [firstIndex, secondIndex] = newSelectedCards;
      if (gameData[firstIndex].nombre === gameData[secondIndex].nombre) {
        setMatchedPairs([...matchedPairs, firstIndex, secondIndex]);
        setTimeout(() => setSelectedCards([]), 1000);
      } else {
        setIncorrectPairs([firstIndex, secondIndex]);
        setTimeout(() => {
          setSelectedCards([]);
          setIncorrectPairs([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="memory-game-container">
      <h1>Juego de Cartas de Memoria</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : gameData ? (
        <div className="game-board">
          {gameData.map((item, index) => (
            <div
              key={index}
              className={`game-card ${selectedCards.includes(index) ? 'flipped' : ''} ${matchedPairs.includes(index) ? 'matched' : ''} ${incorrectPairs.includes(index) ? 'incorrect' : ''}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="card-front">{item.nombre}</div>
              <div className="card-back">?</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Cargando datos del juego...</p>
      )}
    </div>
  );
};

export default MemoryGame;
