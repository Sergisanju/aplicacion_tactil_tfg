import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';
import './GestionUsuarios.css';
import ConfirmacionEliminacion from './ConfirmacionEliminacion';
import FormularioNuevoUsuario from './FormularioNuevoUsuario';

const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [selectedAnalista, setSelectedAnalista] = useState(null);
  const [selectedJugadores, setSelectedJugadores] = useState([]);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    email: '',
    password: '',
    tipoUsuario: 'Analista', // or 'Jugador'
    fechaNacimiento: '', // nuevo campo
  });
  const [mostrarFormularioNuevoUsuario, setMostrarFormularioNuevoUsuario] = useState(false);
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const usuariosCollection = collection(firestore, 'users');
        const usuariosSnapshot = await getDocs(usuariosCollection);
        const listaUsuarios = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const analistas = listaUsuarios.filter(user => user.tipoUsuario === 'Analista' && user.email !== usuarioActual.email);
        const jugadores = listaUsuarios.filter(user => user.tipoUsuario === 'Jugador');
        setUsuarios(listaUsuarios);
        setAnalistas(analistas);
        setJugadores(jugadores);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    obtenerUsuarios();
  }, [firestore, usuarioActual.email]);

  const manejarAgregarUsuario = async () => {
    try {
      const { nombre, email, password, tipoUsuario, fechaNacimiento } = nuevoUsuario;

      // Llamar a la función de Firebase para agregar el usuario
      const response = await fetch('https://us-central1-aplicacion-tactil-tfg.cloudfunctions.net/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, email, password, tipoUsuario, fechaNacimiento }),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Capture error response text
        throw new Error('Network response was not ok: ' + errorText);
      }

      const { uid } = await response.json();

      const newUser = {
        id: uid,
        nombre,
        email,
        tipoUsuario,
        fechaNacimiento,
      };

      setUsuarios([...usuarios, newUser]);
      if (tipoUsuario === 'Analista') {
        setAnalistas([...analistas, newUser]);
      } else {
        setJugadores([...jugadores, newUser]);
      }

      // Limpiar el formulario y cerrar el modal
      setNuevoUsuario({ nombre: '', email: '', password: '', tipoUsuario: 'Analista', fechaNacimiento: '' });
      setMostrarFormularioNuevoUsuario(false);
      alert('Usuario agregado correctamente.');
    } catch (error) {
      console.error("Error agregando el usuario: ", error);
      alert('Error agregando el usuario: ' + error.message);
    }
  };

  const manejarEliminarUsuario = async (id) => {
    try {
      console.log('Deleting user with ID:', id);
      const usuarioDoc = await getDoc(doc(firestore, 'users', id));
      if (usuarioDoc.exists()) {
        const uid = id; // Use the Firestore document ID as the UID

        if (!uid || typeof uid !== 'string' || uid.length > 128) {
          throw new Error('Invalid UID');
        }

        console.log('Deleting user with UID:', uid); // Debugging line

        // Eliminar usuario de Firestore
        await deleteDoc(doc(firestore, 'users', id));

        // Llamar a la función de Firebase para eliminar al usuario de la autenticación
        const response = await fetch('https://us-central1-aplicacion-tactil-tfg.cloudfunctions.net/api/delete-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid }),
        });

        if (!response.ok) {
          const errorText = await response.text(); // Capture error response text
          throw new Error('Network response was not ok: ' + errorText);
        }

        setUsuarios(usuarios.filter(usuario => usuario.id !== id));
        setAnalistas(analistas.filter(analista => analista.id !== id));
        setJugadores(jugadores.filter(jugador => jugador.id !== id));

        // Cerrar el modal
        setUsuarioAEliminar(null);
        alert('Usuario eliminado correctamente.');
      } else {
        throw new Error('User document does not exist');
      }
    } catch (error) {
      console.error("Error eliminando el usuario: ", error);
      alert('Error eliminando el usuario: ' + error.message);
    }
  };

  const manejarSeleccionarAnalista = async (id) => {
    setSelectedAnalista(id);
    const analistaDoc = await getDoc(doc(firestore, 'users', id));
    if (analistaDoc.exists()) {
      const data = analistaDoc.data();
      setSelectedJugadores(data.asociados || []);
    }
  };

  const manejarSeleccionarJugador = (id) => {
    setSelectedJugadores(prevState =>
      prevState.includes(id) ? prevState.filter(jId => jId !== id) : [...prevState, id]
    );
  };

  const manejarGuardarAsociaciones = async () => {
    if (selectedAnalista) {
      const analistaDoc = doc(firestore, 'users', selectedAnalista);
      await updateDoc(analistaDoc, { asociados: selectedJugadores });
      setSelectedAnalista(null);
      setSelectedJugadores([]);
      alert('Asociaciones guardadas correctamente.');
    }
  };

  const filtrarUsuarios = (usuarios, busqueda) => {
    return usuarios.filter(usuario => 
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  return (
    <div className="contenedor-gestion-usuarios">
      <h1>Gestión de Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar usuario"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <button onClick={() => setMostrarFormularioNuevoUsuario(true)} className="boton-agregar-usuario">Agregar Usuario</button>
      {mostrarFormularioNuevoUsuario && (
        <FormularioNuevoUsuario
          nuevoUsuario={nuevoUsuario}
          setNuevoUsuario={setNuevoUsuario}
          manejarAgregarUsuario={manejarAgregarUsuario}
          onClose={() => setMostrarFormularioNuevoUsuario(false)}
        />
      )}
      <div className="lista-usuarios">
        <h2>Analistas</h2>
        {filtrarUsuarios(analistas, busqueda).map(analista => (
          <div key={analista.id} className="usuario-item">
            <p>{analista.nombre}</p>
            <Link to={`/gestion-usuarios/${analista.id}/editar`} className="boton-editar">Editar</Link>
            <button onClick={() => setUsuarioAEliminar(analista.id)} className="boton-eliminar">Eliminar</button>
            <button onClick={() => manejarSeleccionarAnalista(analista.id)} className="boton-seleccionar">Seleccionar</button>
          </div>
        ))}
      </div>
      {selectedAnalista && (
        <div className="asociar-usuarios">
          <h2>Asociar Jugadores al Analista Seleccionado</h2>
          {filtrarUsuarios(jugadores, busqueda).map(jugador => (
            <div key={jugador.id} className="usuario-item">
              <p>{jugador.nombre}</p>
              <input
                type="checkbox"
                checked={selectedJugadores.includes(jugador.id)}
                onChange={() => manejarSeleccionarJugador(jugador.id)}
              />
            </div>
          ))}
          <button onClick={manejarGuardarAsociaciones} className="boton-guardar">Guardar Asociaciones</button>
        </div>
      )}
      <div className="lista-usuarios">
        <h2>Jugadores</h2>
        {filtrarUsuarios(jugadores, busqueda).map(usuario => (
          <div key={usuario.id} className="usuario-item">
            <p>{usuario.nombre}</p>
            <Link to={`/gestion-usuarios/${usuario.id}/editar`} className="boton-editar">Editar</Link>
            <button onClick={() => setUsuarioAEliminar(usuario.id)} className="boton-eliminar">Eliminar</button>
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
