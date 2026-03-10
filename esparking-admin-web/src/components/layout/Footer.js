import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{
        py: 2,
        px: 2,
        mt: 'auto', // Esto empuja el footer al fondo de la página
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        borderTop: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        color: 'text.secondary',
      }}
    >
      {/* Aquí puedes poner tu logo si tienes el archivo */}
      {/* <img src="/logo-snowsoft.png" alt="SnowSoft Logo" height="20" /> */}

      <Typography variant="body2">
        © {new Date().getFullYear()} SnowSoft
      </Typography>
      <Typography variant="caption">
        Todos los derechos reservados. | 
        <Link color="inherit" href="#"> {/* En el futuro, puedes enlazar a una página de políticas */}
          Política de Privacidad
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer;