import React, { createContext, useState, useContext } from 'react';
import { loginRequest, getClienteMe } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function parseJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async ({ documento, contrasenia }) => {
    const data = await loginRequest(documento, contrasenia);
    const receivedToken = data?.token || data?.accessToken || data;

    const claims = parseJwtPayload(receivedToken);
    const roles = claims.roles || [];

    let resolvedUser = {
      id: claims.sub ? Number(claims.sub) : null,
      documento: claims.documento || documento,
      email: claims.email || null,
      roles,
      token: receivedToken,
    };

    if (roles.includes('CLIENTE')) {
      const clienteData = await getClienteMe(receivedToken);
      resolvedUser = {
        ...resolvedUser,
        id: clienteData.identificador,
        nombre: clienteData.nombre,
        email: clienteData.email,
        category: clienteData.categoria,
        estado: clienteData.estado,
        admitido: clienteData.admitido,
      };
    }

    setUser(resolvedUser);
    return receivedToken;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token: user?.token ?? null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
