import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import MemoryGame from './components/MemoryGame/MemoryGame';
import CategorizationGame from './components/CategorizationGame/CategorizationGame';
import './App.css';

const App = () => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/memory-game" element={<MemoryGame />} />
          <Route path="/categorization-game" element={<CategorizationGame />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
