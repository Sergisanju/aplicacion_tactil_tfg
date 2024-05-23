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

  const isEditable = (field) => editMode && !['name', 'dob', 'email', 'userType'].includes(field);

  return (
    <div className="profile-container">
      <h2>Perfil de Usuario</h2>
      {message && <p className="message">{message}</p>}
      <div className="profile-details">
        {[
          { label: 'Nombre', value: userData.name, name: 'name', type: 'text' },
          { label: 'Fecha de Nacimiento', value: userData.dob, name: 'dob', type: 'date' },
          { label: 'Email', value: userData.email, name: 'email', type: 'text', editable: false },
          { label: 'Tipo de Usuario', value: userData.userType, name: 'userType', type: 'select', options: ['Analista', 'Jugador'] },
          { label: 'Teléfono', value: userData.phone, name: 'phone', type: 'tel' },
          { label: 'Dirección', value: userData.address, name: 'address', type: 'text' },
          { label: 'Género', value: userData.gender, name: 'gender', type: 'select', options: ['Masculino', 'Femenino', 'Otro'] },
          { label: 'Intereses', value: userData.interests, name: 'interests', type: 'text' },
          { label: 'Biografía', value: userData.bio, name: 'bio', type: 'textarea' },
        ].map((item, index) => (
          <div key={item.name} className={`profile-item ${index % 2 === 0 ? 'even' : 'odd'}`}>
            <label>{item.label}:</label>
            {isEditable(item.name) ? (
              item.type === 'select' ? (
                <select name={item.name} value={formData[item.name]} onChange={handleChange}>
                  {item.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : item.type === 'textarea' ? (
                <textarea name={item.name} value={formData[item.name]} onChange={handleChange} />
              ) : (
                <input type={item.type} name={item.name} value={formData[item.name]} onChange={handleChange} />
              )
            ) : (
              <input type={item.type} name={item.name} value={formData[item.name]} disabled />
            )}
          </div>
        ))}
        <div className="profile-actions">
          {editMode ? (
            <button onClick={handleSave} className="save-button">Guardar</button>
          ) : (
            <button onClick={handleEditToggle} className="edit-button">Editar</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
