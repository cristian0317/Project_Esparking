import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material'; // Para mostrar un ícono de carga

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Obtenemos el nuevo estado de 'loading'

  // --- ESTE ES EL CAMBIO CLAVE ---
  // Si estamos en el proceso de "Cargando" (verificando el token),
  // mostramos un ícono en lugar de hacer algo.
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Si ya terminó de cargar y NO hay usuario, te redirige al login.
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si ya terminó de cargar y SÍ hay usuario, te deja ver la página.
  return children;
};

export default ProtectedRoute;