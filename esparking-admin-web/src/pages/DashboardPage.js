import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Divider, Paper } from '@mui/material';
import parkingService from '../services/parkingService';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const Legend = () => (
    <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 3, mb: 4, backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FiberManualRecordIcon sx={{ color: '#4caf50', mr: 1 }} />
            <Typography variant="body2">Disponible</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FiberManualRecordIcon sx={{ color: 'secondary.main', mr: 1 }} />
            <Typography variant="body2">Ocupado</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FiberManualRecordIcon sx={{ color: '#9e9e9e', mr: 1 }} />
            <Typography variant="body2">Deshabilitado</Typography>
        </Box>
    </Paper>
);

const DashboardPage = () => {
    const [spots, setSpots] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');
    
    // --- LÓGICA DINÁMICA ---
    // 1. Estado para guardar el ID del estacionamiento
    const [parkingId, setParkingId] = useState(null);

    // 2. Función para buscar lugares (ahora depende de parkingId)
    const fetchSpots = useCallback(async (id) => {
        if (!id) return; // No hacer nada si no hay ID
        try {
            // No ponemos setLoading(true) para que el refresco sea en segundo plano
            const response = await parkingService.getSpotsForParking(id);
            setSpots(response.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los lugares.');
        }
    }, []); // Ya no depende de un ID estático

    // 3. Efecto para buscar el ID del estacionamiento al cargar
    useEffect(() => {
        const loadParkingInfo = async () => {
            try {
                const response = await parkingService.getMyParking();
                const id = response.data._id;
                setParkingId(id); // Guardamos el ID
                await fetchSpots(id); // Llamamos a fetchSpots con el ID
            } catch (err) {
                setError('No se encontró un estacionamiento para tu organización.');
            } finally {
                setInitialLoading(false);
            }
        };
        
        loadParkingInfo();
    }, [fetchSpots]);

    // 4. Efecto para el refresco automático
    useEffect(() => {
        if (!parkingId) return; // No iniciar el intervalo si no tenemos ID

        const interval = setInterval(() => {
            fetchSpots(parkingId);
        }, 15000); // Refresca cada 15 segundos

        return () => clearInterval(interval);
    }, [parkingId, fetchSpots]);
    // -----------------------

    const getSpotColor = (status) => {
        if (status === 'ocupado') return 'secondary.main'; // Rojo
        if (status === 'disponible') return '#4caf50'; // Verde
        return '#9e9e9e'; // Gris
    };

    const carSpots = spots.filter(s => s.spotType === 'carro');
    const motoSpots = spots.filter(s => s.spotType === 'moto');
    
    if (initialLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Vista General del Estacionamiento</Typography>
            <Typography variant="body1" color="text.secondary" sx={{mb: 2}}>
                En esta sección podrás visualizar en tiempo real los lugares de estacionamiento. Utiliza la leyenda de colores para identificar el estado de cada cajón.
            </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
  <strong>¿Cuál es la diferencia?</strong>
  <ul>
    <li><strong>Deshabilitar:</strong> Use esta opción para bloquear temporalmente un lugar por razones operativas (ej. limpieza, reservado VIP).</li>
    <li><strong>Poner en Mantenimiento:</strong> Use esta opción si el lugar tiene un problema físico o técnico (ej. sensor dañado, repintado) y no puede ser usado.</li>
  </ul>
</Alert>
            <Legend />

            <Typography variant="h5" gutterBottom>
                Carros ({carSpots.filter(s=>s.status==='disponible').length} disponibles)
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {carSpots.map((spot) => (
                   <Grid item key={spot._id} xs={6} sm={4} md={3} lg={2}>
                        <Card sx={{ backgroundColor: getSpotColor(spot.status), color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <DirectionsCarIcon fontSize="large" />
                                <Typography variant="h6">{spot.spotIdentifier}</Typography>
                                <Typography variant="caption">{spot.status}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            <Divider sx={{ my: 2 }} />

           <Typography variant="h5" gutterBottom>
               Motos ({motoSpots.filter(s=>s.status==='disponible').length} disponibles)
            </Typography>
            <Grid container spacing={2}>
                {motoSpots.map((spot) => (
                    <Grid item key={spot._id} xs={6} sm={4} md={3} lg={2}>
                        <Card sx={{ backgroundColor: getSpotColor(spot.status), color: 'white' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <TwoWheelerIcon fontSize="large" />
                                <Typography variant="h6">{spot.spotIdentifier}</Typography>
                                <Typography variant="caption">{spot.status}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default DashboardPage;