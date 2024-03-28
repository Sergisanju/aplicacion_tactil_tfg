// MostrarJSON.js
import React, { useEffect, useState } from 'react';
import firebase from './firebase-config'; // Asegúrate de que la ruta de importación sea correcta

const MostrarJSON = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const storage = firebase.storage();
    const pathReference = storage.ref('cartas_de_memoria/animales.json'); // Cambia esto por la ruta de tu archivo en Firebase Storage

    pathReference.getDownloadURL()
      .then((url) => {
        fetch(url)
          .then(response => response.json())
          .then(json => {
            setData(json);
          })
          .catch(error => console.error("Error al leer el JSON:", error));
      })
      .catch(error => {
        console.error("Error al obtener URL:", error);
      });
  }, []);

  return (
    <div>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Cargando...'}
    </div>
  );
};

export default MostrarJSON;
