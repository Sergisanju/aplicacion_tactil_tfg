import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import homeIcon from '../../assets/images/home-icon.png';
import profileIcon from '../../assets/images/profile-icon.png';
import signOutIcon from '../../assets/images/signout-icon.png';
import loginIcon from '../../assets/images/login-icon.png'; // Icono para iniciar sesión

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false); // Estado para controlar el modal de cierre de sesión
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      console.log("Sign-out successful.");
      setIsAuthenticated(false); // Actualiza el estado de autenticación
      setShowSignOutModal(true); // Mostrar modal de cierre de sesión
    }).catch((error) => {
      console.error("Sign-out error:", error);
    });
  };

  const handleLoginClick = (e) => {
    if (isAuthenticated) {
      e.preventDefault();
      setShowWarning(true);
    }
  };

  const closeModal = () => {
    setShowWarning(false);
    setShowSignOutModal(false); // Cerrar modal de cierre de sesión
    if (!isAuthenticated) {
      navigate('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
    }
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>NombreAPP</h1>
      </div>
      <nav className="app-nav">
        <NavLink to="/" className="nav-item" activeclassname="active">
          <img src={homeIcon} alt="Inicio" className="nav-icon" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/login" className="nav-item" activeclassname="active" onClick={handleLoginClick}>
          <img src={loginIcon} alt="Iniciar Sesión" className="nav-icon" />
          <span>Iniciar Sesión</span>
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/profile" className="nav-item" activeclassname="active">
            <img src={profileIcon} alt="Perfil" className="nav-icon" />
            <span>Perfil</span>
          </NavLink>
        )}
        {isAuthenticated && (
          <button onClick={handleSignOut} className="nav-item sign-out-button">
            <img src={signOutIcon} alt="Salir" className="nav-icon" />
            <span>Salir</span>
          </button>
        )}
      </nav>
      {showWarning && (
        <div className="modal">
          <div className="modal-content">
            <p>Ya has iniciado sesión. No es necesario volver a iniciar sesión.</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
      {showSignOutModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Has cerrado sesión correctamente.</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
