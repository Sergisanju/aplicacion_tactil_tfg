import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import inicioIcon from '../../assets/images/inicio-icon.png';
import perfilIcon from '../../assets/images/perfil-icon.png';
import signOutIcon from '../../assets/images/signout-icon.png';
import loginIcon from '../../assets/images/login-icon.png';
import historialEvaluacionIcon from '../../assets/images/historial-evaluacion-icon.png';
import usuariosIcon from '../../assets/images/usuarios-icon.png';
import analisisIcon from '../../assets/images/analisis-icon.png';
import gestionJuegosIcon from '../../assets/images/gestion-juegos-icon.png';

const Header = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [rolUsuario, setRolUsuario] = useState('');
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [mostrarModalCerrarSesion, setMostrarModalCerrarSesion] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setRolUsuario(userDoc.data().tipoUsuario);
        }
        setEstaAutenticado(true);
      } else {
        setEstaAutenticado(false);
        setRolUsuario('');
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const manejarCerrarSesion = () => {
    signOut(auth).then(() => {
      console.log("Cierre de sesión exitoso.");
      setEstaAutenticado(false);
      setMostrarModalCerrarSesion(true);
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
    setMostrarModalCerrarSesion(false);
    if (!estaAutenticado) {
      navigate('/login');
    }
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>TFG EVALUACIÓN COGNITIVA</h1>
      </div>
      <nav className="app-nav">
        {estaAutenticado && (
          <NavLink to="/" className="nav-item" activeclassname="active">
            <img src={inicioIcon} alt="Inicio" className="nav-icon" />
            <span>Inicio</span>
          </NavLink>
        )}
        {estaAutenticado && rolUsuario === 'Jugador' && (
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
        {estaAutenticado && rolUsuario === 'Analista' && (
          <>
            <NavLink to="/analisis-datos" className="nav-item" activeclassname="active">
              <img src={analisisIcon} alt="Análisis de Datos" className="nav-icon" />
              <span>Análisis de Datos</span>
            </NavLink>
          </>
        )}
        {estaAutenticado && rolUsuario === 'Admin' && (
          <>
            <NavLink to="/gestion-usuarios" className="nav-item" activeclassname="active">
              <img src={usuariosIcon} alt="Gestión de Usuarios" className="nav-icon" />
              <span>Gestión de Usuarios</span>
            </NavLink>
            <NavLink to="/gestion-juegos" className="nav-item" activeclassname="active">
              <img src={gestionJuegosIcon} alt="Gestión de Juegos" className="nav-icon" />
              <span>Gestión de Juegos</span>
            </NavLink>
          </>
        )}
        {estaAutenticado ? (
          <button onClick={manejarCerrarSesion} className="nav-item sign-out-button">
            <img src={signOutIcon} alt="Salir" className="nav-icon" />
            <span>Salir</span>
          </button>
        ) : (
          <NavLink to="/login" className="nav-item" activeclassname="active" onClick={manejarClickLogin}>
            <img src={loginIcon} alt="Iniciar Sesión" className="nav-icon" />
            <span>Iniciar Sesión</span>
          </NavLink>
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
