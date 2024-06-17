import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Categorizacion.css';

const Categorizacion = () => {
  const { nivel, dificultad } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [posicionInicial, setPosicionInicial] = useState({});
  const [elementoActual, setElementoActual] = useState(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [error, setError] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'categorias'));
        const categoriasData = categoriasSnapshot.docs.map(doc => doc.id);
        const categoriasSeleccionadas = categoriasData.slice(0, parseInt(nivel));
        setCategorias(categoriasSeleccionadas);

        const elementosPromises = categoriasSeleccionadas.map(async (category) => {
          const elementosData = [];
          const categoryRef = doc(firestore, 'juegos', 'categorizacion', 'categorias', category);
          const categorySnapshot = await getDoc(categoryRef);

          if (categorySnapshot.exists()) {
            const data = categorySnapshot.data().data;
            const elementosFiltrados = data.filter(el => {
              if (dificultad === 'Facil') return el.dificultad === 0;
              if (dificultad === 'Medio') return el.dificultad <= 1;
              if (dificultad === 'Dificil') return el.dificultad <= 2;
              return false;
            }).slice(0, 3);
            elementosFiltrados.forEach(el => {
              elementosData.push({
                ...el,
                nombre: el.nombre,
                categoria: category,
              });
            });
          }

          if (dificultad === 'Dificil') {
            const subcategoriasRef = collection(firestore, 'juegos', 'categorizacion', 'subcategorias');
            const subcategoriasSnapshot = await getDocs(subcategoriasRef);

            subcategoriasSnapshot.docs.forEach(doc => {
              if (doc.id.startsWith(`${category}_`)) {
                const subcategoriaData = doc.data().data;
                const subElementosFiltrados = subcategoriaData.filter(el => el.dificultad <= 2).slice(0, 3);
                subElementosFiltrados.forEach(el => {
                  elementosData.push({
                    ...el,
                    nombre: el.nombre,
                    categoria: category,
                  });
                });
              }
            });
          }

          return elementosData;
        });

        const allElementos = await Promise.all(elementosPromises);
        const elementosConPosicion = allElementos.flat().map((elemento, index) => ({
          ...elemento,
          id: index,
          posicion: { x: 10 + (index % 3) * 150, y: 10 + Math.floor(index / 3) * 60 },
          posicionInicial: { x: 10 + (index % 3) * 150, y: 10 + Math.floor(index / 3) * 60 }, // Guardar la posición inicial
          visible: true,
        }));
        setElementos(elementosConPosicion);
      } catch (error) {
        console.error("Error al cargar datos: ", error);
        setError(error.message);
      }
    };

    cargarDatos();
  }, [firestore, nivel, dificultad]);

  const manejarArrastreInicio = (e, elemento) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setElementoActual(elemento);
    setArrastrando(true);
    setPosicionInicial({
      x: clientX - elemento.posicion.x,
      y: clientY - elemento.posicion.y,
    });
  };

  const manejarArrastre = useCallback((e) => {
    if (arrastrando && elementoActual) {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      setElementos((elementos) =>
        elementos.map((el) =>
          el.id === elementoActual.id
            ? { ...el, posicion: { x: clientX - posicionInicial.x, y: clientY - posicionInicial.y } }
            : el
        )
      );
    }
  }, [arrastrando, elementoActual, posicionInicial]);

  const manejarSoltar = (e) => {
    if (arrastrando && elementoActual) {
      const clientX = e.clientX !== undefined ? e.clientX : e.changedTouches[0].clientX;
      const clientY = e.clientY !== undefined ? e.clientY : e.changedTouches[0].clientY;
      if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
        const dropTarget = document.elementFromPoint(clientX, clientY);
        if (dropTarget) {
          const categoria = dropTarget.closest('.categoria')?.getAttribute('data-categoria');
          if (categoria === elementoActual.categoria) {
            setElementos((elementos) =>
              elementos.map((el) =>
                el.id === elementoActual.id ? { ...el, visible: false } : el
              )
            );
          } else {
            // Regresar a la posición inicial
            setElementos((elementos) =>
              elementos.map((el) =>
                el.id === elementoActual.id ? { ...el, posicion: el.posicionInicial } : el
              )
            );
          }
        }
      }
      setElementoActual(null);
      setArrastrando(false);
    }
  };

  useEffect(() => {
    const handleMouseUp = manejarSoltar;
    const handleTouchEnd = manejarSoltar;

    const addEventListeners = () => {
      document.addEventListener('mousemove', manejarArrastre, { passive: false });
      document.addEventListener('touchmove', manejarArrastre, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
    };

    const removeEventListeners = () => {
      document.removeEventListener('mousemove', manejarArrastre);
      document.removeEventListener('touchmove', manejarArrastre);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    if (arrastrando) {
      addEventListeners();
    } else {
      removeEventListeners();
    }

    return () => removeEventListeners();
  }, [arrastrando, manejarArrastre, manejarSoltar]);

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
                data-categoria={categoria}
              >
                {categoria}
              </div>
            ))}
          </div>
          <div className="elementos">
            {elementos.map((elemento) => (
              <div
                key={elemento.id}
                className={`elemento ${arrastrando && elementoActual && elementoActual.id === elemento.id ? 'arrastrando' : ''}`}
                style={{
                  left: `${elemento.posicion.x}px`,
                  top: `${elemento.posicion.y}px`,
                  display: elemento.visible ? 'block' : 'none',
                  zIndex: arrastrando && elementoActual && elementoActual.id === elemento.id ? 1000 : 'auto',
                  touchAction: 'none',
                }}
                onMouseDown={(e) => manejarArrastreInicio(e, elemento)}
                onTouchStart={(e) => manejarArrastreInicio(e, elemento)}
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
