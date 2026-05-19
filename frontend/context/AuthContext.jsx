import React, { createContext, useState } from 'react';
import { loginRequest } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async ({ documento, contrasenia }) => {
    const data = await loginRequest(documento, contrasenia);

    const receivedToken = data?.token || data?.accessToken || data;

    setToken(receivedToken);
    setUser({
      documento,
      token: receivedToken,
    });

    return receivedToken;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};