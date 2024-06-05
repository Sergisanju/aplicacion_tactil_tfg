import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Categorizacion.css';

const Categorizacion = () => {
  const { nivel, dificultad } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [elementoActual, setElementoActual] = useState(null);
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener las categorías desde Firestore
        const categoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'categorias'));
        const categoriasData = categoriasSnapshot.docs.map(doc => doc.id);

        setCategorias(categoriasData.slice(0, parseInt(nivel)));

        const elementosPromises = categoriasData.slice(0, parseInt(nivel)).map(async (category) => {
          const elementosData = [];

          // Acceder a los archivos JSON directamente dentro de las categorías
          const categoryRef = doc(firestore, 'juegos', 'categorizacion', 'categorias', category);
          const categorySnapshot = await getDoc(categoryRef);

          if (categorySnapshot.exists()) {
            const data = categorySnapshot.data();
            elementosData.push({
              ...data,
              nombre: categorySnapshot.id,
              categoria: category,
            });
          }

          // Acceder a las subcategorías dentro de cada categoría
          const subcategoriasRef = collection(firestore, 'juegos', 'categorizacion', 'subcategorias');
          const subcategoriasSnapshot = await getDocs(subcategoriasRef);

          subcategoriasSnapshot.docs.forEach(doc => {
            if (doc.id.startsWith(`${category}_`)) {
              const subcategoriaData = doc.data();
              elementosData.push({
                ...subcategoriaData,
                nombre: doc.id,
                categoria: category,
              });
            }
          });

          return elementosData;
        });

        const allElementos = await Promise.all(elementosPromises);
        setElementos(allElementos.flat());
      } catch (error) {
        console.error("Error al cargar datos: ", error);
        setError(error.message);
      }
    };

    cargarDatos();
  }, [firestore, nivel, dificultad]);

  const manejarArrastreInicio = (elemento) => {
    setElementoActual(elemento);
  };

  const manejarSoltar = (categoria) => {
    if (elementoActual) {
      if (elementoActual.categoria === categoria) {
        alert('Correcto!');
      } else {
        alert('Incorrecto!');
      }
      setElementoActual(null);
    }
  };

  return (
    <div className="contenedor-categorizacion">
      <h1>Categorización</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : (
        <>
          <div className="categorias">
            {categorias.map((categoria) => (
              <div
                key={categoria}
                className="categoria"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => manejarSoltar(categoria)}
              >
                {categoria}
              </div>
            ))}
          </div>
          <div className="elementos">
            {elementos.map((elemento) => (
              <div
                key={elemento.nombre}
                className="elemento"
                draggable
                onDragStart={() => manejarArrastreInicio(elemento)}
              >
                {elemento.nombre}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Categorizacion;
