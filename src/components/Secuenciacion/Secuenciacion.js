import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import './Secuenciacion.css';

const JuegoDeSecuenciacion = () => {
  const { categoria, nivel, dificultad } = useParams();
  const [titulo, setTitulo] = useState('');
  const [datosDelJuego, setDatosDelJuego] = useState([]);
  const [ordenCorrecto, setOrdenCorrecto] = useState([]);
  const [ordenActual, setOrdenActual] = useState([]);
  const [seleccion, setSeleccion] = useState([]);
  const [intentos, setIntentos] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [retroalimentacion, setRetroalimentacion] = useState(null);
  const [error, setError] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

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

  useEffect(() => {
    const obtenerDatosDelJuego = async () => {
      try {
        const docRef = doc(firestore, 'juegos', 'secuenciacion', 'categorias', categoria);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const datosArchivo = docSnap.data();
          const datosCategoria = datosArchivo[categoria];
          if (datosCategoria && datosCategoria.data) {
            const datosFiltrados = filtrarPorDificultad(datosCategoria.data, dificultad);
            const datosSeleccionados = datosFiltrados[0].elementos; // Selecciona el primer set de datos
            setTitulo(datosFiltrados[0].titulo); // Añadir título
            setOrdenCorrecto(datosSeleccionados);
            setDatosDelJuego(datosSeleccionados.sort(() => Math.random() - 0.5));
            setOrdenActual(datosSeleccionados); // Inicializa orden actual con los elementos barajados
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
  }, [categoria, dificultad, firestore, filtrarPorDificultad]);

  const intercambiarElementos = (indice1, indice2) => {
    const nuevoOrden = [...ordenActual];
    const temp = nuevoOrden[indice1];
    nuevoOrden[indice1] = nuevoOrden[indice2];
    nuevoOrden[indice2] = temp;
    return nuevoOrden;
  };

  const manejarClicEnElemento = (index) => {
    const nuevaSeleccion = [...seleccion, index];
    if (nuevaSeleccion.length === 2) {
      const [indice1, indice2] = nuevaSeleccion;
      const nuevoOrden = intercambiarElementos(indice1, indice2);
      setOrdenActual(nuevoOrden);
      setIntentos(intentos + 1);
      setSeleccion([]);
      if (JSON.stringify(nuevoOrden) === JSON.stringify(ordenCorrecto)) {
        setAciertos(aciertos + 1);
        setRetroalimentacion('¡Correcto!');
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

  const guardarResultadosDelJuego = async () => {
    const usuario = auth.currentUser;
    const resultado = {
      categoria,
      nivel,
      dificultad,
      intentos,
      aciertos,
      timestamp: new Date().toISOString(),
      jugadorId: usuario ? usuario.email : 'anonimo', // Guardar el correo electrónico
      sessionId: sessionId // Guardar el ID de la sesión de juego
    };
    try {
      const usuarioDocRef = collection(firestore, `ResultadosJuegos/secuenciacion/usuarios/${usuario.uid}/resultados`);
      await addDoc(usuarioDocRef, resultado);
      console.log('Resultados del juego guardados con éxito');
      navigate(`/resultados/${sessionId}`); // Navegar a la página de resultados con el ID de la sesión
    } catch (error) {
      console.error('Error al guardar los resultados del juego:', error);
    }
  };

  return (
    <div className="contenedor-juego-secuenciacion">
      <h1>Juego de Secuenciación</h1>
      {error ? (
        <p>Error: {error}</p>
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
        </>
      )}
    </div>
  );
};

export default JuegoDeSecuenciacion;
