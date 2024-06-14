import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './SeleccionCategoriaSecuenciacion.css';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const SeleccionCategoria = () => {
  const [categorias, setCategorias] = useState([]);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const categoriasCollection = collection(firestore, 'juegos', 'secuenciacion', 'categorias');
        const categoriasSnapshot = await getDocs(categoriasCollection);
        const categoriasList = categoriasSnapshot.docs.map(doc => doc.id);
        setCategorias(categoriasList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      }
    };

    fetchCategorias();
  }, [firestore]);

  const renderizarFilasDeCategorias = () => {
    const filas = [];
    const itemsPorFila = 2; 
    for (let i = 0; i < categorias.length; i += itemsPorFila) {
      filas.push(
        <div className="fila-categoria" key={i}>
          {categorias.slice(i, i + itemsPorFila).map((categoria) => (
            <Link to={`/secuenciacion/${categoria}`} key={categoria} className="boton-categoria">
              {capitalizeFirstLetter(categoria)}
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
