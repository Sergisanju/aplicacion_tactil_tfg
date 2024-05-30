import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase-config'; // Importa firestore desde tu configuración de Firebase
import app from './firebase-config'; // Importa la app de Firebase
import Inicio from './components/Inicio/Inicio';
import Header from './components/Header/Header';
import SeleccionDeCategoria from './components/CartasMemoria/SeleccionCategoria';
import SeleccionDeNivel from './components/CartasMemoria/SeleccionNivel';
import SeleccionDeDificultad from './components/CartasMemoria/SeleccionDificultad';
import JuegoDeMemoria from './components/CartasMemoria/CartasMemoria';
import Login from './components/Login/Login';
import Perfil from './components/Perfil/Perfil';
import Registro from './components/Registro/Registro';
import Resultados from './components/CartasMemoria/Resultados';
import HistorialEvaluacion from './components/HistorialEvaluacion/HistorialEvaluacion';
import './App.css';

// Componente para mostrar una advertencia de rol
const AdvertenciaDeRol = ({ handleRoleWarningClose }) => {
  const navigate = useNavigate();

  const handleOkClick = () => {
    handleRoleWarningClose();
    navigate('/'); // Redirige al inicio
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
    // Observador de estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (usuario) {
        // Obtener el rol del usuario desde Firestore
        const userDoc = await getDoc(doc(firestore, 'users', usuario.uid));
        if (userDoc.exists()) {
          setRolUsuario(userDoc.data().tipoUsuario); // Establece el rol del usuario
        }
        setEstaAutenticado(true); // Establece el estado de autenticación
      } else {
        setEstaAutenticado(false); // No autenticado
      }
      setCargando(false); // Finaliza la carga
    });

    return () => unsubscribe(); // Limpia el observador al desmontar el componente
  }, [auth]);

  const handleRoleWarningClose = () => {
    setMostrarAdvertenciaDeRol(false); // Cierra la advertencia de rol
  };

  // Función para renderizar las rutas
  const renderizarRutas = () => (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
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
        path="/resultados/:sessionId"
        element={estaAutenticado && rolUsuario === 'Jugador' ? <Resultados /> : <Navigate to="/login" />}
      />
      <Route
        path="/role-warning"
        element={<AdvertenciaDeRol handleRoleWarningClose={handleRoleWarningClose} />}
      />
    </Routes>
  );  

  if (cargando) {
    return <div>Cargando...</div>; // Muestra un mensaje de carga mientras se verifica la autenticación
  }

  return (
    <Router>
      <Header />
      {renderizarRutas()} {/* Renderiza las rutas definidas */}
    </Router>
  );
};

export default App;
