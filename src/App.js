import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from './firebase-config'; // Importa la app de Firebase
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import CategorySelection from './components/MemoryGame/CategorySelection';
import LevelSelection from './components/MemoryGame/LevelSelection';
import DifficultySelection from './components/MemoryGame/DifficultySelection';
import MemoryGame from './components/MemoryGame/MemoryGame';
import CategorizationGame from './components/CategorizationGame/CategorizationGame';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import Register from './components/Register/Register'; // Importa el componente Register
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'; // Importa ProtectedRoute
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe(); // Devuelve una función para limpiar el efecto
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>; // Muestra un indicador de carga mientras se verifica la autenticación
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Define la ruta del registro */}
        <Route
          path="/profile"
          element={
            isAuthenticated ? <Profile /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/memory-game"
          element={
            <ProtectedRoute roles={['Jugador']} element={CategorySelection} />
          }
        />
        <Route
          path="/memory-game/:category"
          element={
            <ProtectedRoute roles={['Jugador']} element={LevelSelection} />
          }
        />
        <Route
          path="/memory-game/:category/:level/difficulty"
          element={
            <ProtectedRoute roles={['Jugador']} element={DifficultySelection} />
          }
        />
        <Route
          path="/memory-game/:category/:level/:difficulty/game"
          element={
            <ProtectedRoute roles={['Jugador']} element={MemoryGame} />
          }
        />
        <Route
          path="/categorization-game"
          element={
            <ProtectedRoute roles={['Jugador']} element={CategorizationGame} />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
