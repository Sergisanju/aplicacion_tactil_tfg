import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Inicio.css';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import cartasmemoriaIcono from '../../assets/images/cartas-memoria-icono.png';
import categorizacionIcono from '../../assets/images/categorizacion-juego-icono.png';
import secuenciacionIcono from '../../assets/images/secuenciacion-juego-icono.png';

const Inicio = () => {
  // Estado para almacenar el rol del usuario
  const [rolUsuario, setRolUsuario] = useState('');
  // Instancia de autenticación de Firebase
  const auth = getAuth();

  useEffect(() => {
    //Para obtener el rol del usuario
    const fetchUserRole = async () => {
      // Obtiene el usuario autenticado actualmente
      const user = auth.currentUser;
      if (user) { // Si hay un usuario autenticado
        // Obtiene el documento del usuario desde Firestore usando el uid del usuario
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) { // Verifica si el documento del usuario existe
          // Actualiza el estado con el rol del usuario
          setRolUsuario(userDoc.data().tipoUsuario);
        }
      }
    };

    fetchUserRole();
  }, [auth]); 

  return (
    <div className="contenedor-inicio"> {/* Contenedor principal */}
      <div className="contenedor-titulo-inicio"> {/* Contenedor para el título */}
        <h1>Elige tu juego</h1> 
      </div>
      <div className="seleccion-juego-inicio"> {/* Contenedor para la selección de juegos */}
        {/* Cada sección representa un juego */}
        <div className="carta-juego-inicio">
          {/* Imagen del juego de cartas de memoria */}
          <img src={cartasmemoriaIcono} alt="Cartas de memoria" />
          {/* Si el rol del usuario es 'Jugador', muestra un botón habilitado con enlace */}
          {rolUsuario === 'Jugador' ? (
            <Link to="/cartas-memoria"><button>Cartas de memoria</button></Link>
          ) : (
            // Si no, muestra un botón deshabilitado
            <button disabled>Cartas de memoria</button>
          )}
        </div>
        <div className="carta-juego-inicio">
          {/* Imagen del juego de categorización */}
          <img src={categorizacionIcono} alt="Categorización" />
          {/* Si el rol del usuario es 'Jugador', muestra un botón habilitado con enlace */}
          {rolUsuario === 'Jugador' ? (
            <Link to="/categorizacion"><button>Categorización</button></Link>
          ) : (
            // Si no, muestra un botón deshabilitado
            <button disabled>Categorización</button>
          )}
        </div>
        <div className="carta-juego-inicio">
          {/* Imagen del juego de secuenciación */}
          <img src={secuenciacionIcono} alt="Secuenciación" />
          {/* Si el rol del usuario es 'Jugador', muestra un botón habilitado con enlace */}
          {rolUsuario === 'Jugador' ? (
            <Link to="/secuenciacion"><button>Secuenciación</button></Link>
          ) : (
            // Si no, muestra un botón deshabilitado
            <button disabled>Secuenciación</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inicio; 