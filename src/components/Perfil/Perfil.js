import React, { useState, useEffect } from 'react';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import './Perfil.css';

const Perfil = () => {
  const [datosUsuario, setDatosUsuario] = useState({}); // Almacena los datos del usuario
  const [modoEdicion, setModoEdicion] = useState(false); // Controla el modo de edición
  const [formularioDatos, setFormularioDatos] = useState({
    nombre: '',
    fechaNacimiento: '',
    email: '',
    tipoUsuario: '',
    telefono: '',
    direccion: '',
    genero: '',
    nivelEducativo: '',
    biografia: ''
  }); // Almacena los datos del formulario de edición
  const [mensajeModal, setMensajeModal] = useState(''); // Mensaje a mostrar en el modal
  const [modalVisible, setModalVisible] = useState(false); // Controla la visibilidad del modal general
  const [showChangePassword, setShowChangePassword] = useState(false); // Controla la visibilidad del modal de cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState(''); // Almacena la contraseña actual
  const [newPassword, setNewPassword] = useState(''); // Almacena la nueva contraseña
  const [mensajeContraseña, setMensajeContraseña] = useState(''); // Almacena los mensajes de error para el cambio de contraseña
  const auth = getAuth(); // Obtiene la instancia de autenticación

  // Hook useEffect para cargar los datos del usuario cuando el componente se monta
  useEffect(() => {
    const fetchDatosUsuario = async () => {
      const user = auth.currentUser; // Obtiene el usuario actualmente autenticado
      if (user) { // Verifica si hay un usuario autenticado
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid)); // Obtiene el documento del usuario en Firestore
          if (userDoc.exists()) { // Verifica si el documento existe
            const userData = userDoc.data(); // Obtiene los datos del usuario
            setDatosUsuario(userData); // Establece los datos del usuario en el estado
            // Inicializa el formulario con los datos del usuario
            setFormularioDatos({
              nombre: userData.nombre || '',
              fechaNacimiento: userData.fechaNacimiento || '',
              email: userData.email || '',
              tipoUsuario: userData.tipoUsuario || '',
              telefono: userData.telefono || '',
              direccion: userData.direccion || '',
              genero: userData.genero || '',
              nivelEducativo: userData.nivelEducativo || '',
              biografia: userData.biografia || ''
            });
          } else {
            setMensajeModal('No se encontró la información del perfil.'); // Muestra un mensaje si el documento no existe
          }
        } catch (error) {
          setMensajeModal('Error al cargar la información del perfil.'); // Muestra un mensaje de error si algo falla
        }
      }
    };

    fetchDatosUsuario(); // Llama a la función para cargar los datos del usuario
  }, [auth]);

  // Función para manejar los cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target; // Desestructura el nombre del campo (name) y el valor ingresado (value) del evento
    setFormularioDatos((prevState) => ({
      ...prevState, // Copia todos los valores actuales del formulario
      [name]: value, // Actualiza el valor del campo específico que cambió
    }));
  };

  // Función para alternar el modo de edición
  const handleToggleEdicion = () => {
    setModoEdicion(!modoEdicion); // Alterna el estado de modoEdicion entre verdadero (true) y falso (false)
  };

  // Función para guardar los cambios en el perfil
  const handleGuardar = async () => {
    const user = auth.currentUser; // Obtiene el usuario actualmente autenticado
    if (user) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), formularioDatos); // Actualiza el documento del usuario en Firestore con los datos del formulario
        setDatosUsuario(formularioDatos); // Actualiza el estado datosUsuario con los nuevos datos guardados
        setModoEdicion(false); // Desactiva el modo de edición
        setMensajeModal('Perfil actualizado correctamente.'); // Muestra un mensaje de éxito
        setModalVisible(true); // Muestra el modal de éxito
      } catch (error) {
        setMensajeModal('Error al actualizar el perfil.'); // Muestra un mensaje de error si algo falla
        setModalVisible(true); // Muestra el modal de error
      }
    }
  };

  // Función para validar la seguridad de la contraseña
  const validarContraseña = (contraseña) => {
    // Expresión regular para verificar que la contraseña tenga al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(contraseña); // Retorna verdadero si la contraseña cumple con la expresión regular
  };

  // Función para manejar el cambio de contraseña
  const handleChangePassword = async (e) => {
    e.preventDefault(); // Previene la acción por defecto del formulario de envío
    const user = auth.currentUser; // Obtiene el usuario actualmente autenticado

    // Verifica si la nueva contraseña cumple con los requisitos de seguridad
    if (!validarContraseña(newPassword)) {
      setMensajeContraseña('La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas y números.');
      return; // Detiene el proceso si la contraseña no es válida
    }

    // Verifica si la nueva contraseña es igual a la contraseña actual
    if (currentPassword === newPassword) {
      setMensajeContraseña('La nueva contraseña no puede ser igual a la contraseña actual.');
      return; // Detiene el proceso si las contraseñas son iguales
    }

    try {
      // Credenciales para reautenticar al usuario
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential); // Reautentica al usuario con la contraseña actual
      await updatePassword(user, newPassword); // Actualiza la contraseña del usuario en Firebase Auth
      setMensajeContraseña('Contraseña actualizada correctamente.'); // Muestra un mensaje de éxito
      setShowChangePassword(false); // Cierra el modal de cambio de contraseña
      setModalVisible(true); // Muestra el modal de éxito
      setNewPassword(''); // Limpia el campo de la nueva contraseña
      setCurrentPassword(''); // Limpia el campo de la contraseña actual
    } catch (error) {
      // Manejo de errores específicos de autenticación
      if (error.code === 'auth/wrong-password') {
        setMensajeContraseña('La contraseña actual es incorrecta.');
      } else if (error.code === 'auth/invalid-credential') {
        setMensajeContraseña('Las credenciales proporcionadas no son válidas. Por favor, inténtalo de nuevo.');
      } else {
        setMensajeContraseña('Error al actualizar la contraseña. Por favor, inténtalo de nuevo más tarde.');
      }
    }
  };

  // Función para abrir el modal de cambio de contraseña
  const openChangePasswordModal = () => {
    setMensajeContraseña(''); // Limpia cualquier mensaje previo
    setNewPassword(''); // Limpia el campo de la nueva contraseña
    setCurrentPassword(''); // Limpia el campo de la contraseña actual
    setShowChangePassword(true); // Muestra el modal de cambio de contraseña
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setModalVisible(false); // Oculta el modal
  };

  // Mostrar mensaje de carga si no se han cargado los datos del usuario
  if (!Object.keys(datosUsuario).length) {
    return <p>Cargando...</p>; // Muestra "Cargando..." si datosUsuario está vacío
  }

  // Función para verificar si un campo es editable
  const esEditable = (campo) => 
    // Retorna verdadero si el campo está en modo de edición y no es uno de los campos no editables (nombre, fechaNacimiento, email, tipoUsuario)
    modoEdicion && !['nombre', 'fechaNacimiento', 'email', 'tipoUsuario'].includes(campo);

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
          { label: 'Nivel Educativo', value: datosUsuario.nivelEducativo, name: 'nivelEducativo', type: 'select', options: ['ESO', 'Bachillerato', 'Grado Superior', 'Grado Medio', 'Licenciatura', 'Doctorado', 'Sin estudios', 'Otro'] },
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
              {mensajeContraseña && <p className="mensaje-error">{mensajeContraseña}</p>}
              <button type="submit" className="boton-guardar">Guardar</button>
            </form>
          </div>
        </div>
      )}
      {modalVisible && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <p>{mensajeModal}</p>
            <button onClick={closeModal} className="boton-guardar">OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;