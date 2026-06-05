import React, { createContext, useState } from 'react';
import { loginRequest } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (credentialsOrUser) => {
    if (credentialsOrUser?.id && credentialsOrUser?.email) {
      setToken(credentialsOrUser.token || 'mock-token');
      setUser(credentialsOrUser);
      return credentialsOrUser.token || 'mock-token';
    }

    const { documento, contrasenia } = credentialsOrUser || {};
    const data = await loginRequest(documento, contrasenia);

    const receivedToken = data?.token || data?.accessToken || data;

    setToken(receivedToken);
    setUser({
      id: credentialsOrUser?.id,
      email: credentialsOrUser?.email,
      name: credentialsOrUser?.name,
      avatar: credentialsOrUser?.avatar,
      badge: credentialsOrUser?.badge,
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