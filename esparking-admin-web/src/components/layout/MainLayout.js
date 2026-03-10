import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer'; // <-- 1. IMPORTA EL FOOTER

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      {/* Contenedor para la parte derecha (Header + Contenido + Footer) */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh' // Asegura que el layout ocupe toda la altura
        }}
      >
        <Header />
        
        {/* Contenido principal de la página */}
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, // Hace que el contenido ocupe el espacio disponible
            p: 3, 
            backgroundColor: 'background.default' 
          }}
        >
          {children}
        </Box>
        
        <Footer /> {/* <-- 2. AÑADE EL FOOTER AL FINAL */}
        
      </Box>
    </Box>
  );
};

export default MainLayout;