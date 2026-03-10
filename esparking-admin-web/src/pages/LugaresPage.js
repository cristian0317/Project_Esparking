import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel, Tooltip, TablePagination, Menu } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import parkingService from '../services/parkingService';

const LugaresPage = () => {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [newSpotType, setNewSpotType] = useState('carro');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    // --- LÓGICA DINÁMICA ---
    const [parkingId, setParkingId] = useState(null); 

    const fetchSpots = useCallback(async (id) => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await parkingService.getSpotsForParking(id, searchTerm);
            setSpots(response.data);
            setError('');
        } catch (err) {
            setError('No se pudieron cargar los lugares.');
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        const loadParkingInfo = async () => {
            try {
                const response = await parkingService.getMyParking();
                const id = response.data._id;
                setParkingId(id);
                fetchSpots(id);
            } catch (err) {
                setError('No se encontró un estacionamiento para tu organización.');
                setLoading(false);
            }
        };
        loadParkingInfo();
    }, [fetchSpots]);
    // -----------------------

    const handleMenuOpen = (event, spot) => {
        setAnchorEl(event.currentTarget);
        setSelectedSpot(spot);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedSpot(null);
    };

    const handleStatusChange = async (newStatus) => {
        if (!selectedSpot) return;
        try {
            await parkingService.updateSpotStatus(selectedSpot._id, newStatus);
            fetchSpots(parkingId); // Usa el ID dinámico
        } catch (err) {
            setError(`Error al cambiar el estado del lugar ${selectedSpot.spotIdentifier}.`);
        }
        handleMenuClose();
    };
    
    const nextSpotNumbers = useMemo(() => {
        const carSpots = spots.filter(s => s.spotType === 'carro');
        const motoSpots = spots.filter(s => s.spotType === 'moto');
        const carNumbers = carSpots.map(s => parseInt(s.spotIdentifier.substring(1), 10)).filter(n => !isNaN(n));
        const motoNumbers = motoSpots.map(s => parseInt(s.spotIdentifier.substring(1), 10)).filter(n => !isNaN(n));
        const nextCarNumber = carNumbers.length > 0 ? Math.max(...carNumbers) + 1 : 1;
        const nextMotoNumber = motoNumbers.length > 0 ? Math.max(...motoNumbers) + 1 : 1;
        return { carro: nextCarNumber, moto: nextMotoNumber };
    }, [spots]); // Esta advertencia de 'spots' está bien, la lógica es correcta.

    const handleOpen = () => { setOpen(true); }; // <-- 'setOpen' se usa aquí
    const handleClose = () => { setOpen(false); }; // <-- 'setOpen' se usa aquí

    const handleSubmit = async () => {
        if (!parkingId) return;
        try {
            const identifierPrefix = newSpotType === 'carro' ? 'C' : 'M';
            const identifierNumber = nextSpotNumbers[newSpotType];
            const finalIdentifier = `${identifierPrefix}${identifierNumber}`;
            const spotData = { spotIdentifier: finalIdentifier, spotType: newSpotType };
            await parkingService.createSpot(parkingId, spotData);
            handleClose();
            fetchSpots(parkingId);
        } catch (err) {
            setError('Error al crear el lugar.');
        }
    };
    
    const handleDelete = async (spotId) => {
        if(window.confirm('¿Estás seguro de que quieres eliminar este lugar?')){
            try {
                await parkingService.deleteSpot(spotId);
                fetchSpots(parkingId);
            } catch (err) {
                setError('Error al eliminar el lugar.');
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
                <Typography variant="h4">Administrar Lugares</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpen} disabled={!parkingId}>
                    Agregar Lugar
                </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>
                Desde aquí puedes gestionar todos los cajones de estacionamiento. Usa la búsqueda para encontrar un lugar específico o cambia su estado desde el menú de acciones.
            </Typography>

            <TextField 
                label="Buscar por Identificador" 
                variant="outlined" 
                fullWidth 
                sx={{ mb: 2 }} 
                onChange={(e) => setSearchTerm(e.target.value)}
                onBlur={() => fetchSpots(parkingId)}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Identificador</TableCell>
                                <TableCell>Tipo</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {spots.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((spot) => (
                                <TableRow key={spot._id}>
                                    <TableCell>{spot.spotIdentifier}</TableCell>
                                    <TableCell>{spot.spotType}</TableCell>
                                    <TableCell>{spot.status}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Más opciones">
                                            <span>
                                                <IconButton onClick={(e) => handleMenuOpen(e, spot)} disabled={spot.status === 'ocupado'}>
                                                    <MoreVertIcon />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <span>
                                                <IconButton onClick={() => handleDelete(spot._id)} color="secondary" disabled={spot.status === 'ocupado'}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </span>
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
                    count={spots.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:"
                />
            </Paper>

            {/* --- ESTE CÓDIGO FALTABA --- */}
            <Menu anchorEl={anchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                {selectedSpot?.status !== 'disponible' && <MenuItem onClick={() => handleStatusChange('disponible')}>Marcar como Disponible</MenuItem>}
                {selectedSpot?.status !== 'deshabilitado' && <MenuItem onClick={() => handleStatusChange('deshabilitado')}>Deshabilitar</MenuItem>}
                {selectedSpot?.status !== 'mantenimiento' && <MenuItem onClick={() => handleStatusChange('mantenimiento')}>Poner en Mantenimiento</MenuItem>}
            </Menu>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Agregar Nuevo Lugar</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        Se creará el siguiente lugar: 
                        <strong>
                            {newSpotType === 'carro' ? ` C${nextSpotNumbers.carro}` : ` M${nextSpotNumbers.moto}`}
                        </strong>
                    </Typography>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Tipo</InputLabel>
                        <Select name="spotType" value={newSpotType} label="Tipo" onChange={(e) => setNewSpotType(e.target.value)}>
                            <MenuItem value="carro">Carro</MenuItem>
                            <MenuItem value="moto">Moto</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}variant="text" color="inherit">Cancelar</Button>
                    <Button onClick={handleSubmit}variant="contained" color="primary">Agregar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LugaresPage;