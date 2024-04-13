import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { getAuth, signOut } from 'firebase/auth';

const Header = () => {
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("Sign-out successful.");
      // Opcionalmente, redireccionar al usuario o hacer otras acciones post-cierre de sesión
    }).catch((error) => {
      console.error("Sign-out error:", error);
    });
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>Bienvenido a NombreAPP</h1>
      </div>
      <div className="right-section">
        <nav className="app-nav">
          <Link to="/">Inicio</Link>
          <Link to="/info">Información</Link>
        </nav>
        <div className="user-area">
          {/* Usar un botón para el cierre de sesión */}
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
          <div className="user-icon">USER</div> {/* Aquí iría tu ícono de usuario */}
        </div>
        {/* Incluye aquí tu ícono de ajustes si tienes uno */}
      </div>
    </header>
  );
};

export default Header;
