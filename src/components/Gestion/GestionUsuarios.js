import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDoc, getDocs,deleteDoc, doc, updateDoc } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './GestionUsuarios.css';
import ConfirmacionEliminacion from './ConfirmacionEliminacion';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuarios = async () => {
      const usuariosCollection = collection(firestore, 'users');
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const listaUsuarios = usuariosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(usuario => usuario.email !== usuarioActual.email); // Excluir al usuario actual
      setUsuarios(listaUsuarios);
    };

    obtenerUsuarios();
  }, [firestore, usuarioActual.email]);

  const manejarEliminarUsuario = async (id) => {
    await deleteDoc(doc(firestore, 'users', id));
    setUsuarios(usuarios.filter(usuario => usuario.id !== id));
    //Cerrar el modal
    setUsuarioAEliminar(null);
  };

  const manejarAprobarUsuario = async (id) => {
    await updateDoc(doc(firestore, 'users', id), { aprobado: true });
    setUsuarios(usuarios.map(usuario => usuario.id === id ? { ...usuario, aprobado: true } : usuario));
  };

  const filtrarUsuarios = () => {
    return usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const verificarPermiso = async () => {
    const userDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
    return userDoc.exists() && userDoc.data().tipoUsuario === 'Admin';
  };

  useEffect(() => {
    verificarPermiso().then((isAdmin) => {
      if (!isAdmin) {
        navigate('/'); // Redirigir si el usuario no es administrador
      }
    });
  }, [navigate]);

  return (
    <div className="contenedor-gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar usuario"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <Link to="/gestion-usuarios/nuevo" className="boton-agregar-usuario">Agregar Usuario</Link>
      <div className="lista-usuarios">
        {filtrarUsuarios().map(usuario => (
          <div key={usuario.id} className="usuario-item">
            <p>{usuario.nombre} {usuario.aprobado ? '' : '(Pendiente de aprobación)'}</p>
            {usuario.aprobado ? (
              <>
                <Link to={`/gestion-usuarios/${usuario.id}/editar`} className="boton-editar">Editar</Link>
                <button onClick={() => setUsuarioAEliminar(usuario.id)} className="boton-eliminar">Eliminar</button>
              </>
            ) : (
              <button onClick={() => manejarAprobarUsuario(usuario.id)} className="boton-aprobar">Aprobar</button>
            )}
          </div>
        ))}
      </div>
      {usuarioAEliminar && (
        <ConfirmacionEliminacion
          usuarioId={usuarioAEliminar}
          onClose={() => setUsuarioAEliminar(null)}
          onConfirm={() => manejarEliminarUsuario(usuarioAEliminar)}
        />
      )}
    </div>
  );
};

export default GestionUsuarios;
