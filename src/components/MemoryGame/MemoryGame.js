import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './MemoryGame.css';

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
            guardarResultadosDelJuego();
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

  const guardarResultadosDelJuego = async () => {
    const duracionDelJuegoMs = horaDeFin - horaDeInicio;
    const duracionDelJuego = convertirMsAMinutosSegundos(duracionDelJuegoMs);
    const usuario = auth.currentUser;
    const resultado = {
      categoria,
      nivel,
      dificultad,
      intentos,
      aciertos: intentosCorrectos,
      errores: intentosIncorrectos,
      duracion: duracionDelJuego,
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.uid : 'anonimo',
    };
    try {
      const usuarioDocRef = doc(firestore, 'ResultadosJuegos', 'cartas_de_memoria', 'usuarios', usuario.uid);
      await setDoc(usuarioDocRef, { exists: true }, { merge: true }); // Crear el documento de usuario si no existe
      await addDoc(collection(usuarioDocRef, 'resultados'), resultado);
      console.log('Resultados del juego guardados con éxito');
      navigate('/game-results');
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  };

  const convertirMsAMinutosSegundos = (ms) => {
    const minutos = Math.floor(ms / 60000);
    const segundos = ((ms % 60000) / 1000).toFixed(0);
    return `${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
  };

  const obtenerColumnasDeGrid = () => {
    return `repeat(${pares}, 1fr)`;
  };

  return (
    <div className="memory-game-container">
      <h1>Juego de Cartas de Memoria</h1>
      {error ? (
        <p>Error: {error}</p>
      ) : datosDelJuego ? (
        <div className="game-board" style={{ gridTemplateColumns: obtenerColumnasDeGrid() }}>
          {datosDelJuego.map((item, index) => (
            <div
              key={index}
              className={`game-card ${cartasSeleccionadas.includes(index) ? 'flipped' : ''} ${paresAcertados.includes(index) ? 'matched' : ''} ${paresIncorrectos.includes(index) ? 'incorrect' : ''}`}
              onClick={() => manejarClicEnCarta(index)}
            >
              <div className="card-front">
                {item.type === 'text' ? item.nombre : <img src={item.imagenURL} alt={item.nombre} />}
              </div>
              <div className="card-back">?</div>
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
