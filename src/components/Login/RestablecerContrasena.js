import React, { useState } from 'react'; 
import { sendPasswordResetEmail } from 'firebase/auth'; 
import { auth } from '../../firebase-config'; 
import './RestablecerContrasena.css'; 

const RestablecerContrasena = () => {
  const [email, setEmail] = useState(''); // Almacena el email ingresado por el usuario
  const [message, setMessage] = useState(''); // Almacena el mensaje de éxito
  const [error, setError] = useState(''); // Almacena el mensaje de error

  // Función para manejar el envío del formulario de restablecimiento de contraseña
  const handlePasswordReset = async (e) => {
    e.preventDefault(); // Previene la acción por defecto del formulario

    try {
      // Envía un correo de restablecimiento de contraseña utilizando Firebase Auth
      await sendPasswordResetEmail(auth, email); 
      // Si el envío es exitoso, establece el mensaje de éxito y resetea el campo de email
      setMessage('Correo de restablecimiento de contraseña enviado. Por favor, revisa tu bandeja de entrada.');
      setEmail(''); // Limpia el campo de email
      setError(''); // Limpia el mensaje de error
    } catch (error) {
      // Si ocurre un error, establece el mensaje de error
      setMessage(''); // Limpia el mensaje de éxito
      setError('Error al enviar el correo de restablecimiento de contraseña. Verifica tu correo electrónico.');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Restablecer Contraseña</h2> {/* Título del formulario */}
        {message && <p className="message">{message}</p>} {/* Muestra el mensaje de éxito si existe */}
        {error && <p className="error">{error}</p>} {/* Muestra el mensaje de error si existe */}
        <form onSubmit={handlePasswordReset}>
          <div>
            <label>Email</label> {/* Etiqueta para el campo de email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            /> {/* Campo de entrada de email */}
          </div>
          <button type="submit" className="reset-button">Enviar Correo de Restablecimiento</button> {/* Botón para enviar el formulario */}
        </form>
      </div>
    </div>
  );
};

export default RestablecerContrasena;
