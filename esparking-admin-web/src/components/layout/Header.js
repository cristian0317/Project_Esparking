import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import organizationService from '../../services/organizationService';

const Header = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [loadingOrg, setLoadingOrg] = useState(true);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (user && user.organization) {
        try {
          setLoadingOrg(true);
          const response = await organizationService.getOrganizationById(user.organization);
          setOrganization(response.data);
        } catch (err) {
          console.error("Error al cargar la organización:", err);
        } finally {
          setLoadingOrg(false);
        }
      }
    };

    fetchOrganizationData();
  }, [user]);

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        {/* --- LADO IZQUIERDO (Logo ESParking más grande) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          
          <img 
            src="/logo-esparking.png" // Asegúrate de que tu logo esté en la carpeta /public
            alt="ESParking Logo" 
            style={{ 
              height: '55px', // <-- Aumentamos el tamaño
              marginRight: '12px',
             borderRadius:'50%'
            }} 
          />
          
          <Typography variant="h6" noWrap component="div">
            ESParking
          </Typography>
        </Box>
        
        {/* --- LADO DERECHO (Organización y Usuario) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {loadingOrg ? (
            <CircularProgress size={24} color="inherit" sx={{ mr: 2 }} />
          ) : organization ? (
            <>
              {/* Logo de la Organización (Redondo por defecto) */}
              <Avatar 
                src={organization.logoUrl || ''}
                sx={{ width: 40, height: 40, mr: 1.5, bgcolor: 'white', color: 'black' }} // <-- Tamaño aumentado
              >
                {organization.name ? organization.name.charAt(0).toUpperCase() : '?'}
              </Avatar>
              {/* Nombre de la Organización */}
              <Typography variant="body1" sx={{ mr: 3, display: { xs: 'none', sm: 'block' } }}>
                {organization.name}
              </Typography>
            </>
          ) : null}

          {/* Avatar del Usuario (Redondo por defecto) */}
          {user && (
            <Avatar sx={{ bgcolor: 'secondary.main', width: 40, height: 40 }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          )}
        </Box>

      </Toolbar>
    </AppBar>
  );
};

export default Header;