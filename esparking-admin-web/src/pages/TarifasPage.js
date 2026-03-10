import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel, Switch, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import rateService from '../services/rateService';

const TarifasPage = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentRate, setCurrentRate] = useState({ vehicleType: 'carro', rateType: 'por_hora', amount: 0, isActive: true });

    const fetchRates = useCallback(async () => {
        try {
            setLoading(true);
            const response = await rateService.getRates();
            setRates(response.data);
        } catch (err) {
            setError('No se pudieron cargar las tarifas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRates();
    }, [fetchRates]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentRate({ vehicleType: 'carro', rateType: 'por_hora', amount: 0, isActive: true });
        setOpen(true);
    };

    const handleOpenEdit = (rate) => {
        setIsEditing(true);
        setCurrentRate(rate);
        setOpen(true);
    };

    const handleClose = () => setOpen(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCurrentRate(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await rateService.updateRate(currentRate._id, currentRate);
            } else {
                await rateService.createRate(currentRate);
            }
            handleClose();
            fetchRates();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar la tarifa.');
        }
    };

    const handleDelete = async (id) => {
        // Lógica para eliminar...
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Tarifas</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Nueva Tarifa
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Tipo Vehículo</TableCell>
                                <TableCell>Tipo Cobro</TableCell>
                                <TableCell>Monto</TableCell>
                                <TableCell>Activa</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rates.map((rate) => (
                                <TableRow key={rate._id}>
                                    <TableCell>{rate.vehicleType}</TableCell>
                                    <TableCell>{rate.rateType}</TableCell>
                                    <TableCell>${parseFloat(rate.amount).toFixed(2)}</TableCell>
                                    <TableCell>{rate.isActive ? 'Sí' : 'No'}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenEdit(rate)}><EditIcon fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton onClick={() => handleDelete(rate._id)} color="secondary"><DeleteIcon fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Editar Tarifa' : 'Crear Nueva Tarifa'}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Tipo de Vehículo</InputLabel>
                        <Select name="vehicleType" value={currentRate.vehicleType} onChange={handleInputChange} disabled={isEditing}>
                            <MenuItem value="carro">Carro</MenuItem>
                            <MenuItem value="moto">Moto</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Tipo de Cobro</InputLabel>
                        <Select name="rateType" value={currentRate.rateType} onChange={handleInputChange}>
                            <MenuItem value="por_hora">Por Hora</MenuItem>
                            <MenuItem value="por_minuto">Por Minuto</MenuItem>
                            <MenuItem value="tarifa_fija">Tarifa Fija</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField margin="dense" name="amount" label="Monto" type="number" fullWidth variant="standard" value={currentRate.amount} onChange={handleInputChange} />
                    <FormControl fullWidth margin="dense">
                        <Typography component="label" variant="body2">Activa</Typography>
                        <Switch name="isActive" checked={currentRate.isActive} onChange={handleInputChange} />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}variant="text" color="inherit">Cancelar</Button>
                    <Button onClick={handleSubmit}variant="contained" color="primary">Guardar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TarifasPage;