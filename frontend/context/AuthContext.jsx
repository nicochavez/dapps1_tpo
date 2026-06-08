import React, { createContext, useState, useContext } from 'react';
import { loginRequest, getClienteMe } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async ({ documento, contrasenia }) => {
    const data = await loginRequest(documento, contrasenia);
    const receivedToken = data?.token || data?.accessToken || data;

    const clienteData = await getClienteMe(receivedToken);

    const resolvedUser = {
      id: clienteData.identificador,
      documento,
      email: clienteData.email,
      nombre: clienteData.nombre,
      category: clienteData.categoria,
      estado: clienteData.estado,
      admitido: clienteData.admitido,
      token: receivedToken,
    };

    setToken(receivedToken);
    setUser(resolvedUser);
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
