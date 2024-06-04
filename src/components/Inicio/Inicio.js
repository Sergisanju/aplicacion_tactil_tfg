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
  const [rolUsuario, setRolUsuario] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          setRolUsuario(userDoc.data().tipoUsuario);
        }
      }
    };

    fetchUserRole();
  }, [auth]);

  return (
    <div className="contenedor-inicio">
      <div className="contenedor-titulo-inicio">
        <h1>Elige tu juego</h1>
      </div>
      <div className="seleccion-juego-inicio">
        <div className="carta-juego-inicio">
          <img src={cartasmemoriaIcono} alt="Cartas de memoria" />
          {rolUsuario === 'Jugador' ? (
            <Link to="/cartas-memoria"><button>Cartas de memoria</button></Link>
          ) : (
            <button disabled>Cartas de memoria</button>
          )}
        </div>
        <div className="carta-juego-inicio">
          <img src={categorizacionIcono} alt="Categorización" />
          {rolUsuario === 'Jugador' ? (
            <Link to="/categorizacion"><button>Categorización</button></Link>
          ) : (
            <button disabled>Categorización</button>
          )}
        </div>
        <div className="carta-juego-inicio">
          <img src={secuenciacionIcono} alt="Categorización" />
          {rolUsuario === 'Jugador' ? (
            <Link to="/secuenciacion"><button>Secuenciación</button></Link>
          ) : (
            <button disabled>Secuenciación</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inicio;
