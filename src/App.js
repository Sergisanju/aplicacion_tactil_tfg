import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase-config';
import app from './firebase-config';
import Inicio from './components/Inicio/Inicio';
import Header from './components/Header/Header';
import SeleccionDeCategoria from './components/CartasMemoria/SeleccionCategoria';
import SeleccionDeNivel from './components/CartasMemoria/SeleccionNivel';
import SeleccionDeDificultad from './components/CartasMemoria/SeleccionDificultad';
import JuegoDeMemoria from './components/CartasMemoria/CartasMemoria';
import Login from './components/Login/Login';
import RestablecerContrasena from './components/Login/RestablecerContrasena';
import Perfil from './components/Perfil/Perfil';
import Registro from './components/Registro/Registro';
import Resultados from './components/CartasMemoria/Resultados';
import HistorialEvaluacion from './components/HistorialEvaluacion/HistorialEvaluacion';
import EvaluacionUsuarios from './components/AnalisisDeDatos/EvaluacionUsuarios';
import AnalisisDeDatos from './components/AnalisisDeDatos/AnalisisDeDatos';
import GestionUsuarios from './components/Gestion/GestionUsuarios';
import GestionJuegos from './components/Gestion/GestionJuegos';
import FormularioUsuario from './components/Gestion/FormularioUsuario';
import DetalleUsuario from './components/Gestion/DetalleUsuario';
import './App.css';
import JuegoDeCategorizacion from './components/Categorizacion/Categorizacion';
import SeleccionNivelCategorizacion from './components/Categorizacion/SeleccionNivel';
import SeleccionDificultadCategorizacion from './components/Categorizacion/SeleccionDificultad';
import JuegoDeSecuenciacion from './components/Secuenciacion/Secuenciacion';
import SeleccionCategoriaSecuenciacion from './components/Secuenciacion/SeleccionCategoria';
import SeleccionNivelSecuenciacion from './components/Secuenciacion/SeleccionNivel';
import SeleccionDificultadSecuenciacion from './components/Secuenciacion/SeleccionDificultad';

const AdvertenciaDeRol = ({ handleRoleWarningClose }) => {
  const navigate = useNavigate();

  const handleOkClick = () => {
    handleRoleWarningClose();
    navigate('/');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <p>No tienes el rol adecuado para acceder a esta sección. Debes ser jugador.</p>
        <button onClick={handleOkClick}>OK</button>
      </div>
    </div>
  );
};

const App = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [rolUsuario, setRolUsuario] = useState('');
  const [cargando, setCargando] = useState(true);
  const [, setMostrarAdvertenciaDeRol] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        const userDoc = await getDoc(doc(firestore, 'users', usuario.uid));
        if (userDoc.exists()) {
          setRolUsuario(userDoc.data().tipoUsuario);
        }
        setEstaAutenticado(true);
      } else {
        setEstaAutenticado(false);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleRoleWarningClose = () => {
    setMostrarAdvertenciaDeRol(false);
  };

  const renderizarRutas = () => (
    <Routes>
      <Route path="/" element={estaAutenticado ? <Inicio /> : <Navigate to="/login" />} />
      <Route path="/login" element={!estaAutenticado ? <Login /> : <Navigate to="/" />} />
      <Route path="/login/restablecer-contrasena" element={<RestablecerContrasena />} />
      <Route path="/registro" element={!estaAutenticado ? <Registro /> : <Navigate to="/" />} />
      <Route path="/perfil" element={estaAutenticado ? <Perfil /> : <Navigate to="/login" />} />
      <Route path="/historial-evaluacion" element={estaAutenticado ? <HistorialEvaluacion /> : <Navigate to="/login" />} />
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
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionNivelSecuenciacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/secuenciacion/:categoria/:nivel"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <SeleccionDificultadSecuenciacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/secuenciacion/:categoria/:nivel/:dificultad"
        element={
          estaAutenticado && rolUsuario === 'Jugador' ? <JuegoDeSecuenciacion /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/resultados/:sessionId"
        element={estaAutenticado && rolUsuario === 'Jugador' ? <Resultados /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios"
        element={estaAutenticado && rolUsuario === 'Admin' ? <GestionUsuarios /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-juegos"
        element={estaAutenticado && rolUsuario === 'Admin' ? <GestionJuegos /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/nuevo"
        element={estaAutenticado && rolUsuario === 'Admin' ? <FormularioUsuario /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/:id/editar"
        element={estaAutenticado && rolUsuario === 'Admin' ? <FormularioUsuario /> : <Navigate to="/login" />}
      />
      <Route
        path="/gestion-usuarios/:id"
        element={estaAutenticado && rolUsuario === 'Admin' ? <DetalleUsuario /> : <Navigate to="/login" />}
      />
      <Route
        path="/analisis-datos"
        element={estaAutenticado && rolUsuario === 'Analista' ? <AnalisisDeDatos /> : <Navigate to="/login" />}
      />
      <Route
        path="/analisis-datos/:usuarioId/evaluaciones"
        element={estaAutenticado && rolUsuario === 'Analista' ? <EvaluacionUsuarios /> : <Navigate to="/login" />}
      />
      <Route
        path="/role-warning"
        element={<AdvertenciaDeRol handleRoleWarningClose={handleRoleWarningClose} />}
      />
    </Routes>
  );

  if (cargando) {
    return <div>Cargando...</div>;
  }

  return (
    <Router>
      <Header />
      {renderizarRutas()}
    </Router>
  );
};

export default App;
