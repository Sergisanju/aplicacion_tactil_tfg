import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import './GestionUsuarios.css';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]); // Estado para almacenar todos los usuarios
  const [analistas, setAnalistas] = useState([]); // Estado para almacenar analistas
  const [jugadores, setJugadores] = useState([]); // Estado para almacenar jugadores
  const [busqueda, setBusqueda] = useState(''); // Estado para el término de búsqueda
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null); // Estado para el usuario a eliminar
  const [usuarioAAprobar, setUsuarioAAprobar] = useState(null); // Estado para el usuario a aprobar
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false); // Estado para mostrar el modal de eliminación
  const [mostrarModalAprobacion, setMostrarModalAprobacion] = useState(false); // Estado para mostrar el modal de aprobación
  const navigate = useNavigate(); // Hook de navegación de React Router
  const firestore = getFirestore(); // Instancia de Firestore
  const auth = getAuth(); // Instancia de autenticación de Firebase
  const usuarioActual = auth.currentUser; // Usuario autenticado actualmente

  // Obtener la lista de usuarios cuando el componente se monta
  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuariosCollection = collection(firestore, 'users'); // Referencia a la colección 'users' en Firestore
        const usuariosSnapshot = await getDocs(usuariosCollection); // Obtiene documentos de la colección
        const listaUsuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Mapea los documentos a un array de usuarios
        const analistas = listaUsuarios.filter(user => user.tipoUsuario === 'Analista' && user.email !== usuarioActual.email); // Filtra analistas
        const jugadores = listaUsuarios.filter(user => user.tipoUsuario === 'Jugador'); // Filtra jugadores
        setUsuarios(listaUsuarios); // Actualiza el estado con todos los usuarios
        setAnalistas(analistas); // Actualiza el estado con los analistas
        setJugadores(jugadores); // Actualiza el estado con los jugadores
      } catch (error) {
        console.error("Error fetching users:", error); // Manejo de errores
      }
    };

    obtenerUsuarios(); 
  }, [firestore, usuarioActual.email]); // Dependencias actualizadas

  // Maneja la eliminación de un usuario
  const manejarEliminarUsuario = async (id) => {
    try {
      // Verificar si el documento del usuario existe en Firestore
      const usuarioDoc = await getDoc(doc(firestore, 'users', id));
      if (usuarioDoc.exists()) {
        const uid = id; // Usa el ID del documento de Firestore como UID

        // Validación del UID
        if (!uid || typeof uid !== 'string' || uid.length > 128) {
          throw new Error('UID inválido'); // Lanza un error si el UID no es válido
        }

        // Llamada a la función de Firebase para eliminar el usuario de la autenticación y de Firestore
        const response = await fetch('https://us-central1-aplicacion-tactil-tfg.cloudfunctions.net/api/eliminar-usuario', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid }), // Envía el UID en el cuerpo de la solicitud
        });

        // Verificar la respuesta
        if (!response.ok) {
          const errorText = await response.text(); // Captura el texto de error de la respuesta
          throw new Error('Respuesta incorrecta: ' + errorText); // Lanza un error si la respuesta no es correcta
        }

        // Actualiza el estado eliminando el usuario
        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        setAnalistas(analistas.filter(analista => analista.id !== id));
        setJugadores(jugadores.filter(jugador => jugador.id !== id));

        setMostrarModalEliminacion(false); // Cerrar el modal de eliminación
        setUsuarioAEliminar(null);
      } else {
        throw new Error('El documento del usuario no existe'); 
      }
    } catch (error) {
      console.error("Error eliminando el usuario: ", error);
    }
  };

  // Maneja la aprobación de un analista
  const manejarAprobarUsuario = async (id) => {
    try {
      const usuarioRef = doc(firestore, 'users', id); // Referencia al documento del usuario en Firestore
      await updateDoc(usuarioRef, { aprobado: true }); // Actualiza el campo 'aprobado' en Firestore

      // Actualiza el estado localmente para reflejar la aprobación sin recargar la página
      setAnalistas(analistas.map(analista => analista.id === id ? { ...analista, aprobado: true } : analista));

      setMostrarModalAprobacion(false); // Cerrar el modal de aprobación
      setUsuarioAAprobar(null);
    } catch (error) {
      console.error("Error aprobando el usuario: ", error);
    }
  };

  // Filtra usuarios según el término de búsqueda
  const filtrarUsuarios = (usuarios, busqueda) => {
    return usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
    ); // Retorna usuarios cuyo nombre incluye el término de búsqueda
  };

  return (
    <div className="contenedor-gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      <div className="barra-busqueda-agregar">
        <input
          type="text"
          placeholder="Buscar usuario"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="campo-busqueda-gestion"
        />
        <button onClick={() => navigate('/gestion-usuarios/nuevo')} className="boton-agregar-usuario-gestion">Agregar Usuario</button>
      </div>
      <div className="lista-usuarios">
        <h2>Analistas</h2>
        {filtrarUsuarios(analistas, busqueda).map(analista => (
          <div key={analista.id} className="usuario-item-gestion">
            <p>
              {analista.nombre}
              {!analista.aprobado && <span className="pendiente"> (Pendiente)</span>}
            </p>
            <div className="botones-usuario-gestion">
              <Link to={`/gestion-usuarios/${analista.id}/editar`} className="boton-editar-admin-gestion">Editar</Link>
              <button onClick={() => {
                setUsuarioAEliminar(analista.id);
                setMostrarModalEliminacion(true);
              }} className="boton-eliminar-admin-gestion">Eliminar</button>
              {!analista.aprobado && (
                <button onClick={() => {
                  setUsuarioAAprobar(analista.id);
                  setMostrarModalAprobacion(true);
                }} className="boton-aprobar-analista-gestion">
                  Aprobar
                </button>
              )}
              <button onClick={() => navigate(`/gestion-usuarios/${analista.id}/asociar`)} className="boton-seleccionar-admin-gestion">Seleccionar</button>
            </div>
          </div>
        ))}
      </div>
      <div className="lista-usuarios">
        <h2>Jugadores</h2>
        {filtrarUsuarios(jugadores, busqueda).map(usuario => (
          <div key={usuario.id} className="usuario-item-gestion">
            <p>{usuario.nombre}</p>
            <div className="botones-usuario-gestion">
              <Link to={`/gestion-usuarios/${usuario.id}/editar`} className="boton-editar-admin-gestion">Editar</Link>
              <button onClick={() => {
                setUsuarioAEliminar(usuario.id);
                setMostrarModalEliminacion(true);
              }} className="boton-eliminar-admin-gestion">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminacion && (
        <div className="modal-eliminar-overlay-gestion">
          <div className="modal-eliminar-content-gestion">
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
            <button onClick={() => setMostrarModalEliminacion(false)} className="boton-cancelar-modal-gestion">Cancelar</button>
            <button onClick={() => manejarEliminarUsuario(usuarioAEliminar)} className="boton-confirmar-modal-gestion">Eliminar</button>
          </div>
        </div>
      )}

      {/* Modal de confirmación de aprobación */}
      {mostrarModalAprobacion && (
        <div className="modal-aprobar-overlay-gestion">
          <div className="modal-aprobar-content-gestion">
            <p>¿Estás seguro de que deseas aprobar este analista?</p>
            <button onClick={() => setMostrarModalAprobacion(false)} className="boton-cancelar-modal-gestion">Cancelar</button>
            <button onClick={() => manejarAprobarUsuario(usuarioAAprobar)} className="boton-confirmar-modal-gestion">Aprobar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
