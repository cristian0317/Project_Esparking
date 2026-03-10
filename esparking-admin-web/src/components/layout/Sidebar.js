import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BarChartIcon from '@mui/icons-material/BarChart';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupIcon from '@mui/icons-material/Group';

// --- LA LÍNEA CORREGIDA ---
import { Link as RouterLink } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ 
        width: 240, 
        flexShrink: 0, 
        bgcolor: 'background.paper', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
    }}>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/dashboard">
            <ListItemIcon><HomeIcon /></ListItemIcon>
            <ListItemText primary="Inicio" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={RouterLink} to="/entradas">
            <ListItemIcon><ReceiptIcon /></ListItemIcon>
            <ListItemText primary="Entradas" />
          </ListItemButton>
        </ListItem>
        {(user.role === 'cajero' || user.role === 'admin') && (
          <ListItem disablePadding>
            <ListItemButton component={RouterLink} to="/vehiculos">
              <ListItemIcon><DirectionsCarIcon /></ListItemIcon>
              <ListItemText primary="Vehículos" />
            </ListItemButton>
          </ListItem>
        )}
        {(user.role === 'administracion' || user.role === 'admin') && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/ingresos">
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Ingresos" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/administracion">
                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                <ListItemText primary="Administración" />
              </ListItemButton>
            </ListItem>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/tarifas">
                <ListItemIcon><PriceChangeIcon /></ListItemIcon>
                <ListItemText primary="Tarifas" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/lugares">
                <ListItemIcon><LocalParkingIcon /></ListItemIcon>
                <ListItemText primary="Lugares" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
    <ListItemButton component={RouterLink} to="/usuarios">
        <ListItemIcon><GroupIcon /></ListItemIcon>
        <ListItemText primary="Usuarios" />
    </ListItemButton>
</ListItem>
          </>
        )}
      </List>
      
      <Box sx={{ marginTop: 'auto' }}> 
        <List>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
                <ListItemButton 
                  onClick={logout}
                  sx={{ 
                    color: 'secondary.main',
                    '& .MuiListItemIcon-root': {
                      color: 'secondary.main'
                    }
                  }}
                >
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
            </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;