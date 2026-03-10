import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Avatar } from '@mui/material';
import reportService from '../services/reportService';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
// --- IMPORTACIONES PARA LA GRÁFICA ---
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registramos los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Componente para cada tarjeta de indicador
const KpiCard = ({ title, value, icon, isCurrency = true }) => (
    <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mr: 2 }}>{icon}</Avatar>
            <Box>
                <Typography color="text.secondary">{title}</Typography>
                <Typography variant="h5" component="div" fontWeight="fontWeightBold">
                    {isCurrency ? `$${value.toFixed(2)}` : value}
                </Typography>
            </Box>
        </CardContent>
    </Card>
);

// Componente para la Gráfica
const IncomeChart = ({ data }) => {
    const chartData = {
        labels: data.map(d => new Date(d._id).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'Ingresos por Día',
                data: data.map(d => d.total),
                backgroundColor: 'rgba(211, 47, 47, 0.5)',
                borderColor: 'rgba(211, 47, 47, 1)',
                borderWidth: 1,
                hoverBackgroundColor: 'rgba(211, 47, 47, 0.8)',
                hoverBorderColor: 'rgba(211, 47, 47, 1)',
                maxBarThickness: 100,
                barPercentage: 0.5,
                categoryPercentage: 0.8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Ingresos de los Últimos 7 Días',
                color: '#FFFFFF'
            },
            tooltip: {
                backgroundColor: '#000000',
                titleColor: '#FFFFFF',
                bodyColor: '#FFFFFF',
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#FFFFFF'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#FFFFFF'
                }
            }
        }
    };

    return (
        <Box sx={{ height: '400px' }}>
            <Bar options={options} data={chartData} />
        </Box>
    );
};


const IngresosPage = () => {
    const [summary, setSummary] = useState(null);
    const [dailyData, setDailyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [summaryRes, dailyRes] = await Promise.all([
                    reportService.getFinancialSummary(),
                    reportService.getDailyRevenue()
                ]);
                setSummary(summaryRes.data);
                setDailyData(dailyRes.data);
            } catch (err) {
                setError('No se pudo cargar el resumen financiero.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>Resumen de Ingresos</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}><KpiCard title="Ingresos de Hoy" value={summary.today} icon={<CalendarTodayIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><KpiCard title="Ingresos de la Semana" value={summary.week} icon={<MonetizationOnIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><KpiCard title="Ingresos del Mes" value={summary.month} icon={<CalendarMonthIcon />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><KpiCard title="Ticket Promedio" value={summary.average} icon={<ReceiptLongIcon />} /></Grid>
            </Grid>
            
            <Card>
                <CardContent>
                    <IncomeChart data={dailyData} />
                </CardContent>
            </Card>
        </Box>
    );
};

export default IngresosPage;