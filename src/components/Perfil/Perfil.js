import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import './Perfil.css';

const Perfil = () => {
  const [datosUsuario, setDatosUsuario] = useState(null);
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
  const [mensaje, setMensaje] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchDatosUsuario = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setDatosUsuario(userDoc.data());
            setFormularioDatos(userDoc.data());
          } else {
            setMensaje('No se encontró la información del perfil.');
          }
        } catch (error) {
          setMensaje('Error al cargar la información del perfil.');
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
        setMensaje('Perfil actualizado correctamente.');
      } catch (error) {
        setMensaje('Error al actualizar el perfil.');
      }
    }
  };

  if (!datosUsuario) {
    return <p>Cargando...</p>;
  }

  const esEditable = (campo) => modoEdicion && !['nombre', 'fechaNacimiento', 'email', 'tipoUsuario'].includes(campo);

  return (
    <div className="contenedor-perfil">
      <h2>Perfil de Usuario</h2>
      {mensaje && <p className="mensaje">{mensaje}</p>}
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
        </div>
      </div>
    </div>
  );
};

export default Perfil;
