import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import homeIcon from '../../assets/images/home-icon.png';
import profileIcon from '../../assets/images/profile-icon.png';
import signOutIcon from '../../assets/images/signout-icon.png';
import loginIcon from '../../assets/images/login-icon.png'; // Icono para iniciar sesión

const Header = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
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
      // Opcionalmente, redireccionar al usuario o hacer otras acciones post-cierre de sesión
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
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>NombreAPP</h1>
      </div>
      <nav className="app-nav">
        <NavLink to="/" className="nav-item" activeClassName="active">
          <img src={homeIcon} alt="Inicio" className="nav-icon" />
          <span>Inicio</span>
        </NavLink>
        <NavLink to="/login" className="nav-item" activeClassName="active" onClick={handleLoginClick}>
          <img src={loginIcon} alt="Iniciar Sesión" className="nav-icon" />
          <span>Iniciar Sesión</span>
        </NavLink>
        <NavLink to="/profile" className="nav-item" activeClassName="active">
          <img src={profileIcon} alt="Perfil" className="nav-icon" />
          <span>Perfil</span>
        </NavLink>
        <button onClick={handleSignOut} className="nav-item sign-out-button">
          <img src={signOutIcon} alt="Salir" className="nav-icon" />
          <span>Salir</span>
        </button>
      </nav>
      {showWarning && (
        <div className="modal">
          <div className="modal-content">
            <p>Ya has iniciado sesión.</p>
            <button onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
