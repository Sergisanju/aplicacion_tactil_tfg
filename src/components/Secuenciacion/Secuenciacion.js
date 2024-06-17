import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Secuenciacion.css';

const JuegoDeSecuenciacion = () => {
  const { categoria, dificultad } = useParams(); // Obtener parámetros de la URL
  const [titulo, setTitulo] = useState(''); // Estado para el título del juego
  const [datosDelJuego, setDatosDelJuego] = useState([]); // Estado para los datos del juego
  const [ordenCorrecto, setOrdenCorrecto] = useState([]); // Estado para el orden correcto
  const [ordenActual, setOrdenActual] = useState([]); // Estado para el orden actual de los elementos
  const [seleccion, setSeleccion] = useState([]); // Estado para el índice de elementos seleccionados
  const [intentos, setIntentos] = useState(1); // Estado para contar los intentos
  const [retroalimentacion, setRetroalimentacion] = useState(null); // Estado para mostrar retroalimentación
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para mostrar el modal
  const [error, setError] = useState(null); // Estado para manejar errores
  const [inicioJuego, setInicioJuego] = useState(null); // Estado para capturar el inicio del juego
  const firestore = getFirestore(); // Obtener instancia de Firestore
  const auth = getAuth(); // Obtener instancia de autenticación de Firebase
  const navigate = useNavigate(); // Hook para navegación

  // Función para filtrar datos según la dificultad
  const filtrarPorDificultad = useCallback((data, dificultad) => {
    switch (dificultad.toLowerCase()) {
      case 'facil':
        return data.filter(item => item.dificultad === 0);
      case 'medio':
        return data.filter(item => item.dificultad <= 1);
      case 'dificil':
        return data.filter(item => item.dificultad <= 2);
      default:
        return data;
    }
  }, []);

  // useEffect para obtener los datos del juego cuando se monta el componente
  useEffect(() => {
    const obtenerDatosDelJuego = async () => {
      try {
        // Referencia al documento en Firestore
        const docRef = doc(firestore, 'juegos', 'secuenciacion', 'categorias', categoria);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Obtener datos de la categoría
          const datosArchivo = docSnap.data();
          const datosCategoria = datosArchivo[categoria];
          if (datosCategoria && datosCategoria.data) {
            // Filtrar los datos según la dificultad
            const datosFiltrados = filtrarPorDificultad(datosCategoria.data, dificultad);
            if (datosFiltrados.length > 0) {
              // Seleccionar un set de datos aleatoriamente
              const setAleatorio = datosFiltrados[Math.floor(Math.random() * datosFiltrados.length)];
              const datosSeleccionados = setAleatorio.elementos; // Seleccionar el set aleatorio
              setTitulo(setAleatorio.titulo); // Establecer el título
              setOrdenCorrecto(datosSeleccionados); // Establecer el orden correcto
              // Barajar los datos aleatoriamente para el juego
              const datosAleatorios = datosSeleccionados.slice().sort(() => Math.random() - 0.5);
              setDatosDelJuego(datosAleatorios); // Establecer los datos del juego
              setOrdenActual(datosAleatorios); // Inicializar el orden actual con los elementos barajados
              setInicioJuego(Date.now()); // Capturar el tiempo de inicio del juego
            } else {
              throw new Error("No hay sets de datos disponibles para la dificultad seleccionada");
            }
          } else {
            throw new Error("El campo 'data' está indefinido o falta en el documento");
          }
        } else {
          throw new Error("No existe tal documento!");
        }
      } catch (error) {
        console.error("Error al obtener datos del juego:", error);
        setError(error.message); // Asignar el error al estado
      }
    };

    obtenerDatosDelJuego();
  }, [categoria, dificultad, firestore, filtrarPorDificultad]);

  // Función para intercambiar elementos en el orden actual
  const intercambiarElementos = (indice1, indice2) => {
    // 1. Crear una copia del array 'ordenActual'
    const nuevoOrden = [...ordenActual];
    // 2. Guardar el elemento en la posición 'indice1' en una variable temporal
    const temp = nuevoOrden[indice1];
    // 3. Asignar el elemento en la posición 'indice2' a la posición 'indice1'
    nuevoOrden[indice1] = nuevoOrden[indice2];
    // 4. Asignar el elemento guardado en 'temp' (originalmente en 'indice1') a la posición 'indice2'
    nuevoOrden[indice2] = temp;
    // 5. Devolver el nuevo array con los elementos intercambiados
    return nuevoOrden;
  };
  

  // Función para manejar clics en los elementos
  const manejarClicEnElemento = (index) => {
    const nuevaSeleccion = [...seleccion, index];
    if (nuevaSeleccion.length === 2) {
      const [indice1, indice2] = nuevaSeleccion;
      const nuevoOrden = intercambiarElementos(indice1, indice2);
      setOrdenActual(nuevoOrden);
      setIntentos(intentos + 1);
      setSeleccion([]);
      if (JSON.stringify(nuevoOrden) === JSON.stringify(ordenCorrecto)) {
        setRetroalimentacion('¡Correcto!');
        setMostrarModal(true); // Mostrar modal al acertar
        setTimeout(() => {
          setRetroalimentacion(null);
          guardarResultadosDelJuego();
        }, 1500);
      } else {
        setRetroalimentacion('¡Incorrecto! Inténtalo de nuevo.');
        setTimeout(() => setRetroalimentacion(null), 1500);
      }
    } else {
      setSeleccion(nuevaSeleccion);
    }
  };

  const [sessionId] = useState(Date.now().toString()); // Generar un ID único para la sesión de juego

  // Función para guardar los resultados del juego
  const guardarResultadosDelJuego = async () => {
    const usuario = auth.currentUser;
    const duracion = Math.floor((Date.now() - inicioJuego) / 1000); // Calcular duración en segundos
    const resultado = {
      categoria: categoria || 'desconocido', // Valor por defecto si está indefinido
      dificultad: dificultad || 'desconocido', // Valor por defecto si está indefinido
      intentos, // Solo guardar intentos
      duracion, // Guardar la duración
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.email : 'anonimo', // Guardar el correo electrónico
      sessionId: sessionId // Guardar el ID de la sesión de juego
    };
    try {
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/secuenciacion/usuarios/${usuario.uid}/resultados`);
      await addDoc(usuarioDocRef, resultado);
      console.log('Resultados del juego guardados con éxito');
      navigate(`/secuenciacion/resultados/${sessionId}`); // Navegar a la página de resultados con el ID de la sesión
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  };

  return (
    <div className="contenedor-juego-secuenciacion">
      <h1>Juego de Secuenciación</h1>
      {error ? (
        <p>Error: {error}</p> // Mostrar error en la UI
      ) : (
        <>
          <h2 className="titulo-secuenciacion">{titulo}</h2> {/* Título añadido */}
          <div className="tablero-secuenciacion">
            {ordenActual.map((item, index) => (
              <div
                key={index}
                className={`elemento-secuenciacion ${seleccion.includes(index) ? 'seleccionado' : ''}`}
                onClick={() => manejarClicEnElemento(index)}
              >
                {item}
              </div>
            ))}
          </div>
          {retroalimentacion && (
            <div className={`retroalimentacion ${retroalimentacion === '¡Correcto!' ? 'correcto' : 'incorrecto'}`}>
              {retroalimentacion}
            </div>
          )}
          {mostrarModal && (
            <div className="modal">
              <div className="modal-contenido">
                <h2>¡Enhorabuena!</h2>
                <p>Has terminado el juego.</p>
                <button onClick={() => navigate(`/secuenciacion/resultados/${sessionId}`)}>OK</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default JuegoDeSecuenciacion;
