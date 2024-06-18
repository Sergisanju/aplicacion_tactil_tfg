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

  // Función para mezclar aleatoriamente una lista
  const mezclarElementos = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const categoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'categorias'));
        const subcategoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'subcategorias'));

        const categoriasData = categoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          tipo: 'categoria'
        }));

        const subcategoriasData = subcategoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          tipo: 'subcategoria',
          general: doc.id.split('_')[0]  // Obtener la categoría general de la subcategoría
        }));

        let seleccionables;
        if (dificultad === 'Dificil') {
          // Decidir aleatoriamente entre usar categorías o subcategorías
          const usarCategorias = Math.random() < 0.5;
          if (usarCategorias) {
            seleccionables = categoriasData;
          } else {
            // Seleccionar una categoría general al azar
            const subcategoriasGenerales = [...new Set(subcategoriasData.map(sub => sub.general))];
            const generalSeleccionado = mezclarElementos(subcategoriasGenerales)[0];
            seleccionables = subcategoriasData.filter(sub => sub.general === generalSeleccionado);
          }
        } else {
          seleccionables = categoriasData;
        }

        seleccionables = mezclarElementos(seleccionables).slice(0, parseInt(nivel)); // Selección aleatoria coherente
        setCategorias(seleccionables.map(c => c.id));

        const elementosPromises = seleccionables.map(async (cat) => {
          const { id, tipo } = cat;
          let elementosData = [];
          const ref = doc(firestore, 'juegos', 'categorizacion', tipo === 'categoria' ? 'categorias' : 'subcategorias', id);
          const snapshot = await getDoc(ref);

          if (snapshot.exists()) {
            const data = snapshot.data().data;
            let elementosFiltrados = data.filter(el => {
              if (dificultad === 'Facil') return el.dificultad === 0;
              if (dificultad === 'Medio') return el.dificultad <= 1;
              if (dificultad === 'Dificil') return el.dificultad <= 2;
              return false;
            }).slice(0, 3);

            elementosFiltrados = mezclarElementos(elementosFiltrados); // Mezclar elementos dentro de la categoría

            elementosData = elementosFiltrados.map(el => ({
              ...el,
              nombre: el.nombre,
              categoria: id,
            }));
          }

          return elementosData;
        });

        let allElementos = await Promise.all(elementosPromises);
        allElementos = allElementos.flat();
        allElementos = mezclarElementos(allElementos); // Desordenar los elementos

        const elementosConPosicion = allElementos.map((elemento, index) => ({
          ...elemento,
          id: index,
          posicion: {
            x: (index % 3) * 180 + 20,  // Ajustar posición horizontal
            y: Math.floor(index / 3) * 120 + 80  // Ajustar posición vertical
          },
          posicionInicial: {
            x: (index % 3) * 180 + 20,
            y: Math.floor(index / 3) * 120 + 80
          },
          visible: true,
        }));
        setElementos(elementosConPosicion);
      } catch (error) {
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

      const categoriasElementos = document.querySelectorAll('.categoria');
      let categoriaDetectada = null;
      categoriasElementos.forEach(categoriaElemento => {
        const bounds = categoriaElemento.getBoundingClientRect();
        if (clientX >= bounds.left && clientX <= bounds.right &&
            clientY >= bounds.top && clientY <= bounds.bottom) {
          categoriaDetectada = categoriaElemento.getAttribute('data-categoria');
        }
      });

      if (categoriaDetectada !== elementoActual.categoria) {
        setElementos((elementos) =>
          elementos.map((el) =>
            el.id === elementoActual.id
              ? { ...el, posicion: el.posicionInicial, className: 'incorrecto' }
              : el
          )
        );
        categoriasElementos.forEach(categoriaElemento => {
          if (categoriaElemento.getAttribute('data-categoria') === categoriaDetectada) {
            categoriaElemento.classList.add('incorrecto-categoria');
            setTimeout(() => {
              categoriaElemento.classList.remove('incorrecto-categoria');
            }, 1000);
          }
        });
        setTimeout(() => {
          setElementos((elementos) =>
            elementos.map((el) =>
              el.id === elementoActual.id
                ? { ...el, className: '' }
                : el
            )
          );
        }, 1000);
      } else {
        setElementos((elementos) =>
          elementos.map((el) =>
            el.id === elementoActual.id ? { ...el, visible: false } : el
          )
        );
        categoriasElementos.forEach(categoriaElemento => {
          if (categoriaElemento.getAttribute('data-categoria') === categoriaDetectada) {
            categoriaElemento.classList.add('correcto-categoria');
            setTimeout(() => {
              categoriaElemento.classList.remove('correcto-categoria');
            }, 1000);
          }
        });
      }

      setElementoActual(null);
      setArrastrando(false);
    }
  };

  useEffect(() => {
    const handleMouseUp = manejarSoltar;
    const handleTouchEnd = manejarSoltar;

    const addEventListeners = () => {
      document.addEventListener('mousemove', manejarArrastre);
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
        <div className="juego">
          <div className="elementos">
            {elementos.map((elemento) => (
              <div
                key={elemento.id}
                className={`elemento ${elemento.className || ''} ${arrastrando && elementoActual && elementoActual.id === elemento.id ? 'arrastrando' : ''}`}
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
          <div className="categorias">
            {categorias.map((categoria) => (
              <div
                key={categoria}
                className="categoria"
                data-categoria={categoria}
              >
                {categoria.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorizacion;
