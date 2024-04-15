// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './firebase-config'; // Importa la app de Firebase
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import CategorySelection from './components/MemoryGame/CategorySelection';
import LevelSelection from './components/MemoryGame/LevelSelection';
import MemoryGame from './components/MemoryGame/MemoryGame';
import CategorizationGame from './components/CategorizationGame/CategorizationGame';
import Login from './components/Login/Login';
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const auth = getAuth(app); // Usa la app de Firebase para obtener la instancia de autenticación

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe(); // Limpia el observador cuando el componente se desmonta
  }, [auth]);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/memory-game" element={isAuthenticated ? <CategorySelection /> : <Navigate to="/login" />} />
        <Route path="/memory-game/:category" element={isAuthenticated ? <LevelSelection /> : <Navigate to="/login" />} />
        <Route path="/memory-game/:category/:level" element={isAuthenticated ? <MemoryGame /> : <Navigate to="/login" />} />
        <Route path="/categorization-game" element={isAuthenticated ? <CategorizationGame /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
