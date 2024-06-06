import React from 'react';

const FormularioNuevoUsuario = ({ nuevoUsuario, setNuevoUsuario, manejarAgregarUsuario, onClose }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    manejarAgregarUsuario();
  };

  return (
    <div className="formulario-nuevo-usuario">
      <h2>Agregar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={nuevoUsuario.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={nuevoUsuario.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={nuevoUsuario.password}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="fechaNacimiento"
          value={nuevoUsuario.fechaNacimiento}
          onChange={handleChange}
          required
        />
        <select
          name="tipoUsuario"
          value={nuevoUsuario.tipoUsuario}
          onChange={handleChange}
        >
          <option value="Analista">Analista</option>
          <option value="Jugador">Jugador</option>
        </select>
        <button type="submit">Agregar Usuario</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default FormularioNuevoUsuario;
