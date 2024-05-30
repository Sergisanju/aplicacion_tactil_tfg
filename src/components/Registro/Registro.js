import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { auth, firestore } from '../../firebase-config';
import './Registro.css';
import verIcon from '../../assets/images/ver.png';
import noVerIcon from '../../assets/images/nover.png';

const Registro = () => {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const [error, setError] = useState('');
  const [contraseñaVisible, setContraseñaVisible] = useState(false);
  const navigate = useNavigate();

  const validarContraseña = (contraseña) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(contraseña);
    const hasLowerCase = /[a-z]/.test(contraseña);
    const hasNumber = /[0-9]/.test(contraseña);

    return contraseña.length >= minLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleRegistrar = async (e) => {
    e.preventDefault();
    if (!nombre || !fechaNacimiento || !email || !contraseña || !confirmarContraseña || !tipoUsuario) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (contraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!validarContraseña(contraseña)) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, contraseña);
      const user = userCredential.user;
      await setDoc(doc(firestore, "users", user.uid), {
        nombre,
        fechaNacimiento,
        email,
        tipoUsuario,
        aprobado: tipoUsuario !== 'Analista' // Aprobado automáticamente si no es analista
      });

      // Cerrar sesión inmediatamente después del registro
      await signOut(auth);

      // Redirigir a la página de inicio de sesión
      navigate('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleContraseñaVisibilidad = () => {
    setContraseñaVisible(!contraseñaVisible);
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrar</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleRegistrar}>
          <div>
            <label>Nombre y Apellidos</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
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
              type={contraseñaVisible ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <span onClick={toggleContraseñaVisibilidad} className="password-toggle-icon">
              <img src={contraseñaVisible ? noVerIcon : verIcon} alt="Toggle visibility" />
            </span>
          </div>
          <div className="password-container">
            <label>Repetir Contraseña</label>
            <input
              type={contraseñaVisible ? "text" : "password"}
              value={confirmarContraseña}
              onChange={(e) => setConfirmarContraseña(e.target.value)}
              required
            />
            <span onClick={toggleContraseñaVisibilidad} className="password-toggle-icon">
              <img src={contraseñaVisible ? noVerIcon : verIcon} alt="Toggle visibility" />
            </span>
          </div>
          {error && contraseña !== confirmarContraseña && (
            <p className="error">{error}</p>
          )}
          <div>
            <label>Tipo de Usuario</label>
            <select
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
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

export default Registro;
