import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './CartasMemoria.css';

const JuegoDeMemoria = () => {
  const { categoria, nivel, dificultad } = useParams(); // Obtiene los parámetros de la URL
  const pares = parseInt(nivel.split('-')[0]); // Extrae el número de pares desde el parámetro 'nivel'

  const [datosDelJuego, setDatosDelJuego] = useState(null); // Datos del juego (pares de cartas)
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]); // Índices de cartas seleccionadas
  const [paresAcertados, setParesAcertados] = useState([]); // Índices de pares acertados
  const [paresIncorrectos, setParesIncorrectos] = useState([]); // Índices de pares incorrectos
  const [error, setError] = useState(null); // Mensaje de error
  const [horaDeInicio, setHoraDeInicio] = useState(null); // Hora de inicio del juego
  const [intentos, setIntentos] = useState(1); // Contador de intentos, inicia en 1 para la primera carta
  const [aciertos, setAciertos] = useState(1); // Contador de aciertos, inicia en 1 por el primer intento correcto
  const [errores, setErrores] = useState(0); // Contador de errores
  const [mostrarModal, setMostrarModal] = useState(false); // Estado del modal de finalización

  const firestore = getFirestore(); // Instancia de Firestore
  const auth = getAuth(); // Instancia de autenticación de Firebase
  const navigate = useNavigate(); // Hook para la navegación programática

  // Filtra los datos del juego por dificultad
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

  // Selecciona un número específico de pares de la data
  const seleccionarPares = useCallback((data, pares) => {
    const datosBarajados = barajarArray(data);
    return datosBarajados.slice(0, pares);
  }, []);

  // Baraja un array de manera aleatoria
  const barajarArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    // Función para obtener los datos del juego desde Firestore
    const obtenerDatosDelJuego = async () => {
      try {
        // Referencia al documento de la categoría en Firestore
        const docRef = doc(firestore, 'juegos', 'cartas_de_memoria', 'categorias', categoria);
        const docSnap = await getDoc(docRef); // Obtiene el documento

        if (docSnap.exists()) {
          const datosArchivo = docSnap.data(); // Datos del documento
          const datosCategoria = datosArchivo[categoria]; // Datos específicos de la categoría

          if (datosCategoria && datosCategoria.data) {
            // Filtra los datos y selecciona los pares
            const datosFiltrados = filtrarPorDificultad(datosCategoria.data, dificultad);
            const paresSeleccionados = seleccionarPares(datosFiltrados, pares);
            // Duplica los pares seleccionados y los baraja
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
        setError(error.message); // Guarda el mensaje de error
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
    if (cartasSeleccionadas.length === 2 || cartasSeleccionadas.includes(index) || paresAcertados.includes(index)) return;

    const nuevasCartasSeleccionadas = [...cartasSeleccionadas, index];
    setCartasSeleccionadas(nuevasCartasSeleccionadas);
    
    // Incrementa intentos cada vez que se selecciona una carta
    setIntentos(prevIntentos => prevIntentos + 1);

    if (nuevasCartasSeleccionadas.length === 2) {
      const [primerIndex, segundoIndex] = nuevasCartasSeleccionadas;
      const primeraCarta = datosDelJuego[primerIndex];
      const segundaCarta = datosDelJuego[segundoIndex];

      if (primeraCarta.nombre === segundaCarta.nombre && primeraCarta.type !== segundaCarta.type) {
        setParesAcertados(prevParesAcertados => [...prevParesAcertados, primerIndex, segundoIndex]);
        setAciertos(prevAciertos => prevAciertos + 1); // Incrementa el contador de aciertos
        setTimeout(() => {
          setCartasSeleccionadas([]);
          // Verifica si el juego ha terminado
          if (paresAcertados.length + 2 === datosDelJuego.length) {
            guardarResultadosDelJuego(Date.now());
            setMostrarModal(true);
          }
        }, 1000);
      } else {
        setParesIncorrectos([primerIndex, segundoIndex]);
        setErrores(prevErrores => prevErrores + 1); // Incrementa el contador de errores
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
    const duracionDelJuegoSegundos = Math.floor(duracionDelJuegoMs / 1000); // Convierte la duración a segundos
    const usuario = auth.currentUser;
    const resultado = {
      categoria,
      nivel,
      dificultad,
      intentos,
      aciertos,
      errores,
      duracion: duracionDelJuegoSegundos,
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.email : 'anonimo', // Guarda el correo electrónico del usuario
      sessionId: sessionId // Guarda el ID de la sesión de juego
    };
    try {
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuario.uid}/resultados`);
      await addDoc(usuarioDocRef, resultado);
      console.log('Resultados del juego guardados con éxito');
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
    navigate(`/cartas-memoria/resultados/${sessionId}`); // Navega a la página de resultados con el ID de la sesión
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
