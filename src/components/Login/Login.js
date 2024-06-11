import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { auth, firestore } from '../../firebase-config';
import './Login.css';
import verIcon from '../../assets/images/ver.png';
import noVerIcon from '../../assets/images/nover.png';
import googleIcon from '../../assets/images/google-icon.png'; 

const Login = () => {
  // Estados locales para manejar los datos del formulario y otros estados
  const [email, setEmail] = useState(''); // Almacena el email ingresado por el usuario
  const [password, setPassword] = useState(''); // Almacena la contraseña ingresada por el usuario
  const [error, setError] = useState(''); // Almacena mensajes de error
  const [passwordVisible, setPasswordVisible] = useState(false); // Controla la visibilidad de la contraseña
  const navigate = useNavigate(); // Hook para navegación programática

  // Función para manejar el inicio de sesión con email y contraseña
  const handleLogin = async (e) => {
    e.preventDefault(); // Previene la acción por defecto del formulario

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password); // Inicia sesión con email y contraseña
      const user = userCredential.user; // Obtiene el usuario autenticado

      // Verificar si el usuario está registrado en Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.tipoUsuario === 'Analista' && !userData.aprobado) {
          // Si el usuario es un analista no aprobado, cerrar sesión y mostrar error
          await auth.signOut();
          setError("El usuario analista debe ser aprobado por un administrador.");
        } else {
          // Si el usuario está aprobado o no es analista, redirigir a la página principal
          navigate('/');
        }
      } else {
        setError("Usuario no registrado. Por favor, regístrese primero.");
      }
    } catch (error) {
      setError("Correo electrónico o contraseña incorrectos");
    }
  };

  // Función para manejar el inicio de sesión con Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider(); // Crea un nuevo proveedor de autenticación de Google
    try {
      const result = await signInWithPopup(auth, provider); // Inicia sesión con Google
      const user = result.user; // Obtiene el usuario autenticado

      // Verificar si el usuario está registrado en Firestore
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (!userDoc.exists()) {
        // Si no está registrado, cerrar sesión y mostrar error
        await auth.signOut();
        setError("Usuario no registrado. Por favor, regístrese primero.");
      } else {
        const userData = userDoc.data();
        if (userData.tipoUsuario === 'Analista' && !userData.aprobado) {
          // Si el usuario es un analista no aprobado, cerrar sesión y mostrar error
          await auth.signOut();
          setError("El usuario analista debe ser aprobado por un administrador.");
        } else {
          // Si el usuario está aprobado o no es analista, redirigir a la página principal
          navigate('/');
        }
      }
    } catch (error) {
      setError("Error al iniciar sesión con Google");
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible); // Alterna entre mostrar y ocultar la contraseña
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Iniciar Sesión</h2> {/* Título del formulario */}
        {error && <p className="error">{error}</p>} {/* Muestra mensajes de error si existen */}
        <form onSubmit={handleLogin}>
          {/* Campo de email */}
          <div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {/* Campo de contraseña con visibilidad alternable */}
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
          <button type="submit" className="login-button">Iniciar Sesión</button> {/* Botón para enviar el formulario */}
        </form>
        <button onClick={handleGoogleLogin} className="google-login-button">
          <img src={googleIcon} alt="Google icon" className="google-icon" />
          Continuar con Google {/* Botón para iniciar sesión con Google */}
        </button>
        <div className="login-footer">
          <p>¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>.</p> {/* Enlace a la página de registro */}
          <p><Link to="/login/restablecer-contrasena">¿Olvidaste tu contraseña?</Link></p> {/* Enlace a la página de restablecimiento de contraseña */}
        </div>
      </div>
    </div>
  );
};

export default Login;