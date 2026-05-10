import React, { createContext, useState } from 'react';

// 1. Creamos el contexto vacío
export const AuthContext = createContext();

// 2. Creamos el "Proveedor" que va a envolver la app
export const AuthProvider = ({ children }) => {
  // Acá guardamos al usuario logueado. Si es null, nadie inició sesión.
  const [user, setUser] = useState(null);

  // Función para iniciar sesión
  const login = (userData) => {
    setUser(userData);
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};