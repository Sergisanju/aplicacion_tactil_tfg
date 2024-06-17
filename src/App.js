import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase-config';
import app from './firebase-config';
import Inicio from './components/Inicio/Inicio';
import Header from './components/Header/Header';
import SeleccionDeCategoria from './components/CartasMemoria/SeleccionCategoriaCartas';
import SeleccionDeNivel from './components/CartasMemoria/SeleccionNivelCartas';
import SeleccionDeDificultad from './components/CartasMemoria/SeleccionDificultadCartas';
import JuegoDeMemoria from './components/CartasMemoria/CartasMemoria';
import Login from './components/Login/Login';
import RestablecerContrasena from './components/Login/RestablecerContrasena';
import Perfil from './components/Perfil/Perfil';
import Registro from './components/Registro/Registro';
import ResultadosCartas from './components/CartasMemoria/ResultadosCartas';
import JuegosEvaluados from './components/HistorialEvaluacion/JuegosEvaluados';
import HistorialEvaluacion from './components/HistorialEvaluacion/HistorialEvaluacion';
import EvaluacionUsuarios from './components/AnalisisDeDatos/EvaluacionUsuarios';
import AnalisisDeDatos from './components/AnalisisDeDatos/AnalisisDeDatos';
import SeleccionarJuegoAnalisis from './components/AnalisisDeDatos/SeleccionarJuego';
import GestionUsuarios from './components/Gestion/GestionUsuarios';
import FormularioUsuario from './components/Gestion/FormularioUsuario';
import AgregarUsuario from './components/Gestion/AgregarUsuario';
import AsociarJugadores from './components/Gestion/AsociarJugadores';
import './App.css';
import JuegoDeCategorizacion from './components/Categorizacion/Categorizacion';
import SeleccionNivelCategorizacion from './components/Categorizacion/SeleccionNivelCategorizacion';
import SeleccionDificultadCategorizacion from './components/Categorizacion/SeleccionDificultadCategorizacion';
import ResultadosCategorizacion from './components/Categorizacion/ResultadosCategorizacion';
import JuegoDeSecuenciacion from './components/Secuenciacion/Secuenciacion';
import SeleccionCategoriaSecuenciacion from './components/Secuenciacion/SeleccionCategoriaSecuenciacion';
import SeleccionDificultadSecuenciacion from './components/Secuenciacion/SeleccionDificultadSecuenciacion';
import ResultadosSecuenciacion from './components/Secuenciacion/ResultadosSecuenciacion';

