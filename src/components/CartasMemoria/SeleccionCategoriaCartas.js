import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './SeleccionCategoriaCartas.css'; 

// Función para capitalizar la primera letra de una cadena
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const SeleccionCategoria = () => {
  const [categorias, setCategorias] = useState([]); // Estado para almacenar las categorías
  const firestore = getFirestore(); // Instancia de Firestore

  useEffect(() => {
    // Función para obtener las categorías desde Firestore
    const fetchCategorias = async () => {
      try {
        // Referencia a la colección de categorías dentro de 'cartas_de_memoria'
        const categoriasCollection = collection(firestore, 'juegos', 'cartas_de_memoria', 'categorias');
        // Obtiene los documentos de la colección
        const categoriasSnapshot = await getDocs(categoriasCollection);
        // Extrae los IDs de los documentos y los guarda en el estado
        const categoriasList = categoriasSnapshot.docs.map(doc => doc.id);
        setCategorias(categoriasList); // Actualiza el estado con las categorías
      } catch (error) {
        console.error("Error fetching categories: ", error); 
      }
    };

    fetchCategorias(); 
  }, [firestore]); 

  // Renderiza las categorías en filas de 2 elementos
  const renderizarFilasDeCategorias = () => {
    const filas = []; // Array para almacenar las filas
    const itemsPorFila = 2; // Número de elementos por fila
    for (let i = 0; i < categorias.length; i += itemsPorFila) {
      filas.push(
        <div className="fila-categoria" key={i}>
          {categorias.slice(i, i + itemsPorFila).map((categoria) => (
            <Link to={`/cartas-memoria/${categoria}`} key={categoria} className="boton-categoria">
              {capitalizeFirstLetter(categoria)} {/* Muestra el nombre de la categoría con la primera letra en mayúscula */}
            </Link>
          ))}
        </div>
      );
    }
    return filas; 
  };

  return (
    <div className="contenedor-seleccion-categoria">
      <h1>Cartas de memoria</h1> {/* Título principal */}
      <h2>Escoge una categoría</h2> {/* Subtítulo */}
      {categorias.length > 0 ? (
        <div className="categorias">
          {renderizarFilasDeCategorias()} {/* Renderiza las filas de categorías */}
        </div>
      ) : (
        <p>Cargando...</p> // Muestra un mensaje mientras se cargan las categorías
      )}
    </div>
  );
};

export default SeleccionCategoria; // Exporta el componente
