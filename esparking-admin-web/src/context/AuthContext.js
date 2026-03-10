import React, { createContext, useState, useContext, useEffect } from 'react'; // <-- AÑADE useEffect
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Un nuevo estado para saber si estamos verificando la sesión inicial
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Esta función se ejecutará solo una vez, cuando la app cargue
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          // Verificamos el token con nuestro backend
          const response = await authService.getMe(token);
          setUser(response.data); // Si es válido, establecemos el usuario
        } catch (error) {
          // Si el token no es válido, lo borramos
          localStorage.removeItem('userToken');
          console.log('Token inválido o expirado');
        }
      }
      setLoading(false); // Terminamos de cargar
    };

    checkLoggedIn();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response.data.token) {
      localStorage.setItem('userToken', response.data.token);
      setUser(response.data.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    setUser(null);
  };

  const value = { user, login, logout, loading }; // <-- AÑADE loading

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};