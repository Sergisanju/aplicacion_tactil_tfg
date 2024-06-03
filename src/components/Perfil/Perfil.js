import React, { useState, useEffect } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import './Perfil.css';

const Perfil = () => {
  const [datosUsuario, setDatosUsuario] = useState({});
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formularioDatos, setFormularioDatos] = useState({
    nombre: '',
    fechaNacimiento: '',
    email: '',
    tipoUsuario: '',
    telefono: '',
    direccion: '',
    genero: '',
    intereses: '',
    biografia: ''
  });
  const [mensajeModal, setMensajeModal] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchDatosUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDatosUsuario(userData);
            setFormularioDatos({
              nombre: userData.nombre || '',
              fechaNacimiento: userData.fechaNacimiento || '',
              email: userData.email || '',
              tipoUsuario: userData.tipoUsuario || '',
              telefono: userData.telefono || '',
              direccion: userData.direccion || '',
              genero: userData.genero || '',
              intereses: userData.intereses || '',
              biografia: userData.biografia || ''
            });
          } else {
            setMensajeModal('No se encontró la información del perfil.');
          }
        } catch (error) {
          setMensajeModal('Error al cargar la información del perfil.');
        }
      }
    };

    fetchDatosUsuario();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormularioDatos((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleToggleEdicion = () => {
    setModoEdicion(!modoEdicion);
  };

  const handleGuardar = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), formularioDatos);
        setDatosUsuario(formularioDatos);
        setModoEdicion(false);
        setMensajeModal('Perfil actualizado correctamente.');
      } catch (error) {
        setMensajeModal('Error al actualizar el perfil.');
      }
    }
  };

  const validarContraseña = (contraseña) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(contraseña);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!validarContraseña(newPassword)) {
      setMensajeModal('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
      return;
    }
    if (currentPassword === newPassword) {
      setMensajeModal('La nueva contraseña no puede ser igual a la contraseña actual.');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMensajeModal('Contraseña actualizada correctamente.');
      setShowChangePassword(false);
      setNewPassword('');
      setCurrentPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setMensajeModal('La contraseña actual es incorrecta.');
      } else if (error.code === 'auth/invalid-credential') {
        setMensajeModal('Las credenciales proporcionadas no son válidas. Por favor, inténtalo de nuevo.');
      } else {
        setMensajeModal('Error al actualizar la contraseña. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  const openChangePasswordModal = () => {
    setMensajeModal('');
    setNewPassword('');
    setCurrentPassword('');
    setShowChangePassword(true);
  };

  if (!Object.keys(datosUsuario).length) {
    return <p>Cargando...</p>;
  }

  const esEditable = (campo) => modoEdicion && !['nombre', 'fechaNacimiento', 'email', 'tipoUsuario'].includes(campo);

  return (
    <div className="contenedor-perfil">
      <h2>Perfil de Usuario</h2>
      <div className="detalles-perfil">
        {[
          { label: 'Nombre', value: datosUsuario.nombre, name: 'nombre', type: 'text' },
          { label: 'Fecha de Nacimiento', value: datosUsuario.fechaNacimiento, name: 'fechaNacimiento', type: 'date' },
          { label: 'Email', value: datosUsuario.email, name: 'email', type: 'text', editable: false },
          { label: 'Tipo de Usuario', value: datosUsuario.tipoUsuario, name: 'tipoUsuario', type: 'select', options: ['Analista', 'Jugador'] },
          { label: 'Teléfono', value: datosUsuario.telefono, name: 'telefono', type: 'tel' },
          { label: 'Dirección', value: datosUsuario.direccion, name: 'direccion', type: 'text' },
          { label: 'Género', value: datosUsuario.genero, name: 'genero', type: 'select', options: ['Masculino', 'Femenino', 'Otro'] },
          { label: 'Intereses', value: datosUsuario.intereses, name: 'intereses', type: 'text' },
          { label: 'Biografía', value: datosUsuario.biografia, name: 'biografia', type: 'textarea' },
        ].map((item, index) => (
          <div key={item.name} className={`item-perfil ${index % 2 === 0 ? 'par' : 'impar'}`}>
            <label>{item.label}:</label>
            {esEditable(item.name) ? (
              item.type === 'select' ? (
                <select name={item.name} value={formularioDatos[item.name]} onChange={handleChange}>
                  {item.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : item.type === 'textarea' ? (
                <textarea name={item.name} value={formularioDatos[item.name]} onChange={handleChange} />
              ) : (
                <input type={item.type} name={item.name} value={formularioDatos[item.name]} onChange={handleChange} />
              )
            ) : (
              <input type={item.type} name={item.name} value={formularioDatos[item.name]} disabled />
            )}
          </div>
        ))}
        <div className="acciones-perfil">
          {modoEdicion ? (
            <button onClick={handleGuardar} className="boton-guardar">Guardar</button>
          ) : (
            <button onClick={handleToggleEdicion} className="boton-editar">Editar</button>
          )}
          {!modoEdicion && (
            <button onClick={openChangePasswordModal} className="boton-cambiar-contrasena">Cambiar Contraseña</button>
          )}
        </div>
      </div>
      {showChangePassword && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowChangePassword(false)}>&times;</span>
            <h3>Cambiar Contraseña</h3>
            <form onSubmit={handleChangePassword}>
              <div className="password-container">
                <label>Contraseña Actual:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="password-container">
                <label>Nueva Contraseña:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              {mensajeModal && <p className={`mensaje ${mensajeModal.includes('Error') ? 'error' : 'exito'}`}>{mensajeModal}</p>}
              <button type="submit" className="boton-guardar">Guardar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
