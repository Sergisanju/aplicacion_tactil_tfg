import React, { useEffect, useState } from 'react';
import { Route, Navigate, useLocation } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { firestore } from '../../firebase-config';

const ProtectedRoute = ({ roles, element: Element, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasRole, setHasRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        if (userData && roles.includes(userData.userType)) {
          setHasRole(true);
        } else {
          setHasRole(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, roles]);

  if (loading) {
    return <div>Loading...</div>; // Puedes mostrar un spinner u otro indicador de carga
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (!hasRole) {
    return <Navigate to="/" />;
  }

  return <Element {...rest} />;
};

export default ProtectedRoute;
