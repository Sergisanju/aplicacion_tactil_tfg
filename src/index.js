import React, { useEffect, useState } from 'react';
import app from './firebase-config'; // Asegúrate de que la ruta de importación sea correcta

// Componente que muestra el contenido de un archivo JSON almacenado en Firebase Storage
const MostrarJSON = () => {
  const [data, setData] = useState(null); // Estado para almacenar el contenido del archivo JSON

  useEffect(() => {
    const storage = app.storage(); // Instancia de Firebase Storage
    const pathReference = storage.ref('cartas_de_memoria/animales/animales.json'); 

    pathReference.getDownloadURL()
      .then((url) => {
        fetch(url)
          .then(response => response.json())
          .then(json => {
            setData(json); // Almacena el contenido del archivo JSON en el estado
          })
          .catch(error => console.error("Error al leer el JSON:", error));
      })
      .catch(error => {
        console.error("Error al obtener URL:", error);
      });
  }, []);

  return (
    <div>
      //Muestra el contenido del archivo JSON en un elemento si ya se ha cargado, o un mensaje de "Cargando..." si no se ha cargado
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Cargando...'} 
    </div>
  );
};

export default MostrarJSON;
