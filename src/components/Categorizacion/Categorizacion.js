import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Categorizacion.css';

const Categorizacion = () => {
  const { nivel, dificultad } = useParams();
  const [categorias, setCategorias] = useState([]);
  const [elementos, setElementos] = useState([]);
  const [posicionInicial, setPosicionInicial] = useState({});
  const [elementoActual, setElementoActual] = useState(null);
  const [posicion, setPosicion] = useState({ x: 0, y: 0 });
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
            }).slice(0, 3); // Selecciona 3 elementos de acuerdo con la dificultad
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
          id: index, // Añade un identificador único para cada elemento
          posicion: { x: 0, y: 0 }, // Inicializa la posición del elemento
          visible: true, // Controla la visibilidad del elemento
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
    setPosicion({ x: clientX, y: clientY });
    setElementoActual(elemento);
    setArrastrando(true);
    setPosicionInicial({
      x: e.target.getBoundingClientRect().left,
      y: e.target.getBoundingClientRect().top,
    });
  };

  const manejarArrastre = (e) => {
    if (arrastrando) {
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      setPosicion({ x: clientX, y: clientY });
    }
  };

  const manejarSoltar = (e, categoria) => {
    e.preventDefault();
    if (arrastrando && elementoActual) {
      if (elementoActual.categoria === categoria) {
        setElementos(elementos =>
          elementos.map(el =>
            el.id === elementoActual.id ? { ...el, visible: false } : el
          )
        );
        alert('Correcto!');
      } else {
        setElementos(elementos =>
          elementos.map(el =>
            el.id === elementoActual.id ? { ...el, posicion: { ...posicionInicial } } : el
          )
        );
        alert('Incorrecto!');
      }
      setElementoActual(null);
      setArrastrando(false);
    }
  };

  useEffect(() => {
    if (arrastrando) {
      document.addEventListener('mousemove', manejarArrastre);
      document.addEventListener('touchmove', manejarArrastre);
      document.addEventListener('mouseup', () => setArrastrando(false));
      document.addEventListener('touchend', () => setArrastrando(false));
    } else {
      document.removeEventListener('mousemove', manejarArrastre);
      document.removeEventListener('touchmove', manejarArrastre);
      document.removeEventListener('mouseup', () => setArrastrando(false));
      document.removeEventListener('touchend', () => setArrastrando(false));
    }

    return () => {
      document.removeEventListener('mousemove', manejarArrastre);
      document.removeEventListener('touchmove', manejarArrastre);
      document.removeEventListener('mouseup', () => setArrastrando(false));
      document.removeEventListener('touchend', () => setArrastrando(false));
    };
  }, [arrastrando]);

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
                onDrop={(e) => manejarSoltar(e, categoria)}
              >
                {categoria}
              </div>
            ))}
          </div>
          <div className="elementos">
            {elementos.map((elemento) => (
              <div
                key={elemento.id}
                className={`elemento ${arrastrando && elementoActual === elemento ? 'arrastrando' : ''}`}
                style={arrastrando && elementoActual === elemento ? {
                  position: 'absolute',
                  left: posicion.x,
                  top: posicion.y,
                  zIndex: 1000,
                } : {
                  position: 'relative',
                  left: elemento.posicion.x,
                  top: elemento.posicion.y,
                  display: elemento.visible ? 'block' : 'none',
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
