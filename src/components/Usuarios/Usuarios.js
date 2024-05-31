import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './Usuarios.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        if (!usuarioActual) {
          setError('Usuario no autenticado');
          return;
        }

        const analistaDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
        if (!analistaDoc.exists()) {
          setError('No se encontró el documento del usuario analista');
          return;
        }

        const asociados = analistaDoc.data().asociados || [];
        if (asociados.length === 0) {
          setError('No hay usuarios asociados');
          return;
        }

        const usuariosQuery = query(collection(firestore, 'users'), where('uid', 'in', asociados));
        const usuariosSnapshot = await getDocs(usuariosQuery);
        const listaUsuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsuarios(listaUsuarios);
      } catch (error) {
        setError('Error al obtener los usuarios asociados');
        console.error(error);
      }
    };

    obtenerUsuarios();
  }, [firestore, usuarioActual]);

  return (
    <div className="analista-usuarios-container">
      <h1>Usuarios Asociados</h1>
      {error && <p className="error">{error}</p>}
      <div className="lista-usuarios">
        {usuarios.map(usuario => (
          <div key={usuario.id} className="usuario-item">
            <p>{usuario.nombre}</p>
            <Link to={`/analista-usuarios/${usuario.id}/evaluaciones`} className="boton-ver-evaluaciones">Ver Evaluaciones</Link>
            <button onClick={() => exportarDatos(usuario.id)} className="boton-exportar-datos">Exportar Datos</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const exportarDatos = (usuarioId) => {
  // Implementar la lógica para exportar los datos del usuario
  console.log(`Exportar datos para el usuario: ${usuarioId}`);
};

export default Usuarios;
