import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from './firebase-config'; // Importa firestore desde tu configuración de Firebase
import app from './firebase-config'; // Importa la app de Firebase
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import SeleccionDeCategoria from './components/MemoryGame/CategorySelection';
import SeleccionDeNivel from './components/MemoryGame/LevelSelection';
import SeleccionDeDificultad from './components/MemoryGame/DifficultySelection';
import JuegoDeMemoria from './components/MemoryGame/MemoryGame';
import Login from './components/Login/Login';
import Profile from './components/Profile/Profile';
import Register from './components/Register/Register';
import './App.css';

const RoleWarning = ({ handleRoleWarningClose }) => {
  const navigate = useNavigate();

  const handleOkClick = () => {
    handleRoleWarningClose();
    navigate('/');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <p>No tienes el rol adecuado para acceder a esta sección. Debes ser jugador.</p>
        <button onClick={handleOkClick}>OK</button>
      </div>
    </div>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRoleWarning, setShowRoleWarning] = useState(false);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user role from Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().userType);
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const handleRoleWarningClose = () => {
    setShowRoleWarning(false);
  };

  const renderRoutes = () => (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route
        path="/memory-game"
        element={
          isAuthenticated
            ? (userRole === 'Jugador' ? <SeleccionDeCategoria /> : <Navigate to="/role-warning" />)
            : <Navigate to="/login" />
        }
      />
      <Route
        path="/memory-game/:categoria"
        element={
          isAuthenticated && userRole === 'Jugador' ? <SeleccionDeNivel /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/memory-game/:categoria/:nivel"
        element={
          isAuthenticated && userRole === 'Jugador' ? <SeleccionDeDificultad /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/memory-game/:categoria/:nivel/:dificultad"
        element={
          isAuthenticated && userRole === 'Jugador' ? <JuegoDeMemoria /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/role-warning"
        element={<RoleWarning handleRoleWarningClose={handleRoleWarningClose} />}
      />
    </Routes>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header />
      {renderRoutes()}
    </Router>
  );
};

export default App;
