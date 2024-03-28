import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

function App() {
  const [animales, setAnimales] = useState([]);

  useEffect(() => {
    const storage = getStorage();
    const storageRef = ref(storage, 'cartas_de_memoria/animales.json');
    
    getDownloadURL(storageRef)
      .then((url) => {
        fetch(url)
          .then(response => response.json())
          .then(data => {
            setAnimales(data); // Asumiendo que data es un arreglo de objetos
          });
      })
      .catch(error => {
        console.error('Error loading JSON:', error);
      });
  }, []);

  return (
    <div>
      <h1>Lista de Animales</h1>
      {animales.map((animal, index) => (
        <p key={index}>{animal.nombre}</p> // Asumiendo que cada objeto tiene un 'nombre'
      ))}
    </div>
  );
}

export default App;