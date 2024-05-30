import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updatePassword } from 'firebase/auth';
import './FormularioUsuario.css';

const FormularioUsuario = () => {
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: '',
    email: '',
    tipoUsuario: 'Jugador',
    telefono: '',
    direccion: '',
    genero: '',
    intereses: '',
    bio: '',
    password: '',
    confirmPassword: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();
  const firestore = getFirestore();
  const auth = getAuth();
  const usuarioActual = auth.currentUser;

  useEffect(() => {
    const obtenerUsuario = async () => {
      if (id) {
        const usuarioDoc = await getDoc(doc(firestore, 'users', id));
        if (usuarioDoc.exists()) {
          setDatosUsuario({ ...usuarioDoc.data(), password: '', confirmPassword: '' });
        }
      }
    };

    const verificarPermiso = async () => {
      const userDoc = await getDoc(doc(firestore, 'users', usuarioActual.uid));
      return userDoc.exists() && userDoc.data().tipoUsuario === 'Admin';
    };

    verificarPermiso().then((isAdmin) => {
      if (!isAdmin) {
        navigate('/'); // Redirigir si el usuario no es administrador
      }
    });

    obtenerUsuario();
  }, [id, firestore, usuarioActual.uid, navigate]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, nombre, tipoUsuario, telefono, direccion, genero, intereses, bio } = datosUsuario;

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      if (id) {
        // Si estamos editando un usuario existente
        const userDocRef = doc(firestore, 'users', id);
        await setDoc(userDocRef, {
          nombre, email, tipoUsuario, telefono, direccion, genero, intereses, bio
        });

        // Si se proporciona una nueva contraseña, actualizarla
        if (password) {
          const user = await auth.currentUser;
          await updatePassword(user, password);
        }
      } else {
        // Si estamos agregando un nuevo usuario
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(firestore, 'users', user.uid), {
          nombre, email, tipoUsuario, telefono, direccion, genero, intereses, bio
        });
      }
      navigate('/gestion-usuarios');
    } catch (error) {
      console.error("Error al guardar el usuario:", error);
      alert("Error al guardar el usuario: " + error.message);
    }
  };

  return (
    <div className="contenedor-formulario-usuario">
      <h1>{id ? 'Editar Usuario' : 'Agregar Usuario'}</h1>
      <form onSubmit={manejarSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={datosUsuario.nombre}
          onChange={manejarCambio}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={datosUsuario.email}
          onChange={manejarCambio}
          required
        />
        <select
          name="tipoUsuario"
          value={datosUsuario.tipoUsuario}
          onChange={manejarCambio}
          required
        >
          <option value="Jugador">Jugador</option>
          <option value="Analista">Analista</option>
        </select>
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={datosUsuario.telefono}
          onChange={manejarCambio}
        />
        <input
          type="text"
          name="direccion"
          placeholder="Dirección"
          value={datosUsuario.direccion}
          onChange={manejarCambio}
        />
        <input
          type="text"
          name="genero"
          placeholder="Género"
          value={datosUsuario.genero}
          onChange={manejarCambio}
        />
        <input
          type="text"
          name="intereses"
          placeholder="Intereses"
          value={datosUsuario.intereses}
          onChange={manejarCambio}
        />
        <textarea
          name="bio"
          placeholder="Biografía"
          value={datosUsuario.bio}
          onChange={manejarCambio}
        />
        {!id && (
          <>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={datosUsuario.password}
              onChange={manejarCambio}
              required={!id} // Requerir contraseña solo si estamos agregando un nuevo usuario
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar Contraseña"
              value={datosUsuario.confirmPassword}
              onChange={manejarCambio}
              required={!id} // Requerir confirmación de contraseña solo si estamos agregando un nuevo usuario
            />
          </>
        )}
        <button type="submit">{id ? 'Guardar Cambios' : 'Agregar Usuario'}</button>
      </form>
    </div>
  );
};

export default FormularioUsuario;
