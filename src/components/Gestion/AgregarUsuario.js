import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgregarUsuario.css';

const AgregarUsuario = () => {
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    password: '',
    tipoUsuario: 'Analista',
    fechaNacimiento: ''
  });
  const [cargando, setCargando] = useState(false); // Estado para el indicador de carga
  const [mensajeModal, setMensajeModal] = useState(''); // Estado para el mensaje del modal
  const [mostrarModal, setMostrarModal] = useState(false); // Estado para mostrar el modal
  const navigate = useNavigate();

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true); // Iniciar el estado de carga
    setMensajeModal('Cargando...'); // Mostrar mensaje de carga en el modal
    setMostrarModal(true); // Mostrar el modal
    try {
      const { nombre, email, password, tipoUsuario, fechaNacimiento } = formulario;

      // Llamada a la función de Firebase para agregar el usuario
      const response = await fetch('https://us-central1-aplicacion-tactil-tfg.cloudfunctions.net/api/agregar-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password, tipoUsuario, fechaNacimiento }), // Envía los datos en el cuerpo de la solicitud
      });

      if (!response.ok) {
        const errorText = await response.text(); // Captura el texto de error de la respuesta
        throw new Error('Respuesta incorrecta: ' + errorText); // Lanza un error si la respuesta no es correcta
      }

      setMensajeModal('Usuario agregado correctamente'); // Cambiar el mensaje del modal
      setCargando(false); // Detener el estado de carga
    } catch (error) {
      console.error("Error agregando el usuario: ", error);
      setMensajeModal('Error agregando el usuario: ' + error.message); // Mostrar mensaje de error
      setCargando(false); // Detener el estado de carga
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    if (!cargando) {
      navigate('/gestion-usuarios'); // Redirige a la gestión de usuarios
    }
  };

  return (
    <div className="contenedor-agregar-usuario">
      <h1>Agregar Nuevo Usuario</h1>
      <form onSubmit={manejarEnvio}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formulario.email}
          onChange={manejarCambio}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={formulario.password}
          onChange={manejarCambio}
          required
        />
        <input
          type="date"
          name="fechaNacimiento"
          value={formulario.fechaNacimiento}
          onChange={manejarCambio}
          required
        />
        <select
          name="tipoUsuario"
          value={formulario.tipoUsuario}
          onChange={manejarCambio}
          required
        >
          <option value="Analista">Analista</option>
          <option value="Jugador">Jugador</option>
        </select>
        <button type="submit" disabled={cargando}>Agregar Usuario</button>
        <button type="button" onClick={() => navigate('/gestion-usuarios')}>Cancelar</button>
      </form>

      {/* Modal de carga y confirmación */}
      {mostrarModal && (
        <div className="modal">
          <div className="modal-contenido">
            <p>{mensajeModal}</p>
            {!cargando && <button onClick={cerrarModal}>Aceptar</button>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgregarUsuario;
