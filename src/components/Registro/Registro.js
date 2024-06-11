import React, { useState } from 'react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'; // Importa funciones de autenticación de Firebase
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore'; // Importa funciones de Firestore para manejar documentos
import { auth, firestore } from '../../firebase-config'; // Importa configuraciones de autenticación y Firestore
import './Registro.css'; 
import verIcon from '../../assets/images/ver.png'; // Importa el icono para mostrar la contraseña
import noVerIcon from '../../assets/images/nover.png'; // Importa el icono para ocultar la contraseña

const Registro = () => {
  // Estados locales para manejar los datos del formulario y otros estados
  const [nombre, setNombre] = useState(''); // Almacena el nombre y apellidos del usuario
  const [fechaNacimiento, setFechaNacimiento] = useState(''); // Almacena la fecha de nacimiento del usuario
  const [email, setEmail] = useState(''); // Almacena el email del usuario
  const [contraseña, setContraseña] = useState(''); // Almacena la contraseña del usuario
  const [confirmarContraseña, setConfirmarContraseña] = useState(''); // Almacena la confirmación de la contraseña
  const [tipoUsuario, setTipoUsuario] = useState(''); // Almacena el tipo de usuario (Analista o Jugador)
  const [error, setError] = useState(''); // Almacena mensajes de error
  const [contraseñaVisible, setContraseñaVisible] = useState(false); // Controla la visibilidad de la contraseña
  const navigate = useNavigate(); // Hook para navegación programática

  // Función para validar la seguridad de la contraseña
  const validarContraseña = (contraseña) => {
    const minLength = 8; // Longitud mínima de la contraseña
    const hasUpperCase = /[A-Z]/.test(contraseña); // Verifica si contiene al menos una mayúscula
    const hasLowerCase = /[a-z]/.test(contraseña); // Verifica si contiene al menos una minúscula
    const hasNumber = /[0-9]/.test(contraseña); // Verifica si contiene al menos un número

    return contraseña.length >= minLength && hasUpperCase && hasLowerCase && hasNumber; // Devuelve verdadero si cumple todos los requisitos
  };

  // Función para manejar el proceso de registro
  const handleRegistrar = async (e) => {
    e.preventDefault(); // Previene la acción por defecto del formulario

    // Verificación de campos requeridos
    if (!nombre || !fechaNacimiento || !email || !contraseña || !confirmarContraseña || !tipoUsuario) {
      setError("Todos los campos son obligatorios"); // Establece un mensaje de error
      return; 
    }

    // Verificación de coincidencia de contraseñas
    if (contraseña !== confirmarContraseña) {
      setError("Las contraseñas no coinciden"); // Establece un mensaje de error
      return; 
    }

    // Validación de seguridad de la contraseña
    if (!validarContraseña(contraseña)) {
      setError("La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números"); // Establece un mensaje de error
      return; 
    }

    try {
      // Verificar si el email ya está registrado
      const usersRef = collection(firestore, "users"); // Referencia a la colección de usuarios en Firestore
      const q = query(usersRef, where("email", "==", email)); // Consulta para buscar el email en la colección
      const querySnapshot = await getDocs(q); // Ejecuta la consulta
      if (!querySnapshot.empty) {
        setError("El usuario ya está registrado"); // Establece un mensaje de error si el email ya existe
        return; 
      }

      // Registrar al nuevo usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, contraseña); // Crea el usuario en Firebase Auth
      const user = userCredential.user; // Obtiene el usuario creado

      // Crear documento de usuario en Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        nombre,
        fechaNacimiento,
        email,
        tipoUsuario,
        aprobado: tipoUsuario !== 'Analista', // Aprobado automáticamente si no es analista
        asociados: tipoUsuario === 'Analista' ? [] : null // Lista vacía para el analista, null para otros
      });

      // Cerrar sesión inmediatamente después del registro
      await signOut(auth); // Cierra la sesión del usuario recién registrado

      // Redirigir a la página de inicio de sesión
      navigate('/login'); 
    } catch (error) {
      setError(error.message); 
    }
  };

  // Función para alternar la visibilidad de la contraseña
  const toggleContraseñaVisibilidad = () => {
    setContraseñaVisible(!contraseñaVisible); // Alterna entre mostrar y ocultar la contraseña
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registrar</h2> {/* Título del formulario */}
        {error && <p className="error">{error}</p>} {/* Muestra mensajes de error si los hay */}
        <form onSubmit={handleRegistrar}>
          {/* Campo de nombre y apellidos */}
          <div>
            <label>Nombre y Apellidos</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>
          {/* Campo de fecha de nacimiento */}
          <div>
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              required
            />
          </div>
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
              type={contraseñaVisible ? "text" : "password"}
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <span onClick={toggleContraseñaVisibilidad} className="password-toggle-icon">
              <img src={contraseñaVisible ? noVerIcon : verIcon} alt="Toggle visibility" />
            </span>
          </div>
          {/* Campo de confirmación de contraseña con visibilidad alternable */}
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
          {/* Campo para seleccionar el tipo de usuario */}
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
          <button type="submit" className="register-button">Registrar</button> {/* Botón para enviar el formulario */}
        </form>
        {/* Pie de página con enlace a la página de inicio de sesión */}
        <div className="register-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Inicia Sesión</Link>.</p> {/* Enlace a la página de inicio de sesión */}
        </div>
      </div>
    </div>
  );
};

export default Registro;
