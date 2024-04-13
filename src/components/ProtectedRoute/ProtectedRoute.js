// ProtectedRoute.js
import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { getAuth } from "firebase/auth";

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const auth = getAuth();
  const isAuthenticated = auth.currentUser;

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

export default ProtectedRoute;
