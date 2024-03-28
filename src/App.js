import React, { useEffect, useState } from 'react';
import { getDownloadURL, ref } from "firebase/storage";
import storage from './firebase-config';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fileRef = ref(storage, 'cartas_de_memoria/animales/animales.json');

    getDownloadURL(fileRef)
      .then((url) => {
        fetch(url)
          .then(response => response.json())
          .then(json => setData(json))
          .catch(error => console.error('Error al obtener datos JSON:', error));
      })
      .catch((error) => {
        console.error("Error al obtener la URL del archivo:", error);
      });
  }, []);

  return (
    <div>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}

export default App;
