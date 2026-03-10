import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import entryService from '../services/entryService';
import parkingService from '../services/parkingService';
import vehicleService from '../services/vehicleService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../context/AuthContext';

// Componente auxiliar para el contenido de las pestañas
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

const EntradasPage = () => {
    const { user } = useAuth();
    const isAdminOrManager = user && (user.role === 'admin' || user.role === 'administracion');

    // Estados para los datos
    const [activeEntries, setActiveEntries] = useState([]);
    const [completedEntries, setCompletedEntries] = useState([]);
    
    // Estados de UI y de Carga
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tabValue, setTabValue] = useState(0);

    // Estados para el formulario de check-in
    const [plateInput, setPlateInput] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);
    const [vehicleType, setVehicleType] = useState(''); // <-- Esta variable ahora se usará
    
    // Estados para los datos de los autocompletables
    const [allSpots, setAllSpots] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    
    // Estados para los modales
    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [pinModalOpen, setPinModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);
    const [pinInput, setPinInput] = useState('');
    
    const [parkingId, setParkingId] = useState(null); 

    const fetchData = useCallback(async (id) => {
        if (!id) return; 
        try {
            const [entriesRes, spotsRes, vehiclesRes, historyRes] = await Promise.all([
                entryService.getActiveEntries(),
                parkingService.getSpotsForParking(id),
                vehicleService.getVehicles(),
                isAdminOrManager ? entryService.getCompletedEntries() : Promise.resolve({ data: [] }) 
            ]);
            
            setActiveEntries(entriesRes.data);
            setAllSpots(spotsRes.data);
            setAllVehicles(vehiclesRes.data.filter(v => v.status === 'activo'));
            
            if (isAdminOrManager) {
                setCompletedEntries(historyRes.data);
            }
        } catch (err) {
            setError('No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, [isAdminOrManager]); 

    useEffect(() => {
        const loadParkingInfo = async () => {
            try {
                const response = await parkingService.getMyParking();
                const id = response.data._id;
                setParkingId(id); 
                fetchData(id); 
            } catch (err) {
                setError('No se encontró un estacionamiento para tu organización.');
                setLoading(false);
            }
        };
        loadParkingInfo();
    }, [fetchData]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handlePlateChange = (event, newValue) => {
        setSelectedVehicle(newValue); // newValue es el objeto vehículo o null
        
        // --- LÓGICA QUE USA 'setVehicleType' ---
        setVehicleType(newValue ? newValue.type : ''); // <-- Se usa aquí
        // -------------------------------------
        
        setPlateInput(newValue ? newValue.plate : '');
        setSelectedSpot(null);
    };
    
    // Lógica para manejar el input de Autocomplete
    const handlePlateInputChange = (event, newInputValue) => {
         const plate = (newInputValue || '').toUpperCase();
         const filteredPlate = plate.replace(/[^A-Z0-9]/g, '').substring(0, 7);
         setPlateInput(filteredPlate);
         
         // Si el usuario borra el texto, reseteamos
         if (filteredPlate === '') {
             setSelectedVehicle(null);
             setVehicleType('');
         }
    };

    const handleCheckIn = async () => {
        if (!selectedVehicle || !selectedSpot) {
            setError('Por favor, selecciona un vehículo y un lugar.');
            return;
        }
        try {
            const response = await entryService.checkIn(selectedVehicle.plate, selectedSpot._id);
            setCurrentTicket(response.data);
            setTicketModalOpen(true);
            setSelectedVehicle(null);
            setSelectedSpot(null);
            setPlateInput(''); 
            setVehicleType('');
            fetchData(parkingId);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar la entrada.');
        }
    };

    const handleOpenPinModal = (entry) => {
        setCurrentTicket(entry);
        setPinModalOpen(true);
    };

    const handleCheckOut = async () => {
        if (!pinInput) {
            setError('Por favor, ingresa el PIN de salida.');
            return;
        }
        try {
            const response = await entryService.checkOut(currentTicket.plate, pinInput);
            setPinModalOpen(false);
            setPinInput('');
            const entryData = response.data;
            const checkIn = new Date(entryData.checkInTime).toLocaleTimeString('es-MX');
            const checkOut = new Date(entryData.checkOutTime).toLocaleTimeString('es-MX');
            alert(
              `Salida Registrada para ${entryData.plate}\n\n` +
              `Hora de Entrada: ${checkIn}\n` +
              `Hora de Salida: ${checkOut}\n` +
              `Tiempo Total: ${entryData.totalMinutes} minutos\n\n` +
              `TOTAL A COBRAR: $${entryData.totalCost.toFixed(2)}`
            );
            fetchData(parkingId);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al registrar la salida.');
        }
    };

    const handlePrintTicket = () => {
        if (!currentTicket) return;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(`Ticket de Entrada - ${currentTicket.parking?.name || 'ESParking'}`, pageWidth / 2, 20, { align: 'center' });
        autoTable(doc, {
            startY: 30,
            head: [['Concepto', 'Información']],
            body: [
                ['Folio', currentTicket.folio],
                ['Placa', currentTicket.plate],
                ['Fecha y Hora', new Date(currentTicket.checkInTime).toLocaleString('es-MX')],
                ['Estacionamiento', `${currentTicket.parking?.name} - ${currentTicket.parking?.address}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [44, 62, 80] },
        });
        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(14);
        doc.text("PIN de Salida:", pageWidth / 2, finalY + 15, { align: 'center' });
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(211, 47, 47);
        doc.text(currentTicket.pin, pageWidth / 2, finalY + 25, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Conserve este ticket. El PIN es necesario para registrar la salida.", pageWidth / 2, finalY + 35, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("© 2025 SnowSoft. Todos los derechos reservados.", pageWidth / 2, finalY + 45, { align: 'center' });
        doc.save(`ticket-folio-${currentTicket.folio}.pdf`);
    };

    // --- LÓGICA QUE USA 'vehicleType' ---
    const filteredAvailableSpots = allSpots.filter(spot => 
        spot.status === 'disponible' && 
        (!vehicleType || spot.spotType === vehicleType) // <-- Se usa aquí
    );

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="secondary" textColor="inherit">
                    <Tab label="Vehículos Activos" />
                    {isAdminOrManager && <Tab label="Historial de Salidas" />}
                </Tabs>
            </Box>

            {error && <Alert severity="error" sx={{ m: 3, mt: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <TabPanel value={tabValue} index={0}>
                <Card sx={{ mb: 4 }}>
                    <CardContent>
                        <Typography variant="h5" gutterBottom>Registrar Nueva Entrada</Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <Box sx={{ flex: '1 1 250px' }}>
                                <Autocomplete
                                    options={allVehicles}
                                    getOptionLabel={(option) => `${option.plate} (${option.category})`}
                                    value={selectedVehicle}
                                    onChange={handlePlateChange} // Llama a la función que usa setVehicleType
                                    inputValue={plateInput}
                                    onInputChange={handlePlateInputChange} // Llama a la función que usa setPlateInput
                                    renderInput={(params) => <TextField {...params} label="Placa (Vehículo Registrado)" />}
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 250px' }}>
                                <Autocomplete
                                    options={filteredAvailableSpots} // Usa la variable que depende de vehicleType
                                    getOptionLabel={(option) => `${option.spotIdentifier} (${option.spotType})`}
                                    value={selectedSpot}
                                    onChange={(event, newValue) => setSelectedSpot(newValue)}
                                    renderInput={(params) => <TextField {...params} label="Lugar" />}
                                    disabled={!selectedVehicle}
                                />
                            </Box>
                            <Box sx={{ flex: '1 1 120px' }}>
                                <Button variant="contained" fullWidth onClick={handleCheckIn} sx={{ height: '56px' }}>
                                    Registrar
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
                
                <Typography variant="h4" gutterBottom>Vehículos en el Estacionamiento</Typography>
                <Paper>
                    <TableContainer>
                         <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Folio</TableCell>
                                    <TableCell>Placa</TableCell>
                                    <TableCell>Lugar</TableCell>
                                    <TableCell>Hora de Entrada</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {activeEntries.map((entry) => (
                                    <TableRow key={entry._id}>
                                        <TableCell><strong>{entry.folio}</strong></TableCell>
                                        <TableCell>{entry.plate}</TableCell>
                                        <TableCell>{entry.spot?.spotIdentifier || 'N/A'}</TableCell>
                                        <TableCell>{new Date(entry.checkInTime).toLocaleString('es-MX')}</TableCell>
                                        <TableCell align="right">
                                            <Button variant="contained" color="secondary" onClick={() => handleOpenPinModal(entry)}>
                                                Registrar Salida
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </TabPanel>

            {isAdminOrManager && (
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h4" gutterBottom>Historial de Entradas y Salidas</Typography>
                    <Paper>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Folio</TableCell>
                                        <TableCell>Placa</TableCell>
                                        <TableCell>Lugar</TableCell>
                                        <TableCell>Entrada</TableCell>
                                        <TableCell>Salida</TableCell>
                                        <TableCell>Minutos</TableCell>
                                        <TableCell>Costo Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {completedEntries.map((entry) => (
                                        <TableRow key={entry._id}>
                                            <TableCell><strong>{entry.folio}</strong></TableCell>
                                            <TableCell>{entry.plate}</TableCell>
                                            <TableCell>{entry.spot?.spotIdentifier || 'N/A'}</TableCell>
                                            <TableCell>{new Date(entry.checkInTime).toLocaleString('es-MX')}</TableCell>
                                            <TableCell>{entry.checkOutTime ? new Date(entry.checkOutTime).toLocaleString('es-MX') : 'N/A'}</TableCell>
                                            <TableCell>{entry.totalMinutes}</TableCell>
                                            <TableCell>${entry.totalCost != null ? entry.totalCost.toFixed(2) : '0.00'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </TabPanel>
            )}
            
            <Dialog open={ticketModalOpen} onClose={() => setTicketModalOpen(false)}>
                <DialogTitle align="center">Ticket de Entrada</DialogTitle>
                <DialogContent dividers sx={{minWidth: 350}}>
                    <Typography gutterBottom><strong>Folio:</strong> {currentTicket?.folio}</Typography>
                    <Typography gutterBottom><strong>Fecha y Hora:</strong> {new Date(currentTicket?.checkInTime).toLocaleString('es-MX')}</Typography>
                    <Typography gutterBottom><strong>Placa:</strong> {currentTicket?.plate}</Typography>
                    <Typography variant="h3" align="center" color="secondary" sx={{ my: 2, fontWeight: 'bold' }}>{currentTicket?.pin}</Typography>
                    <Typography align="center" variant="body2">PIN de Salida</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTicketModalOpen(false)}variant="text" color="inherit">Cerrar</Button>
                    <Button variant="contained" onClick={handlePrintTicket} color="primary">Imprimir Ticket</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={pinModalOpen} onClose={() => setPinModalOpen(false)}>
                <DialogTitle>Confirmar Salida para {currentTicket?.plate}</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="PIN de Salida" type="text" fullWidth variant="standard" value={pinInput} onChange={(e) => setPinInput(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPinModalOpen(false)}variant="text" color="inherit">Cancelar</Button>
                    <Button onClick={handleCheckOut}variant="contained" color="primary">Registrar Salida</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EntradasPage;