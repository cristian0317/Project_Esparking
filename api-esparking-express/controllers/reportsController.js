const ParkingEntry = require('../models/ParkingEntry');
const ParkingSpot = require('../models/ParkingSpot');
const Vehicle = require('../models/Vehicle');

// --- Resumen Financiero (para 'IngresosPage') ---
exports.getFinancialSummary = async (req, res) => {
    try {
        const organizationId = req.user.organization; // <-- FILTRO AÑADIDO
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - today.getDay());

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Filtro base que se aplica a todas las consultas
        const matchFilter = { status: 'completed', organization: organizationId };

        const todayIncome = await ParkingEntry.aggregate([
            { $match: { ...matchFilter, checkOutTime: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ]);

        const weekIncome = await ParkingEntry.aggregate([
            { $match: { ...matchFilter, checkOutTime: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ]);

        const monthIncome = await ParkingEntry.aggregate([
            { $match: { ...matchFilter, checkOutTime: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$totalCost' } } }
        ]);
        
        const avgTicket = await ParkingEntry.aggregate([
            { $match: matchFilter },
            { $group: { _id: null, avg: { $avg: '$totalCost' } } }
        ]);

        res.status(200).json({
            today: todayIncome[0]?.total || 0,
            week: weekIncome[0]?.total || 0,
            month: monthIncome[0]?.total || 0,
            average: avgTicket[0]?.avg || 0,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error al generar el resumen financiero', error });
    }
};

// --- Reporte Diario (para 'IngresosPage') ---
exports.getDailyRevenue = async (req, res) => {
    try {
        const organizationId = req.user.organization; // <-- FILTRO AÑADIDO
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const revenue = await ParkingEntry.aggregate([
            { $match: { status: 'completed', organization: organizationId, checkOutTime: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$checkOutTime" } },
                    total: { $sum: '$totalCost' }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.status(200).json(revenue);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener ingresos diarios', error });
    }
};

// --- Reporte Avanzado (para 'AdministracionPage') ---
exports.getAdvancedReport = async (req, res) => {
    try {
        const { startDate, endDate, vehicleType, category, plate } = req.query;
        const organizationId = req.user.organization; // <-- FILTRO AÑADIDO

        // Filtro base que incluye la organización
        const matchQuery = { status: 'completed', organization: organizationId };
        
        if (startDate && endDate) {
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            matchQuery.checkOutTime = { $gte: new Date(startDate), $lte: endOfDay };
        }
        if (plate) {
            matchQuery.plate = { $regex: plate, $options: 'i' };
        }
        
        let aggregationPipeline = [
            { $match: matchQuery },
            { $lookup: { from: 'parkingspots', localField: 'spot', foreignField: '_id', as: 'spotDetails' } },
            { $unwind: { path: '$spotDetails', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'vehicles', localField: 'plate', foreignField: 'plate', as: 'vehicleDetails' } },
            { $unwind: { path: '$vehicleDetails', preserveNullAndEmptyArrays: true } },
            
            // --- ESTE ES EL BLOQUE QUE FALTABA ---
            { 
                $lookup: { 
                    from: 'parkings', // La colección de estacionamientos
                    localField: 'spotDetails.parking', // El campo de ID en spotDetails
                    foreignField: '_id', // El campo de ID en parkings
                    as: 'parkingDetails' // El nuevo array
                } 
            },
            { $unwind: { path: '$parkingDetails', preserveNullAndEmptyArrays: true } },
            // ------------------------------------
        ];

        if (vehicleType && vehicleType !== 'todos') {
            aggregationPipeline.push({ $match: { 'spotDetails.spotType': vehicleType } });
        }
        if (category && category !== 'todos') {
            aggregationPipeline.push({ $match: { 'vehicleDetails.category': category } });
        }
        
        aggregationPipeline.push({
            $project: {
                _id: 1, plate: 1, checkInTime: 1, checkOutTime: 1, totalMinutes: 1, totalCost: 1,
                folio: 1, 
                pin: 1,
                spot: '$spotDetails',
                vehicleCategory: '$vehicleDetails.category',
                parking: '$parkingDetails' // <-- AHORA AÑADIMOS EL OBJETO PARKING
            }
        });
        aggregationPipeline.push({ $sort: { checkOutTime: -1 } });
        
        const entries = await ParkingEntry.aggregate(aggregationPipeline);
        
        // --- CÁLCULOS DE KPIs ---
        const totalVehicles = entries.length;
        const totalMinutesSum = entries.reduce((acc, entry) => acc + (entry.totalMinutes || 0), 0);
        const averageStay = totalVehicles > 0 ? (totalMinutesSum / totalVehicles) : 0;
        const totalRevenue = entries.reduce((acc, entry) => acc + (entry.totalCost || 0), 0);
        
        const revenueByCategory = entries.reduce((acc, entry) => {
            const categoryKey = entry.vehicleCategory || 'Regular';
            acc[categoryKey] = (acc[categoryKey] || 0) + entry.totalCost;
            return acc;
        }, {});
        
        const revenueBySpotType = entries.reduce((acc, entry) => {
            const spotTypeKey = entry.spot?.spotType || 'N/A';
            acc[spotTypeKey] = (acc[spotTypeKey] || 0) + entry.totalCost;
            return acc;
        }, {});

        res.status(200).json({
            entries: entries,
            kpis: { totalVehicles, averageStay, totalRevenue, revenueByCategory, revenueBySpotType }
        });

    } catch (error) {
        console.log("--- ERROR EN REPORTE AVANZADO ---");
        console.log(error);
        res.status(500).json({ message: 'Error al generar el reporte avanzado', error });
    }
};