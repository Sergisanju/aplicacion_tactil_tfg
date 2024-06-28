import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Categorizacion.css';

const Categorizacion = () => {
  const { nivel, dificultad } = useParams(); // Obtiene los parámetros de nivel y dificultad de la URL
  const [categorias, setCategorias] = useState([]); // Estado para almacenar las categorías seleccionadas
  const [elementos, setElementos] = useState([]); // Estado para almacenar los elementos a categorizar
  const [posicionInicial, setPosicionInicial] = useState({}); // Estado para la posición inicial de un elemento
  const [elementoActual, setElementoActual] = useState(null); // Estado para el elemento actualmente arrastrado
  const [arrastrando, setArrastrando] = useState(false); // Estado para indicar si se está arrastrando un elemento
  const [error, setError] = useState(null); // Estado para manejar errores
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para mostrar el modal de finalización
  const [horaDeInicio, setHoraDeInicio] = useState(null); // Estado para almacenar la hora de inicio del juego
  const [errores, setErrores] = useState(0); // Estado para contar los errores cometidos durante el juego
  const [sessionId] = useState(Date.now().toString()); // Estado para el ID de la sesión de juego
  const firestore = getFirestore(); // Instancia de Firestore
  const auth = getAuth(); // Instancia de autenticación de Firebase
  const navigate = useNavigate(); // Hook para la navegación programática

  // Función para mezclar aleatoriamente una lista (algoritmo de Fisher-Yates)
  const mezclarElementos = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Efecto para cargar datos de Firestore al montar el componente
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtiene datos de categorías y subcategorías desde Firestore
        const categoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'categorias'));
        const subcategoriasSnapshot = await getDocs(collection(firestore, 'juegos', 'categorizacion', 'subcategorias'));

        // Mapea los datos de categorías
        const categoriasData = categoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          tipo: 'categoria'
        }));

        // Mapea los datos de subcategorías y obtiene la categoría general
        const subcategoriasData = subcategoriasSnapshot.docs.map(doc => ({
          id: doc.id,
          tipo: 'subcategoria',
          general: doc.id.split('_')[0] // Parte general de la subcategoría
        }));

        let seleccionables;

        if (dificultad === 'Dificil') {
          // Decide aleatoriamente entre usar categorías o subcategorías
          const usarCategorias = Math.random() < 0.5;

          if (usarCategorias) {
            seleccionables = categoriasData; // Selecciona categorías si elige usar categorías
          } else {
            // Selecciona una subcategoría general al azar
            const subcategoriasGenerales = [...new Set(subcategoriasData.map(sub => sub.general))];
            const generalSeleccionado = mezclarElementos(subcategoriasGenerales)[0];

            // Filtra subcategorías del mismo tipo general
            const subcategoriasSeleccionadas = subcategoriasData.filter(sub => sub.general === generalSeleccionado);

            // Añade subcategorías del mismo tipo general hasta el límite de nivel
            seleccionables = subcategoriasSeleccionadas.slice(0, parseInt(nivel));

            // Si no se cumplen las 4, agregar más subcategorías de otro tipo general
            if (seleccionables.length < parseInt(nivel)) {
              const subcategoriasRestantes = subcategoriasData.filter(sub => sub.general !== generalSeleccionado);
              const subcategoriasAdicionales = mezclarElementos(subcategoriasRestantes).slice(0, parseInt(nivel) - seleccionables.length);
              seleccionables = [...seleccionables, ...subcategoriasAdicionales];
            }
          }
        } else {
          seleccionables = categoriasData; // Selecciona categorías si la dificultad no es difícil
        }

        // Mezcla y selecciona el número necesario de categorías o subcategorías
        seleccionables = mezclarElementos(seleccionables).slice(0, parseInt(nivel));
        setCategorias(seleccionables.map(c => c.id)); // Guarda las categorías seleccionadas

        // Promesas para cargar los elementos de cada categoría
        const elementosPromises = seleccionables.map(async (cat) => {
          const { id, tipo } = cat;
          let elementosData = [];
          const ref = doc(firestore, 'juegos', 'categorizacion', tipo === 'categoria' ? 'categorias' : 'subcategorias', id);
          const snapshot = await getDoc(ref);

          if (snapshot.exists()) {
            const data = snapshot.data().data;

            // Filtra los elementos según la dificultad
            let elementosFiltrados = data.filter(el => {
              if (dificultad === 'Facil') return el.dificultad === 0;
              if (dificultad === 'Medio') return el.dificultad <= 1;
              if (dificultad === 'Dificil') return el.dificultad <= 2;
              return false;
            }).slice(0, 3);

            elementosFiltrados = mezclarElementos(elementosFiltrados); // Mezcla los elementos dentro de la categoría

            elementosData = elementosFiltrados.map(el => ({
              ...el,
              nombre: el.nombre,
              categoria: id,
            }));
          }

          return elementosData;
        });

        let allElementos = await Promise.all(elementosPromises); // Espera a que todas las promesas se resuelvan
        allElementos = allElementos.flat(); // Aplana la lista de elementos
        allElementos = mezclarElementos(allElementos); // Desordena los elementos

        // Asigna posición inicial a cada elemento
        const elementosConPosicion = allElementos.map((elemento, index) => ({
          ...elemento,
          id: index,
          posicion: {
            x: (index % 3) * 180 + 20,  // Ajusta la posición horizontal
            y: Math.floor(index / 3) * 120 + 80  // Ajusta la posición vertical
          },
          posicionInicial: {
            x: (index % 3) * 180 + 20,
            y: Math.floor(index / 3) * 120 + 80
          },
          visible: true,
        }));
        setElementos(elementosConPosicion); // Guarda los elementos con su posición inicial
        setHoraDeInicio(Date.now()); // Guarda la hora de inicio del juego
      } catch (error) {
        setError(error.message); // Maneja errores y los guarda en el estado
      }
    };

    cargarDatos(); // Llama a la función para cargar los datos al montar el componente
  }, [firestore, nivel, dificultad]);

  // Función para guardar los resultados del juego en Firestore
  const guardarResultadosDelJuego = useCallback(async (horaDeFinActual) => {
    const duracionDelJuegoMs = horaDeFinActual - horaDeInicio;
    const duracionDelJuegoSegundos = Math.floor(duracionDelJuegoMs / 1000); // Convierte la duración a segundos
    const usuario = auth.currentUser;
    const resultado = {
      nivel,
      dificultad,
      duracion: duracionDelJuegoSegundos,
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.email : 'anonimo',
      elementosClasificados: elementos.length,
      errores, // Guarda el número de errores
      categorias: categorias,
      sessionId, // Guarda el ID de la sesión de juego
    };
    try {
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/categorizacion/usuarios/${usuario ? usuario.uid : 'anonimo'}/resultados`);
      await addDoc(usuarioDocRef, resultado);
      console.log('Resultados del juego guardados con éxito');
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  }, [horaDeInicio, auth, firestore, nivel, dificultad, elementos, errores, categorias, sessionId]);

  // Maneja el inicio del arrastre de un elemento
  const manejarArrastreInicio = (e, elemento) => {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    setElementoActual(elemento); // Guarda el elemento actual en el estado
    setArrastrando(true); // Indica que se está arrastrando un elemento
    setPosicionInicial({
      x: clientX - elemento.posicion.x,
      y: clientY - elemento.posicion.y,
    });
  };

  // Maneja el arrastre de un elemento mientras se mueve
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

  // Maneja la acción al soltar un elemento
  const manejarSoltar = useCallback((e) => {
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

      // Si el elemento no se coloca en la categoría correcta
      if (categoriaDetectada !== elementoActual.categoria) {
        setErrores(prevErrores => prevErrores + 1); // Incrementa el contador de errores
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
        // Si el elemento se coloca en la categoría correcta
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

        // Verificar si todos los elementos se han clasificado correctamente
        if (elementos.filter(el => el.visible).length === 1) {
          guardarResultadosDelJuego(Date.now()); // Guarda los resultados del juego
          setMostrarModal(true); // Muestra el modal de finalización
        }
      }

      setElementoActual(null); // Restablece el elemento actual
      setArrastrando(false); // Indica que se ha terminado de arrastrar
    }
  }, [arrastrando, elementoActual, guardarResultadosDelJuego, elementos]);

  // Función para cerrar el modal y navegar a la página de resultados
  const cerrarModal = () => {
    setMostrarModal(false);
    navigate(`/categorizacion/resultados/${sessionId}`);
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
          <div className="elementos-categorizacion">
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
          <div className="categorias-categorizacion">
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
      {mostrarModal && (
        <div className="modal">
          <div className="modal-contenido">
            <h2>¡Enhorabuena!</h2>
            <p>Has terminado el juego.</p>
            <button className="aceptar" onClick={cerrarModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorizacion;
