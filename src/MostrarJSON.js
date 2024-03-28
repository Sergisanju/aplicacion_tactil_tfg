import React, { useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import app from './firebase-config'; // Asegúrate de importar la configuración de Firebase correcta

const MostrarJSON = () => {
  const [jsonData, setJsonData] = useState(null);

  useEffect(() => {
    const storage = getStorage(app);
    const fileRef = ref(storage, 'cartas_de_memoria/animales.json');

    getDownloadURL(fileRef)
      .then((url) => {
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            setJsonData(data);
          })
          .catch((error) => console.error('Error al obtener el JSON:', error));
      })
      .catch((error) => console.error('Error al obtener la URL de descarga:', error));
  }, []);

  return (
    <div>
      <h2>Contenido del archivo JSON:</h2>
      {jsonData ? (
        <pre>{JSON.stringify(jsonData, null, 2)}</pre>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default MostrarJSON;
