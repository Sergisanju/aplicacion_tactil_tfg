import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, firestore } from '../../firebase-config';
import './Register.css';
import verIcon from '../../assets/images/ver.png';
import noVerIcon from '../../assets/images/nover.png';

const Register = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !dob || !email || !password || !confirmPassword || !userType) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!validatePassword(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números");
      return;
    }

    try {
      // Verificar si el email ya está registrado
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError("El usuario ya está registrado");
        return;
      }

      // Registrar al nuevo usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, "users", user.uid), {
        name,
        dob,
        email,
        userType
      });

      // Cerrar sesión inmediatamente después del registro
      await signOut(auth);

      // Mostrar alerta de bienvenida
      alert("Registro exitoso. ¡Bienvenido!");

      // Redirigir a la página de inicio de sesión
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrar</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegister}>
          <div>
            <label>Nombre y Apellidos</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
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
          <div className="password-container">
            <label>Repetir Contraseña</label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span onClick={togglePasswordVisibility} className="password-toggle-icon">
              <img src={passwordVisible ? noVerIcon : verIcon} alt="Toggle visibility" />
            </span>
          </div>
          {error && password !== confirmPassword && (
            <p className="error">{error}</p>
          )}
          <div>
            <label>Tipo de Usuario</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
            >
              <option value="">Selecciona un tipo de usuario</option>
              <option value="Analista">Analista</option>
              <option value="Jugador">Jugador</option>
            </select>
          </div>
          <button type="submit" className="register-button">Registrar</button>
        </form>
        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
