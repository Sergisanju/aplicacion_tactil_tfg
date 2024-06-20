import React from 'react';
import { createRoot } from 'react-dom/client'; // Importa createRoot
import './index.css'; // Importa tus estilos
import App from './App'; // Importa tu componente principal

// Obtén el contenedor raíz del DOM
const container = document.getElementById('root');

// Crea una raíz con createRoot
const root = createRoot(container);

// Renderiza la aplicación dentro de la raíz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
