import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase-config';
import './Login.css';
import verIcon from '../../assets/images/ver.png';
import noVerIcon from '../../assets/images/nover.png';
import googleIcon from '../../assets/images/google-icon.png'; // Asegúrate de tener un ícono de Google en esta ruta

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirigir a la página principal después del inicio de sesión
    } catch (error) {
      setError("Correo electrónico o contraseña incorrectos");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Verificar si el usuario está registrado en Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        // Si no está registrado, cerrar sesión y mostrar error
        await auth.signOut();
        setError("Usuario no registrado. Por favor, regístrese primero.");
      } else {
        // Si está registrado, redirigir a la página principal
        navigate('/');
      }
    } catch (error) {
      setError("Error al iniciar sesión con Google");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="password-container">
            <label>Contraseña</label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-icon">
              <img src={passwordVisible ? noVerIcon : verIcon} alt="Toggle visibility" />
            </span>
          </div>
          <button type="submit" className="login-button">Iniciar Sesión</button>
        </form>
        <button onClick={handleGoogleLogin} className="google-login-button">
          <img src={googleIcon} alt="Google icon" className="google-icon" />
          Continuar con Google
        </button>
        <div className="login-footer">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate</Link>.</p>
          <p><Link to="/forgot-password">¿Olvidaste tu contraseña?</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
