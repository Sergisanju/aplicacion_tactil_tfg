import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './CartasMemoria.css';

const JuegoDeMemoria = () => {
  const { categoria, nivel, dificultad } = useParams();
  const pares = parseInt(nivel.split('-')[0]);
  const [datosDelJuego, setDatosDelJuego] = useState(null);
  const [cartasSeleccionadas, setCartasSeleccionadas] = useState([]);
  const [paresAcertados, setParesAcertados] = useState([]);
  const [paresIncorrectos, setParesIncorrectos] = useState([]);
  const [error, setError] = useState(null);
  const [horaDeInicio, setHoraDeInicio] = useState(null);
  const [horaDeFin, setHoraDeFin] = useState(null);
  const [intentos, setIntentos] = useState(0);
  const [intentosCorrectos, setIntentosCorrectos] = useState(0);
  const [intentosIncorrectos, setIntentosIncorrectos] = useState(0);
  const firestore = getFirestore();
  const auth = getAuth();
  let navigate = useNavigate();

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

  const seleccionarPares = useCallback((data, pares) => {
    const datosBarajados = barajarArray(data);
    return datosBarajados.slice(0, pares);
  }, []);

  const barajarArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const obtenerDatosDelJuego = async () => {
      try {
        const docRef = doc(firestore, 'juegos', 'cartas_de_memoria', 'categories', categoria);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const datosArchivo = docSnap.data();
          const datosCategoria = datosArchivo[categoria];
          if (datosCategoria && datosCategoria.data) {
            const datosFiltrados = filtrarPorDificultad(datosCategoria.data, dificultad);
            const paresSeleccionados = seleccionarPares(datosFiltrados, pares);
            const paresDuplicados = duplicarPares(paresSeleccionados);
            setDatosDelJuego(barajarArray(paresDuplicados));
            setHoraDeInicio(Date.now());
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

  const duplicarPares = (data) => {
    let paresDuplicados = [];
    data.forEach(item => {
      paresDuplicados.push({ ...item, type: 'text' });
      paresDuplicados.push({ ...item, type: 'image' });
    });
    return paresDuplicados;
  };

  const manejarClicEnCarta = (index) => {
    if (cartasSeleccionadas.length === 2 || cartasSeleccionadas.includes(index) || paresAcertados.includes(index)) return;

    const nuevasCartasSeleccionadas = [...cartasSeleccionadas, index];
    setCartasSeleccionadas(nuevasCartasSeleccionadas);
    setIntentos(intentos + 1);

    if (nuevasCartasSeleccionadas.length === 2) {
      const [primerIndex, segundoIndex] = nuevasCartasSeleccionadas;
      const primeraCarta = datosDelJuego[primerIndex];
      const segundaCarta = datosDelJuego[segundoIndex];
      if (primeraCarta.nombre === segundaCarta.nombre && primeraCarta.type !== segundaCarta.type) {
        setParesAcertados([...paresAcertados, primerIndex, segundoIndex]);
        setIntentosCorrectos(intentosCorrectos + 1);
        setTimeout(() => {
          setCartasSeleccionadas([]);
          if (paresAcertados.length + 2 === datosDelJuego.length) {
            setHoraDeFin(Date.now());
            guardarResultadosDelJuego(Date.now()); // Pasar la hora de finalización como argumento
          }
        }, 1000);
      } else {
        setParesIncorrectos([primerIndex, segundoIndex]);
        setIntentosIncorrectos(intentosIncorrectos + 1);
        setTimeout(() => {
          setCartasSeleccionadas([]);
          setParesIncorrectos([]);
        }, 1000);
      }
    }
  };

  const [sessionId] = useState(Date.now().toString()); // Generar un ID único para la sesión de juego

  const guardarResultadosDelJuego = async (horaDeFinActual) => { // Recibir la hora de finalización como argumento
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
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/cartas_de_memoria/usuarios/${usuario.uid}/resultados`);
      await addDoc(usuarioDocRef, resultado);
      console.log('Resultados del juego guardados con éxito');
      navigate(`/resultados/${sessionId}`); // Navegar a la página de resultados con el ID de la sesión
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  };

  const convertirMsAMinutosSegundos = (ms) => {
    const minutos = Math.floor(ms / 60000);
    const segundos = Math.floor((ms % 60000) / 1000);
    return `${minutos < 10 ? '0' : ''}${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  const obtenerColumnasDeGrid = () => {
    return `repeat(${pares}, 1fr)`;
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
    </div>
  );
};

export default JuegoDeMemoria;
