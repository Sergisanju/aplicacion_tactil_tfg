import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import inicioIcon from '../../assets/images/inicio-icon.png';
import perfilIcon from '../../assets/images/perfil-icon.png';
import signOutIcon from '../../assets/images/signout-icon.png';
import loginIcon from '../../assets/images/login-icon.png'; 
import historialEvaluacionIcon from '../../assets/images/historial-evaluacion-icon.png';

const Header = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false); // Estado para la autenticación del usuario
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false); // Estado para mostrar advertencias
  const [mostrarModalCerrarSesion, setMostrarModalCerrarSesion] = useState(false); // Estado para mostrar el modal de cierre de sesión
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    // Suscripción al cambio de estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, user => {
      setEstaAutenticado(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const manejarCerrarSesion = () => {
    signOut(auth).then(() => {
      console.log("Cierre de sesión exitoso.");
      setEstaAutenticado(false); // Actualiza el estado de autenticación
      setMostrarModalCerrarSesion(true); // Mostrar modal de cierre de sesión
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  const manejarClickLogin = (e) => {
    if (estaAutenticado) {
      e.preventDefault();
      setMostrarAdvertencia(true);
    }
  };

  const cerrarModal = () => {
    setMostrarAdvertencia(false);
    setMostrarModalCerrarSesion(false); // Cerrar modal de cierre de sesión
    if (!estaAutenticado) {
      navigate('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
    }
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>TFG EVALUACIÓN COGNITIVA</h1>
      </div>
      <nav className="app-nav">
        <NavLink to="/" className="nav-item" activeclassname="active">
          <img src={inicioIcon} alt="Inicio" className="nav-icon" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/login" className="nav-item" activeclassname="active" onClick={manejarClickLogin}>
          <img src={loginIcon} alt="Iniciar Sesión" className="nav-icon" />
          <span>Iniciar Sesión</span>
        </NavLink>
        {estaAutenticado && (
          <NavLink to="/historial-evaluacion" className="nav-item" activeclassname="active">
            <img src={historialEvaluacionIcon} alt="Historial de Evaluación" className="nav-icon" />
            <span>Historial de Evaluación</span>
          </NavLink>
        )}
        {estaAutenticado && (
          <NavLink to="/perfil" className="nav-item" activeclassname="active">
            <img src={perfilIcon} alt="Perfil" className="nav-icon" />
            <span>Perfil</span>
          </NavLink>
        )}
        {estaAutenticado && (
          <button onClick={manejarCerrarSesion} className="nav-item sign-out-button">
            <img src={signOutIcon} alt="Salir" className="nav-icon" />
            <span>Salir</span>
          </button>
        )}
      </nav>
      {mostrarAdvertencia && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Ya has iniciado sesión. No es necesario volver a iniciar sesión.</p>
            <button onClick={cerrarModal}>OK</button>
          </div>
        </div>
      )}
      {mostrarModalCerrarSesion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Has cerrado sesión correctamente.</p>
            <button onClick={cerrarModal}>OK</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
