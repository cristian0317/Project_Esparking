import React, { useState } from 'react';
// --- 1. IMPORTA Grid y Link ---
import { Button, TextField, Box, Typography, Container, Link, Grid, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Componente del Footer
const Footer = () => (
    <Box component="footer" sx={{ py: 3, textAlign: 'center', mt: 'auto' }}>
        <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SnowSoft
        </Typography>
        <Typography variant="caption" color="text.secondary">
            Todos los derechos reservados. | 
            <Link color="inherit" href="#">
                Política de Privacidad
            </Link>
        </Typography>
    </Box>
);

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (event) => {
        event.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh',
            justifyContent: 'center'
        }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                 <img 
            src="/logo-esparking.png" // Asegúrate de que tu logo esté en la carpeta /public
            alt="ESParking Logo" 
            style={{ 
              height: '250px', // <-- Aumentamos el tamaño
              marginRight: '0px',
              marginBottom: '50px',
              marginTop: '50px',
             borderRadius:'50%'
            }} 
          />
                <Typography component="h1" variant="h5">
                    Iniciar Sesión en ESParking
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Ingresar
                    </Button>

                    {/* --- 2. AÑADE ESTA SECCIÓN --- */}
                    <Grid container justifyContent="center">
                        <Grid item>
                            <Link href="mailto:soporte@snowsoft.com" variant="body2">
                                ¿Problemas al ingresar? Contacta a Soporte
                            </Link>
                        </Grid>
                    </Grid>
                    
                </Box>
            </Box>

            <Footer />
        </Container>
    );
};

export default LoginPage;