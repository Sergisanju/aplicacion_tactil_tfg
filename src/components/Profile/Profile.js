import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setError('No se encontró la información del perfil.');
          }
        } catch (error) {
          setError('Error al cargar la información del perfil.');
        }
      }
    };

    fetchUserData();
  }, [auth]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!userData) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="profile-container">
      <h2>Perfil de Usuario</h2>
      <div className="profile-details">
        <p><strong>Nombre:</strong> {userData.name}</p>
        <p><strong>Fecha de Nacimiento:</strong> {userData.dob}</p>
        <p><strong>Email:</strong> {userData.email}</p>
        <p><strong>Tipo de Usuario:</strong> {userData.userType}</p>
      </div>
    </div>
  );
};

export default Profile;
