import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './SeleccionCategoriaSecuenciacion.css';

// Función para capitalizar la primera letra y reemplazar guiones bajos por espacios
const formatCategoria = (string) => {
  return string
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const SeleccionCategoria = () => {
  const [categorias, setCategorias] = useState([]); // Estado para almacenar las categorías
  const firestore = getFirestore(); // Instancia de Firestore

  // Obtener las categorías cuando el componente se monta
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        // Referencia a la colección de categorías en Firestore
        const categoriasCollection = collection(firestore, 'juegos', 'secuenciacion', 'categorias');
        const categoriasSnapshot = await getDocs(categoriasCollection); // Obtiene documentos de la colección
        const categoriasList = categoriasSnapshot.docs.map(doc => doc.id); // Mapea los documentos a una lista de categorías
        setCategorias(categoriasList); // Actualiza el estado con las categorías
      } catch (error) {
        console.error("Error fetching categories: ", error); // Manejo de errores
      }
    };

    fetchCategorias(); 
  }, [firestore]); // Dependencias actualizadas

  // Renderizar filas de categorías para distribuirlas en filas de 2 items
  const renderizarFilasDeCategorias = () => {
    const filas = [];
    const itemsPorFila = 2; // Número de categorías por fila
    for (let i = 0; i < categorias.length; i += itemsPorFila) {
      filas.push(
        <div className="fila-categoria" key={i}>
          {categorias.slice(i, i + itemsPorFila).map((categoria) => (
            <Link to={`/secuenciacion/${categoria}`} key={categoria} className="boton-categoria">
              {formatCategoria(categoria)}
            </Link>
          ))}
        </div>
      );
    }
    return filas;
  };

  return (
    <div className="contenedor-seleccion-categoria">
      <h1>Secuenciación</h1>
      <h2>Escoge una categoría</h2>
      {categorias.length > 0 ? (
        <div className="categorias">
          {renderizarFilasDeCategorias()}
        </div>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
};

export default SeleccionCategoria;
