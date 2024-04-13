import './firebase-config';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import MemoryGame from './components/MemoryGame/MemoryGame';
import CategorizationGame from './components/CategorizationGame/CategorizationGame';
import Login from './components/Login/Login'; // Asegúrate de tener este componente
import './App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/memory-game" element={
          isAuthenticated ? <MemoryGame /> : <Navigate to="/login" />
        } />
        <Route path="/categorization-game" element={
          isAuthenticated ? <CategorizationGame /> : <Navigate to="/login" />
        } />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
