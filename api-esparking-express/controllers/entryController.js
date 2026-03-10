const ParkingEntry = require('../models/ParkingEntry');
const ParkingSpot = require('../models/ParkingSpot');
const Parking = require('../models/Parking');
const Rate = require('../models/Rate');
const Vehicle = require('../models/Vehicle');

// --- Función de Check-in (CORREGIDA) ---
exports.checkIn = async (req, res) => {
  try {
    const { plate, spotId } = req.body;
    const organizationId = req.user.organization;

    // --- (Validaciones de Vehículo, Lugar, Tipo, etc.) ---
    const vehicle = await Vehicle.findOne({ plate: plate.toUpperCase(), organization: organizationId });
    if (!vehicle) { return res.status(404).json({ message: `La placa ${plate.toUpperCase()} no está registrada.` }); }
    if (vehicle.status !== 'activo') { return res.status(400).json({ message: `El vehículo ${plate.toUpperCase()} no está activo.` }); }

    const spot = await ParkingSpot.findOne({ _id: spotId, organization: organizationId });
    if (!spot) { return res.status(404).json({ message: 'Lugar no encontrado o no pertenece a su organización.' }); }
    if (spot.status !== 'disponible') { return res.status(400).json({ message: 'El lugar seleccionado ya está ocupado.' }); }

    if (vehicle.type !== spot.spotType) { return res.status(400).json({ message: `Vehículo (${vehicle.type}) incompatible con lugar (${spot.spotType}).` }); }

    const existingActiveEntry = await ParkingEntry.findOne({ plate: plate.toUpperCase(), status: 'active', organization: organizationId });
    if (existingActiveEntry) { return res.status(400).json({ message: `La placa ${plate.toUpperCase()} ya tiene una entrada activa.` }); }

    // --- Lógica de Folio ---
    const parking = await Parking.findByIdAndUpdate(spot.parking, { $inc: { folioCounter: 1 } }, { new: true });
    if (!parking) { return res.status(404).json({ message: 'Estacionamiento padre no encontrado.' }); }
    const newFolioString = `${parking.folioPrefix}-${parking.folioCounter}`;
    
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    const newEntry = new ParkingEntry({
      folio: newFolioString,
      plate: plate.toUpperCase(),
      spot: spotId,
      parking: spot.parking,
      pin: pin,
      organization: organizationId,
      spotType: spot.spotType, 
      vehicleCategory: vehicle.category 
    });
    
    await newEntry.save();
    await ParkingSpot.findByIdAndUpdate(spotId, { status: 'ocupado' });
    
    const availableSpotsCount = await ParkingSpot.countDocuments({ parking: spot.parking, status: 'disponible' });
    await Parking.findByIdAndUpdate(spot.parking, { availableSpots: availableSpotsCount });

    // --- ESTA ES LA CORRECCIÓN ---
    // Usamos la sintaxis de objeto para poblar los campos
    const populatedEntry = await ParkingEntry.findById(newEntry._id)
                                .populate('spot', 'spotIdentifier')
                                .populate({ 
                                    path: 'parking', 
                                    select: 'name address' 
                                }); 

    res.status(201).json(populatedEntry.toObject());
  } catch (error) {
    console.error("Error en check-in:", error);
    res.status(500).json({ message: 'Error en el servidor durante el check-in', error });
  }
};

// --- Función de Check-out (Salida de vehículo) ---
exports.checkOut = async (req, res) => {
  try {
    const { plate } = req.params;
    const { pin } = req.body;
    const organizationId = req.user.organization;

    const entry = await ParkingEntry.findOne({ 
      plate: plate.toUpperCase(), 
      status: 'active',
      organization: organizationId 
    }).populate('spot');
    
    if (!entry) {
      return res.status(404).json({ message: 'No se encontró una entrada activa para esta placa en su organización.' });
    }

    if (entry.pin !== pin) {
        return res.status(401).json({ message: 'PIN de salida incorrecto.' });
    }

    const checkOutTime = new Date();
    const checkInTime = new Date(entry.checkInTime);
    const durationMs = checkOutTime - checkInTime;
    const totalMinutes = Math.ceil(durationMs / (1000 * 60));
    
    const vehicleType = entry.spot.spotType;
    const rate = await Rate.findOne({ vehicleType: vehicleType, isActive: true, organization: organizationId });
    
    let totalCost = 0;
    if (rate) {
        if (rate.rateType === 'por_minuto') {
            totalCost = totalMinutes * rate.amount;
        } else if (rate.rateType === 'por_hora') {
            const totalHours = Math.ceil(totalMinutes / 60);
            totalCost = totalHours * rate.amount;
        } else { // tarifa_fija
            totalCost = rate.amount;
        }
    } else {
        totalCost = totalMinutes * 0.5;
    }

    entry.checkOutTime = checkOutTime;
    entry.totalMinutes = totalMinutes;
    entry.totalCost = totalCost;
    entry.status = 'completed';
    await entry.save();

    await ParkingSpot.findByIdAndUpdate(entry.spot._id, { status: 'disponible' });

    const parkingId = entry.parking;
    const availableSpotsCount = await ParkingSpot.countDocuments({ parking: parkingId, status: 'disponible' });
    await Parking.findByIdAndUpdate(parkingId, { availableSpots: availableSpotsCount });

    res.status(200).json(entry.toObject());
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error en el check-out', error });
  }
};

// --- Función para obtener todas las entradas activas ---
exports.getActiveEntries = async (req, res) => {
  try {
    const entries = await ParkingEntry.find({ 
      status: 'active', 
      organization: req.user.organization
    })
      .populate('spot', 'spotIdentifier')
      .populate({ 
          path: 'parking', 
          select: 'name' 
      })
      .sort({ checkInTime: -1 });
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las entradas activas', error });
  }
};

// --- Función para obtener el historial de entradas completadas ---
exports.getCompletedEntries = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const query = { 
      status: 'completed',
      organization: req.user.organization,
      plate: { $regex: search, $options: 'i' }
    };

    const entries = await ParkingEntry.find(query)
      .sort({ checkOutTime: -1 })
      .populate('spot', 'spotIdentifier');
      
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial', error });
  }
};