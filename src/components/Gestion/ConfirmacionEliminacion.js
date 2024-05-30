import React from 'react';
import './ConfirmacionEliminacion.css';

const ConfirmacionEliminacion = ({onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>¿Estás seguro de que deseas eliminar este usuario?</p>
        <button onClick={onClose}>Cancelar</button>
        <button onClick={onConfirm}>Eliminar</button>
      </div>
    </div>
  );
};

export default ConfirmacionEliminacion;
