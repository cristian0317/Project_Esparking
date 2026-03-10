import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, FormControl, InputLabel, Tooltip, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import userService from '../services/userService';

const UsuariosPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [open, setOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({ name: '', email: '', password: '', role: 'cajero' });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const response = await userService.getUsers();
            setUsers(response.data);
        } catch (err) {
            setError('No se pudieron cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleOpenCreate = () => {
        setIsEditing(false);
        setCurrentUser({ name: '', email: '', password: '', role: 'cajero' });
        setOpen(true);
    };
    const handleOpenEdit = (user) => {
        setIsEditing(true);
        setCurrentUser({ ...user, password: '' }); // Limpiamos el campo de contraseña
        setOpen(true);
    };
    const handleClose = () => setOpen(false);
    const handleInputChange = (e) => setCurrentUser(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async () => {
        try {
            if (isEditing) {
                await userService.updateUser(currentUser._id, currentUser);
            } else {
                await userService.createUser(currentUser);
            }
            handleClose();
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || 'Error al guardar el usuario.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
            try {
                await userService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                setError('Error al eliminar el usuario.');
            }
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4">Gestión de Usuarios</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Agregar Usuario
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Correo Electrónico</TableCell>
                                <TableCell>Rol</TableCell>
                                <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Chip label={user.role} size="small" /></TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar"><IconButton onClick={() => handleOpenEdit(user)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                                        <Tooltip title="Eliminar"><IconButton onClick={() => handleDelete(user._id)} color="secondary"><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" name="name" label="Nombre Completo" type="text" fullWidth variant="standard" value={currentUser.name} onChange={handleInputChange} />
                    <TextField margin="dense" name="email" label="Correo Electrónico" type="email" fullWidth variant="standard" value={currentUser.email} onChange={handleInputChange} disabled={isEditing} />
                    <TextField margin="dense" name="password" label={isEditing ? "Nueva Contraseña (opcional)" : "Contraseña"} type="password" fullWidth variant="standard" value={currentUser.password} onChange={handleInputChange} />
                    <FormControl fullWidth margin="dense" variant="standard">
                        <InputLabel>Rol</InputLabel>
                        <Select name="role" value={currentUser.role} onChange={handleInputChange}>
                            <MenuItem value="cajero">Cajero</MenuItem>
                            <MenuItem value="administracion">Administración</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
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

export default UsuariosPage;