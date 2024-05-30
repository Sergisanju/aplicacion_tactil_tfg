import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './DetalleUsuario.css';

const DetalleUsuario = () => {
  const { id } = useParams();
  const [usuario, setUsuario] = useState(null);
  const firestore = getFirestore();

  useEffect(() => {
    const obtenerUsuario = async () => {
      const usuarioDoc = await getDoc(doc(firestore, 'users', id));
      if (usuarioDoc.exists()) {
        setUsuario(usuarioDoc.data());
      }
    };

    obtenerUsuario();
  }, [id, firestore]);

  if (!usuario) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="contenedor-detalle-usuario">
      <h1>Detalle del Usuario</h1>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <p><strong>Tipo de Usuario:</strong> {usuario.tipoUsuario}</p>
      <p><strong>Teléfono:</strong> {usuario.telefono}</p>
      <p><strong>Dirección:</strong> {usuario.direccion}</p>
      <p><strong>Género:</strong> {usuario.genero}</p>
      <p><strong>Intereses:</strong> {usuario.intereses}</p>
      <p><strong>Biografía:</strong> {usuario.bio}</p>
    </div>
  );
};

export default DetalleUsuario;
