import React, { useState, useEffect } from 'react'; // Importa React y los hooks useState y useEffect
import { NavLink, useNavigate } from 'react-router-dom'; // Importa NavLink para enlaces de navegación y useNavigate para navegación programática
import './Header.css'; // Importa los estilos CSS específicos para el componente Header
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'; // Importa funciones de autenticación de Firebase
import { getDoc, doc } from 'firebase/firestore'; // Importa funciones de Firestore para manejar documentos
import { firestore } from '../../firebase-config'; // Importa la configuración de Firestore
// Importa iconos para la barra de navegación
import inicioIcon from '../../assets/images/inicio-icon.png';
import perfilIcon from '../../assets/images/perfil-icon.png';
import signOutIcon from '../../assets/images/signout-icon.png';
import loginIcon from '../../assets/images/login-icon.png';
import historialEvaluacionIcon from '../../assets/images/historial-evaluacion-icon.png';
import usuariosIcon from '../../assets/images/usuarios-icon.png';
import analisisIcon from '../../assets/images/analisis-icon.png';
import gestionJuegosIcon from '../../assets/images/gestion-juegos-icon.png';

const Header = () => {
  // Estados locales
  const [estaAutenticado, setEstaAutenticado] = useState(false); // Estado para el estado de autenticación del usuario
  const [rolUsuario, setRolUsuario] = useState(''); // Estado para el rol del usuario autenticado
  const [mostrarModalCerrarSesion, setMostrarModalCerrarSesion] = useState(false); // Estado para mostrar modal de cierre de sesión
  const navigate = useNavigate(); // Hook para la navegación programática
  const auth = getAuth(); // Obtiene la instancia de autenticación de Firebase

  // useEffect para manejar el estado de autenticación y el rol del usuario
  useEffect(() => {
    // Configura el observador para cambios en el estado de autenticación
    const limpiaObservador = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Si el usuario está autenticado, obtiene su documento de Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          // Establece el rol del usuario en el estado
          setRolUsuario(userDoc.data().tipoUsuario);
        }
        // Marca el estado de autenticación como verdadero
        setEstaAutenticado(true);
      } else {
        // Si no hay usuario autenticado, restablece el estado
        setEstaAutenticado(false);
        setRolUsuario('');
      }
    });

    // Limpia el observador al desmontar el componente
    return () => limpiaObservador();
  }, [auth]);

  // Función para manejar el cierre de sesión
  const manejarCerrarSesion = () => {
    signOut(auth).then(() => {
      setEstaAutenticado(false); // Marca el estado de autenticación como falso
      setMostrarModalCerrarSesion(true); // Muestra el modal de cierre de sesión
    }).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  // Función para manejar el clic en el botón de login si el usuario ya está autenticado
  const manejarClickLogin = (e) => {
    if (estaAutenticado) {
      e.preventDefault(); // Previene la acción por defecto del enlace
    }
  };

  // Función para cerrar los modales
  const cerrarModal = () => {
    setMostrarModalCerrarSesion(false); // Cierra el modal de cierre de sesión
    if (!estaAutenticado) {
      navigate('/login'); // Navega a la página de login si el usuario no está autenticado
    }
  };

  return (
    <header className="app-header">
      <div className="app-title">
        <h1>TFG EVALUACIÓN COGNITIVA</h1> {/* Título de la aplicación */}
      </div>
      <nav className="app-nav">
        {/* Renderiza el enlace de inicio si el usuario está autenticado */}
        {estaAutenticado && (
          <NavLink to="/" className="nav-item" activeclassname="active">
            <img src={inicioIcon} alt="Inicio" className="nav-icon" />
            <span>Inicio</span>
          </NavLink>
        )}
        {/* Renderiza el enlace de historial de evaluación solo si el usuario es un Jugador */}
        {estaAutenticado && rolUsuario === 'Jugador' && (
          <NavLink to="/historial-evaluacion" className="nav-item" activeclassname="active">
            <img src={historialEvaluacionIcon} alt="Historial de Evaluación" className="nav-icon" />
            <span>Historial de Evaluación</span>
          </NavLink>
        )}
        {/* Renderiza el enlace de perfil si el usuario está autenticado */}
        {estaAutenticado && (
          <NavLink to="/perfil" className="nav-item" activeclassname="active">
            <img src={perfilIcon} alt="Perfil" className="nav-icon" />
            <span>Perfil</span>
          </NavLink>
        )}
        {/* Renderiza el enlace de análisis de datos solo si el usuario es un Analista */}
        {estaAutenticado && rolUsuario === 'Analista' && (
          <>
            <NavLink to="/analisis-datos" className="nav-item" activeclassname="active">
              <img src={analisisIcon} alt="Análisis de Datos" className="nav-icon" />
              <span>Análisis de Datos</span>
            </NavLink>
          </>
        )}
        {/* Renderiza los enlaces de gestión solo si el usuario es un Admin */}
        {estaAutenticado && rolUsuario === 'Admin' && (
          <>
            <NavLink to="/gestion-usuarios" className="nav-item" activeclassname="active">
              <img src={usuariosIcon} alt="Gestión de Usuarios" className="nav-icon" />
              <span>Gestión de Usuarios</span>
            </NavLink>
            <NavLink to="/gestion-juegos" className="nav-item" activeclassname="active">
              <img src={gestionJuegosIcon} alt="Gestión de Juegos" className="nav-icon" />
              <span>Gestión de Juegos</span>
            </NavLink>
          </>
        )}
        {/* Renderiza el botón de cerrar sesión si el usuario está autenticado */}
        {estaAutenticado ? (
          <button onClick={manejarCerrarSesion} className="nav-item sign-out-button">
            <img src={signOutIcon} alt="Salir" className="nav-icon" />
            <span>Salir</span>
          </button>
        ) : (
          <NavLink to="/login" className="nav-item" activeclassname="active" onClick={manejarClickLogin}>
            <img src={loginIcon} alt="Iniciar Sesión" className="nav-icon" />
            <span>Iniciar Sesión</span>
          </NavLink>
        )}
      </nav>
      {/* Renderiza el modal de cierre de sesión si la sesión se ha cerrado exitosamente */}
      {mostrarModalCerrarSesion && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Has cerrado sesión correctamente.</p>
            <button onClick={cerrarModal}>OK</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
