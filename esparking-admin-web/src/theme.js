import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Usaremos un tema oscuro como base
    primary: {
      main: '#424242', // Un gris oscuro
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d32f2f', // Un rojo fuerte
      contrastText: '#ffffff',
    },
    background: {
      default: '#212121', // Fondo principal
      paper: '#333333', // Fondo para tarjetas y menús
    },
    text: {
      primary: '#ffffff',
      secondary: '#bdbdbd',
    },
  },
});

export default theme;