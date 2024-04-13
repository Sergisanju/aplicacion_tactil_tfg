import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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
          <Link to="/sign-out">Sign Out</Link>
          <div className="user-icon">USER</div> {/* Aquí iría tu ícono de usuario */}
        </div>
        {/* Incluye aquí tu ícono de ajustes si tienes uno */}
      </div>
    </header>
  );
};

export default Header;
