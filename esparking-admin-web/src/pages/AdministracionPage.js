import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, CircularProgress, Alert, Card, CardContent, Grid, TextField, Button, Paper, Select, MenuItem, FormControl, InputLabel, Chip } from '@mui/material';
import { DataGrid, GridToolbarContainer, GridToolbarExport } from '@mui/x-data-grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import reportService from '../services/reportService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import PeopleIcon from '@mui/icons-material/People';
import TimerIcon from '@mui/icons-material/Timer';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Componente para las Tarjetas de Indicadores (KPIs) ---
const KpiCard = ({ title, value, unit = '', isCurrency = false, icon }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Box sx={{ flexShrink: 0, mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="h5" component="div" fontWeight="fontWeightBold">
                    {isCurrency && '$'}{value} <Typography variant="body2" component="span">{unit}</Typography>
                </Typography>
                <Typography color="text.secondary" variant="caption">{title}</Typography>
            </Box>
        </CardContent>
    </Card>
);

// --- Componente para las Gráficas de Barras ---
const RevenueChart = ({ data = {}, title, color }) => {
    const labels = Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1));
    const chartData = {
        labels,
        datasets: [{
            label: 'Ingresos',
            data: Object.values(data),
            backgroundColor: color,
            borderColor: color.replace('0.7', '1'),
            borderWidth: 1,
            borderRadius: 4,
        }]
    };
    const options = {
        indexAxis: 'y',
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: title, color: '#FFFFFF', font: { size: 14 } }
        },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: '#FFFFFF' } },
            x: { grid: { display: false }, ticks: { color: '#FFFFFF' } }
        }
    };
    return <Box sx={{ height: 180 }}><Bar data={chartData} options={options} /></Box>;
};

// --- Componente para el Botón de Exportar ---
function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <GridToolbarExport
        csvOptions={{
          fileName: 'reporte_esparking.csv',
          utf8WithBom: true,
        }}
        printOptions={{ disableToolbarButton: true }}
      />
    </GridToolbarContainer>
  );
}

