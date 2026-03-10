import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel, TablePagination, Chip, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import vehicleService from '../services/vehicleService';

const VehiculosPage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Error para la página principal
    
    // Estados para el modal
    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState({ plate: '', type: 'carro', color: '', category: 'regular', status: 'activo' });
    const [modalError, setModalError] = useState(''); // <-- NUEVO ESTADO PARA EL ERROR DEL MODAL

    // Estados para búsqueda y paginación
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const fetchVehicles = useCallback(async () => {
        try {
            // No seteamos loading(true) para evitar parpadeo
            const response = await vehicleService.getVehicles(searchTerm);
            setVehicles(response.data);
        } catch (err) {
            setError('No se pudieron cargar los vehículos.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentVehicle({ plate: '', type: 'carro', color: '', category: 'regular', status: 'activo' });
        setModalError(''); // Limpiamos el error del modal al abrir
        setOpen(true);
    };

    const handleOpenEdit = (vehicle) => {
        setIsEditing(true);
        setCurrentVehicle(vehicle);
        setModalError(''); // Limpiamos el error del modal al abrir
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setModalError(''); // Limpiamos el error del modal al cerrar
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentVehicle(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async () => {
        setModalError(''); // Limpiamos errores previos del modal
        try {
            if (isEditing) {
                await vehicleService.updateVehicle(currentVehicle._id, currentVehicle);
            } else {
                await vehicleService.createVehicle(currentVehicle);
            }
            handleClose(); // Cierra el modal solo si es exitoso
            fetchVehicles(); // Recarga la lista
        } catch (err) {
            // Mostramos el error DENTRO del modal
            setModalError(err.response?.data?.message || 'Error al guardar el vehículo.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este vehículo?')) {
            try {
                await vehicleService.deleteVehicle(id);
                fetchVehicles();
            } catch (err) {
                setError('Error al eliminar el vehículo.'); // Error en la página principal
            }
        }
    };
    
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Registro de Vehículos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Registrar Vehículo
                </Button>
            </Box>
            
            <TextField label="Buscar por Placa" variant="outlined" fullWidth sx={{ mb: 2 }} onChange={(e) => setSearchTerm(e.target.value)} />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Placa</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Color</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {vehicles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((vehicle) => (
                                <TableRow key={vehicle._id}>
                                    <TableCell>{vehicle.plate}</TableCell>
                                    <TableCell>{vehicle.type}</TableCell>
                                    <TableCell>{vehicle.color}</TableCell>
                                    <TableCell>{vehicle.category}</TableCell>
                                    <TableCell>
                                        <Chip label={vehicle.status} color={vehicle.status === 'activo' ? 'success' : 'default'} size="small" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton onClick={() => handleOpenEdit(vehicle)}><EditIcon fontSize="small" /></IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton onClick={() => handleDelete(vehicle._id)} color="secondary"><DeleteIcon fontSize="small" /></IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={vehicles.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </Paper>

            {/* --- MODAL ACTUALIZADO --- */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}</DialogTitle>
                <DialogContent>
                    {/* --- AQUÍ SE MUESTRA EL ERROR --- */}
                    {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}

                    <TextField autoFocus margin="dense" name="plate" label="Placa" type="text" fullWidth variant="standard" value={currentVehicle.plate} inputProps={{ 
        maxLength: 7, // Límite de caracteres
        style: { textTransform: 'uppercase' } // Opcional: lo pone en mayúsculas mientras escribe
    }} onChange={(e) => {
        // Filtra caracteres no deseados
        const upperCaseValue = e.target.value.toUpperCase();
        const filteredValue = upperCaseValue.replace(/[^A-Z0-9]/g, '');
        handleInputChange({ target: { name: 'plate', value: filteredValue } });
    }} disabled={isEditing} 
                    
                    />
                    <TextField margin="dense" name="color" label="Color" type="text" fullWidth variant="standard" value={currentVehicle.color} onChange={handleInputChange} />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Tipo de Vehículo</InputLabel>
                        <Select name="type" value={currentVehicle.type} onChange={handleInputChange}>
                            <MenuItem value="carro">Carro</MenuItem>
                            <MenuItem value="moto">Moto</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Categoría</InputLabel>
                        <Select name="category" value={currentVehicle.category} onChange={handleInputChange}>
                            <MenuItem value="regular">Regular</MenuItem>
                            <MenuItem value="vip">VIP</MenuItem>
                            <MenuItem value="residente">Residente</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Estado</InputLabel>
                        <Select name="status" value={currentVehicle.status} onChange={handleInputChange}>
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                        </Select>
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

export default VehiculosPage;