const App = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false); // Estado de autenticación del usuario
  const [rolUsuario, setRolUsuario] = useState(''); // Rol del usuario autenticado
  const [cargando, setCargando] = useState(true); // Estado de carga
  const auth = getAuth(app); // Obtiene la instancia de autenticación de Firebase

  useEffect(() => {
    // Observa el estado de autenticación del usuario
    const limpiaObservador = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        // Si el usuario está autenticado, obtiene el documento del usuario
        const userDoc = await getDoc(doc(firestore, 'users', usuario.uid));
        if (userDoc.exists()) {
          setRolUsuario(userDoc.data().tipoUsuario); // Establece el rol del usuario
        }
        setEstaAutenticado(true); // Establece que el usuario está autenticado
      } else {
        setEstaAutenticado(false); // El usuario no está autenticado
      }
      setCargando(false); // Termina la carga
    });

    return () => limpiaObservador(); // Limpia el observador cuando el componente se desmonta
  }, [auth]);

  const renderizarRutas = () => (
    <Routes>
      {/* Ruta principal, depende de la autenticación */}
      <Route path="/" element={estaAutenticado ? <Inicio /> : <Navigate to="/login" />} />
      {/* Ruta de login, depende de la autenticación */}
      <Route path="/login" element={!estaAutenticado ? <Login /> : <Navigate to="/" />} />
      <Route path="/login/restablecer-contrasena" element={<RestablecerContrasena />} />
      {/* Ruta de registro, depende de la autenticación */}
      <Route path="/registro" element={!estaAutenticado ? <Registro /> : <Navigate to="/" />} />
      {/* Ruta de perfil, depende de la autenticación */}
      <Route path="/perfil" element={estaAutenticado ? <Perfil /> : <Navigate to="/login" />} />
      {/* Ruta de historial de evaluacion usuario, depende de la autenticación */}
      <Route path="/historial-evaluacion" element={estaAutenticado ? <JuegosEvaluados /> : <Navigate to="/login" />} />
      {/* Ruta de historial de evaluación, depende de la autenticación */}
      <Route path="/historial-evaluacion/:juego" element={estaAutenticado ? <HistorialEvaluacion /> : <Navigate to="/login" />} />
      
      {/* Rutas para el juego de cartas de memoria, solo accesible para jugadores */}
      <Route
        path="/cartas-memoria"
        element={
          estaAutenticado
            ? (rolUsuario === 'Jugador' ? <SeleccionDeCategoria /> : <Navigate to="/role-warning" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/cartas-memoria/:categoria"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionDeNivel /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/cartas-memoria/:categoria/:nivel"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionDeDificultad /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/cartas-memoria/:categoria/:nivel/:dificultad"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <JuegoDeMemoria /> : <Navigate to="/login" />
        }
      />
      
      {/* Rutas para el juego de categorización, solo accesible para jugadores */}
      <Route
        path="/categorizacion"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionNivelCategorizacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/categorizacion/:nivel"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionDificultadCategorizacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/categorizacion/:nivel/:dificultad"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <JuegoDeCategorizacion /> : <Navigate to="/login" />
        }
      />
      
      {/* Rutas para el juego de secuenciación, solo accesible para jugadores */}
      <Route
        path="/secuenciacion"
        element={
          estaAutenticado
            ? (rolUsuario === 'Jugador' ? <SeleccionCategoriaSecuenciacion /> : <Navigate to="/role-warning" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/secuenciacion/:categoria"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionDificultadSecuenciacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/secuenciacion/:categoria/:dificultad"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <JuegoDeSecuenciacion /> : <Navigate to="/login" />
        }
      />
      
      {/* Ruta para ver resultados, solo accesible para jugadores */}
      <Route
        path="/cartas-memoria/resultados/:sessionId"
        element={estaAutenticado && rolUsuario === 'Jugador' ? <ResultadosCartas /> : <Navigate to="/login" />}
      />
      {/* Ruta para ver resultados, solo accesible para jugadores */}
      <Route
        path="/categorizacion/resultados/:sessionId"
        element={estaAutenticado && rolUsuario === 'Jugador' ? <ResultadosCategorizacion /> : <Navigate to="/login" />}
      />
      {/* Ruta para ver resultados, solo accesible para jugadores */}
      <Route
        path="/secuenciacion/resultados/:sessionId"
        element={estaAutenticado && rolUsuario === 'Jugador' ? <ResultadosSecuenciacion /> : <Navigate to="/login" />}
      />
      
      {/* Rutas de gestión, solo accesible para administradores */}
      <Route
        path="/gestion-usuarios"
        element={estaAutenticado && rolUsuario === 'Admin' ? <GestionUsuarios /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/nuevo"
        element={estaAutenticado && rolUsuario === 'Admin' ? <AgregarUsuario /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/:id/editar"
        element={estaAutenticado && rolUsuario === 'Admin' ? <FormularioUsuario /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/:id/asociar"
        element={estaAutenticado && rolUsuario === 'Admin' ? <AsociarJugadores /> : <Navigate to="/login" />}
      />
      
      {/* Rutas de análisis de datos, solo accesible para analistas */}
      <Route
        path="/analisis-datos"
        element={estaAutenticado && rolUsuario === 'Analista' ? <AnalisisDeDatos /> : <Navigate to="/login" />}
      />
      <Route
        path="/analisis-datos/:usuarioId/evaluaciones"
        element={estaAutenticado && rolUsuario === 'Analista' ? <SeleccionarJuegoAnalisis /> : <Navigate to="/login" />}
      />
      <Route
        path="/analisis-datos/:usuarioId/evaluaciones/:juego"
        element={estaAutenticado && rolUsuario === 'Analista' ? <EvaluacionUsuarios /> : <Navigate to="/login" />}
      />
      
      
    </Routes>
  );

  if (cargando) {
    // Muestra el estado de carga
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Header /> {/* Renderiza el componente de cabecera */}
      {renderizarRutas()} {/* Renderiza las rutas */}
    </Router>
  );
};

export default App;