// --- Componente Principal de la Página ---
const AdministracionPage = () => {
    const [reportData, setReportData] = useState({ 
        entries: [], 
        kpis: { 
            totalVehicles: 0, 
            averageStay: 0, 
            totalRevenue: 0,
            revenueByCategory: {}, 
            revenueBySpotType: {} 
        } 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ 
        startDate: null, 
        endDate: null, 
        plate: '', 
        vehicleType: 'todos', 
        category: 'todos' 
    });

    const fetchReport = useCallback(async (currentFilters) => {
        try {
            // No seteamos loading a true aquí para evitar parpadeo en filtros
            const apiFilters = { ...currentFilters };
            if (apiFilters.startDate) apiFilters.startDate = apiFilters.startDate.toISOString();
            if (apiFilters.endDate) {
                const endOfDay = new Date(apiFilters.endDate);
                endOfDay.setHours(23, 59, 59, 999);
                apiFilters.endDate = endOfDay.toISOString();
            }
            const response = await reportService.getAdvancedReport(apiFilters);
            setReportData(response.data);
        } catch (err) {
            setError('No se pudo cargar el reporte.');
            console.error("Error al cargar reporte:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReport(filters);
    }, [fetchReport, filters]);

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleDateChange = (name, date) => setFilters(prev => ({ ...prev, [name]: date }));
    const handleApplyFilters = () => {
        setLoading(true);
        fetchReport(filters);
    };
    
    const handlePrintTicket = (ticket) => {
        if (!ticket) return;

        // --- LÓGICA CORREGIDA ---
        // Ahora podemos acceder a ticket.parking.name y .address
        const parkingName = ticket.parking?.name || 'Estacionamiento';
        const parkingAddress = ticket.parking?.address || 'Dirección no disponible';

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        
        // --- TÍTULO CORREGIDO ---
        doc.text(`Ticket - ${parkingName}`, pageWidth / 2, 20, { align: 'center' });
        
        autoTable(doc, {
            startY: 30,
            head: [['Concepto', 'Información']],
            body: [
                ['Folio', ticket.folio || 'N/A'],
                ['Fecha y Hora', new Date(ticket.checkInTime).toLocaleString('es-MX')],
                ['Placa', ticket.plate],
                // --- DIRECCIÓN CORREGIDA ---
                ['Dirección', `${parkingAddress}`],
            ],
            theme: 'striped',
            headStyles: { fillColor: [44, 62, 80] },
        });

        const finalY = doc.lastAutoTable.finalY;

        // --- (Resto de la función: PIN y footer) ---
        doc.setFontSize(14);
        doc.text("PIN de Salida:", pageWidth / 2, finalY + 15, { align: 'center' });
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(211, 47, 47);
        doc.text(ticket.pin || 'N/A', pageWidth / 2, finalY + 25, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text("Este es un comprobante de una visita completada.", pageWidth / 2, finalY + 35, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("© 2025 SnowSoft. Todos los derechos reservados.", pageWidth / 2, finalY + 45, { align: 'center' });

        doc.save(`ticket-folio-${ticket.folio}.pdf`);
    };

    const columns = [
        { 
            field: 'folio', 
            headerName: 'Folio', 
            flex: 0.6, 
            minWidth: 90,
            renderCell: (params) => (
                <strong>{params.value}</strong> // Lo ponemos en negrita
            )
        },
        { field: 'plate', headerName: 'Placa', flex: 0.7, minWidth: 100 },
        { field: 'spotType', headerName: 'Tipo', flex: 0.6, minWidth: 90, valueGetter: (value, row) => row.spot?.spotType, renderCell: (params) => params.value ? <Chip label={params.value} size="small" /> : '' },
        { field: 'vehicleCategory', headerName: 'Categoría', flex: 0.8, minWidth: 110, valueGetter: (value, row) => row.vehicleCategory, renderCell: (params) => params.value ? <Chip label={params.value} size="small" variant="outlined" /> : <Chip label="N/A" size="small" variant="outlined" /> },
        { field: 'checkInTime', headerName: 'Entrada', flex: 1, minWidth: 160, valueGetter: (value, row) => new Date(row.checkInTime).toLocaleString('es-MX') },
        { field: 'checkOutTime', headerName: 'Salida', flex: 1, minWidth: 160, valueGetter: (value, row) => new Date(row.checkOutTime).toLocaleString('es-MX') },
        { field: 'totalMinutes', headerName: 'Minutos', type: 'number', flex: 0.5, minWidth: 90 },
        { field: 'totalCost', headerName: 'Costo', type: 'number', flex: 0.6, minWidth: 100, valueGetter: (value, row) => `$${row.totalCost.toFixed(2)}` },
        {
            field: 'actions',
            headerName: 'Ticket',
            flex: 0.7,
            minWidth: 120,
            sortable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    olor="primary"
                    size="small"
                    onClick={() => handlePrintTicket(params.row)}
                    disabled={!params.row.folio} // Deshabilita si no hay folio/pin
                >
                    Ver Ticket
                </Button>
            )
        }
    ];

    if (loading && !reportData.entries.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box>
                <Typography variant="h4" gutterBottom>Panel de Administración</Typography>
                
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md><DatePicker label="Fecha Inicio" value={filters.startDate} onChange={(date) => handleDateChange('startDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} /></Grid>
                        <Grid item xs={12} sm={6} md><DatePicker label="Fecha Fin" value={filters.endDate} onChange={(date) => handleDateChange('endDate', date)} slotProps={{ textField: { fullWidth: true, size: 'small' } }} /></Grid>
                        <Grid item xs={12} sm={4} md><FormControl fullWidth size="small"><InputLabel>Tipo</InputLabel><Select name="vehicleType" value={filters.vehicleType} label="Tipo" onChange={handleFilterChange}><MenuItem value="todos">Todos</MenuItem><MenuItem value="carro">Carro</MenuItem><MenuItem value="moto">Moto</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={4} md><FormControl fullWidth size="small"><InputLabel>Categoría</InputLabel><Select name="category" value={filters.category} label="Categoría" onChange={handleFilterChange}><MenuItem value="todos">Todos</MenuItem><MenuItem value="regular">Regular</MenuItem><MenuItem value="vip">VIP</MenuItem><MenuItem value="residente">Residente</MenuItem></Select></FormControl></Grid>
                        <Grid item xs={12} sm={4} md><TextField label="Placa" name="plate" value={filters.plate} onChange={handleFilterChange} fullWidth size="small" /></Grid>
                        <Grid item xs={12} sm={12} md="auto"><Button variant="contained" onClick={handleApplyFilters} fullWidth>Filtrar</Button></Grid>
                    </Grid>
                </Paper>

                {error && <Alert severity="error">{error}</Alert>}

                <Grid container spacing={3}>
                    {/* --- COLUMNA IZQUIERDA (TABLA) --- */}
                    <Grid item xs={12} lg={8}>
                        <Paper sx={{ height: 700, width: '100%' }}>
                            <DataGrid
                                rows={reportData.entries || []}
                                columns={columns}
                                getRowId={(row) => row._id}
                                loading={loading}
                                slots={{ toolbar: CustomToolbar }}
                                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                                pageSizeOptions={[10, 25, 50]}
                            />
                        </Paper>
                    </Grid>

                    {/* --- COLUMNA DERECHA (RESÚMENES) --- */}
                    <Grid item xs={12} lg={4}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} lg={12}>
                                <KpiCard title="Vehículos Atendidos" value={reportData.kpis?.totalVehicles || 0} icon={<PeopleIcon color="secondary" fontSize="large" />} />
                            </Grid>
                             <Grid item xs={12} sm={6} lg={12}>
                                <KpiCard title="Tiempo Promedio" value={reportData.kpis?.averageStay?.toFixed(0) || 0} unit="min" icon={<TimerIcon color="secondary" fontSize="large" />} />
                            </Grid>
                            <Grid item xs={12} sm={12} lg={12}>
                                <KpiCard title="Ingresos del Periodo" value={reportData.kpis?.totalRevenue?.toFixed(2) || '0.00'} isCurrency={true} icon={<AttachMoneyIcon color="secondary" fontSize="large" />} />
                            </Grid>
                            <Grid item xs={12} sm={6} lg={12}>
                                <Card><CardContent><RevenueChart data={reportData.kpis?.revenueByCategory} title="Ingresos por Categoría" color="rgba(211, 47, 47, 0.7)" /></CardContent></Card>
                            </Grid>
                             <Grid item xs={12} sm={6} lg={12}>
                                <Card><CardContent><RevenueChart data={reportData.kpis?.revenueBySpotType} title="Ingresos por Tipo de Lugar" color="rgba(158, 158, 158, 0.7)" /></CardContent></Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default AdministracionPage;