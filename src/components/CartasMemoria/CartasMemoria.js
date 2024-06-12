import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './CartasMemoria.css';

const JuegoDeMemoria = () => {
  // Obtiene los parámetros de categoría, nivel y dificultad desde la URL
  const { categoria, nivel, dificultad } = useParams();
  // Extrae el número de pares del parámetro 'nivel'
  const pares = parseInt(nivel.split('-')[0]);

  // Estados para el juego
  const [datosDelJuego, setDatosDelJuego] = useState(null); // Guarda los datos del juego (pares de cartas)
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]); // Guarda los índices de las cartas seleccionadas
  const [paresAcertados, setParesAcertados] = useState([]); // Guarda los índices de las cartas emparejadas
  const [paresIncorrectos, setParesIncorrectos] = useState([]); // Guarda los índices de las cartas incorrectas
  const [error, setError] = useState(null); // Guarda el mensaje de error, si ocurre alguno
  const [horaDeInicio, setHoraDeInicio] = useState(null); // Guarda la hora de inicio del juego
  const [intentos, setIntentos] = useState(0); // Guarda el conteo de intentos totales
  const [intentosCorrectos, setIntentosCorrectos] = useState(0); // Guarda el conteo de intentos correctos
  const [intentosIncorrectos, setIntentosIncorrectos] = useState(0); // Guarda el conteo de intentos incorrectos
  const [mostrarModal, setMostrarModal] = useState(false); // Controla la visibilidad del modal

  // Inicializa Firestore y la autenticación de Firebase
  const firestore = getFirestore();
  const auth = getAuth();
  // Hook de navegación para redirigir a otras rutas
  let navigate = useNavigate();

  // Filtra los datos del juego según la dificultad seleccionada
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

  // Selecciona un número específico de pares de la data barajada
  const seleccionarPares = useCallback((data, pares) => {
    const datosBarajados = barajarArray(data);
    return datosBarajados.slice(0, pares);
  }, []);

  // Baraja un array de manera aleatoria
  const barajarArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const obtenerDatosDelJuego = async () => {
      try {
        // Obtiene la referencia al documento de la categoría del juego en Firestore
        const docRef = doc(firestore, 'juegos', 'cartas_de_memoria', 'categorias', categoria);
        // Obtiene el documento de Firestore
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const datosArchivo = docSnap.data(); // Datos del documento
          const datosCategoria = datosArchivo[categoria]; // Datos específicos de la categoría

          if (datosCategoria && datosCategoria.data) {
            // Filtra y selecciona pares de cartas según la dificultad
            const datosFiltrados = filtrarPorDificultad(datosCategoria.data, dificultad);
            const paresSeleccionados = seleccionarPares(datosFiltrados, pares);
            // Duplica los pares y los baraja
            const paresDuplicados = duplicarPares(paresSeleccionados);
            setDatosDelJuego(barajarArray(paresDuplicados));
            setHoraDeInicio(Date.now()); // Establece la hora de inicio del juego
          } else {
            throw new Error("El campo 'data' está indefinido o falta en el documento");
          }
        } else {
          throw new Error("No existe tal documento!");
        }
      } catch (error) {
        console.error("Error al obtener datos del juego:", error);
        setError(error.message);
      }
    };

    obtenerDatosDelJuego();
  }, [categoria, dificultad, pares, firestore, filtrarPorDificultad, seleccionarPares]);

  // Duplica los pares de cartas para el juego, uno con texto y otro con imagen
  const duplicarPares = (data) => {
    let paresDuplicados = [];
    data.forEach(item => {
      paresDuplicados.push({ ...item, type: 'text' });
      paresDuplicados.push({ ...item, type: 'image' });
    });
    return paresDuplicados;
  };

  // Maneja el clic en una carta
  const manejarClicEnCarta = (index) => {
    // Evita más de dos cartas seleccionadas y cartas ya emparejadas o seleccionadas
    if (cartasSeleccionadas.length === 2 || cartasSeleccionadas.includes(index) || paresAcertados.includes(index)) return;

    // Agrega la carta seleccionada al estado
    const nuevasCartasSeleccionadas = [...cartasSeleccionadas, index];
    setCartasSeleccionadas(nuevasCartasSeleccionadas);
    setIntentos(intentos + 1); // Incrementa el contador de intentos

    if (nuevasCartasSeleccionadas.length === 2) {
      const [primerIndex, segundoIndex] = nuevasCartasSeleccionadas;
      const primeraCarta = datosDelJuego[primerIndex];
      const segundaCarta = datosDelJuego[segundoIndex];
      // Verifica si las cartas seleccionadas son un par correcto
      if (primeraCarta.nombre === segundaCarta.nombre && primeraCarta.type !== segundaCarta.type) {
        setParesAcertados([...paresAcertados, primerIndex, segundoIndex]);
        setIntentosCorrectos(intentosCorrectos + 1); // Incrementa el contador de intentos correctos
        setTimeout(() => {
          setCartasSeleccionadas([]);
          // Verifica si el juego ha terminado
          if (paresAcertados.length + 2 === datosDelJuego.length) {
            guardarResultadosDelJuego(Date.now()); // Guarda los resultados del juego
            setMostrarModal(true); // Muestra el modal de finalización
          }
        }, 1000);
      } else {
        // Si las cartas no coinciden, las marca como incorrectas temporalmente
        setParesIncorrectos([primerIndex, segundoIndex]);
        setIntentosIncorrectos(intentosIncorrectos + 1); // Incrementa el contador de intentos incorrectos
        setTimeout(() => {
          setCartasSeleccionadas([]);
          setParesIncorrectos([]);
        }, 1000);
      }
    }
  };

  // Genera un ID único para la sesión de juego
  const [sessionId] = useState(Date.now().toString());

  // Guarda los resultados del juego en Firestore
  const guardarResultadosDelJuego = async (horaDeFinActual) => {
    const duracionDelJuegoMs = horaDeFinActual - horaDeInicio;
    const duracionDelJuegoSegundos = Math.floor(duracionDelJuegoMs / 1000); // Duración en segundos
    const usuario = auth.currentUser;
    const resultado = {
      categoria,
      nivel,
      dificultad,
      intentos,
      aciertos: intentosCorrectos,
      errores: intentosIncorrectos,
      duracion: duracionDelJuegoSegundos, // Guardar la duración en segundos
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.email : 'anonimo', // Guardar el correo electrónico
      sessionId: sessionId // Guardar el ID de la sesión de juego
    };
    try {
      // Referencia a la colección de resultados del usuario
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuario.uid}/resultados`);
      await addDoc(usuarioDocRef, resultado);
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  };

  // Define el número de columnas del grid según el número de pares
  const obtenerColumnasDeGrid = () => {
    return `repeat(${pares}, 1fr)`;
  };

  // Cierra el modal y navega a la página de resultados
  const cerrarModal = () => {
    setMostrarModal(false);
    navigate(`/resultados/${sessionId}`); // Navega a la página de resultados con el ID de la sesión
  };

  return (
    <div className="contenedor-juego-memoria">
      <h1>Juego de Cartas de Memoria</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : datosDelJuego ? (
        <div className="tablero-juego" style={{ gridTemplateColumns: obtenerColumnasDeGrid() }}>
          {datosDelJuego.map((item, index) => (
            <div
              key={index}
              className={`carta-juego ${cartasSeleccionadas.includes(index) ? 'volteada' : ''} ${paresAcertados.includes(index) ? 'emparejada' : ''} ${paresIncorrectos.includes(index) ? 'incorrecta' : ''}`}
              onClick={() => manejarClicEnCarta(index)}
            >
              <div className="cara-frontal">
                {item.type === 'text' ? item.nombre : <img src={item.imagenURL} alt={item.nombre} />}
              </div>
              <div className="cara-trasera">?</div>
            </div>
          ))}
        </div>
      ) : (
        <p>Cargando datos del juego...</p>
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

export default JuegoDeMemoria;
