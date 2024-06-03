import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase-config';
import './RestablecerContrasena.css';

const RestablecerContrasena = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Correo de restablecimiento de contraseña enviado. Por favor, revisa tu bandeja de entrada.');
      setEmail('');
      setError('');
    } catch (error) {
      setMessage('');
      setError('Error al enviar el correo de restablecimiento de contraseña. Verifica tu correo electrónico.');
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-box">
        <h2>Restablecer Contraseña</h2>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handlePasswordReset}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="reset-button">Enviar Correo de Restablecimiento</button>
        </form>
      </div>
    </div>
  );
};

export default RestablecerContrasena;
