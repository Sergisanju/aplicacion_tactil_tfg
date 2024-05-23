import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    userType: '',
    phone: '',
    address: '',
    gender: '',
    interests: '',
    bio: ''
  });
  const [message, setMessage] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            setFormData(userDoc.data());
          } else {
            setMessage('No se encontró la información del perfil.');
          }
        } catch (error) {
          setMessage('Error al cargar la información del perfil.');
        }
      }
    };

    fetchUserData();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(firestore, 'users', user.uid), formData);
        setUserData(formData);
        setEditMode(false);
        setMessage('Perfil actualizado correctamente.');
      } catch (error) {
        setMessage('Error al actualizar el perfil.');
      }
    }
  };

  if (!userData) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Perfil de Usuario</h2>
      {message && <p className="message">{message}</p>}
      <div className="profile-details">
        <div className="profile-item">
          <label>Nombre:</label>
          {editMode ? (
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.name || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Fecha de Nacimiento:</label>
          {editMode ? (
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.dob || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Email:</label>
          <span>{userData.email}</span>
        </div>
        <div className="profile-item">
          <label>Tipo de Usuario:</label>
          {editMode ? (
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="Analista">Analista</option>
              <option value="Jugador">Jugador</option>
            </select>
          ) : (
            <span>{userData.userType || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Teléfono:</label>
          {editMode ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.phone || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Dirección:</label>
          {editMode ? (
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.address || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Género:</label>
          {editMode ? (
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Selecciona</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          ) : (
            <span>{userData.gender || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Intereses:</label>
          {editMode ? (
            <input
              type="text"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.interests || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-item">
          <label>Biografía:</label>
          {editMode ? (
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          ) : (
            <span>{userData.bio || 'Completa este campo'}</span>
          )}
        </div>
        <div className="profile-actions">
          {editMode ? (
            <button onClick={handleSave}>Guardar</button>
          ) : (
            <button onClick={handleEditToggle}>Editar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
