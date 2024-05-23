import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

  const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (loading) {
      return <div>Loading...</div>; // Puedes mostrar un spinner u otro indicador de carga
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} />;
    }

    return children;
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory-game"
          element={
            <ProtectedRoute>
              <CategorySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory-game/:category"
          element={
            <ProtectedRoute>
              <LevelSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory-game/:category/:level/difficulty"
          element={
            <ProtectedRoute>
              <DifficultySelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/memory-game/:category/:level/:difficulty/game"
          element={
            <ProtectedRoute>
              <MemoryGame />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categorization-game"
          element={
            <ProtectedRoute>
              <CategorizationGame />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
