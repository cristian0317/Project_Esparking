// /controllers/spotController.js
const ParkingSpot = require('../models/ParkingSpot');
const Parking = require('../models/Parking');

// --- Función para crear un nuevo lugar ---
exports.createSpot = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const organizationId = req.user.organization; 

    const parking = await Parking.findOne({ _id: parkingId, organization: organizationId });
    if (!parking) {
      return res.status(404).json({ message: 'El estacionamiento no fue encontrado o no pertenece a su organización.' });
    }

    const newSpot = new ParkingSpot({
      ...req.body,
      parking: parkingId,
      organization: organizationId, 
    });

    await newSpot.save();

    // Actualizamos el conteo en el estacionamiento principal
    await Parking.updateOne(
        { _id: parkingId },
        { $inc: { totalSpots: 1, availableSpots: 1 } } // Incrementa ambos contadores
    );

    res.status(201).json(newSpot.toObject());
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el lugar', error });
  }
};

// --- Función para obtener todos los lugares ---
exports.getSpotsByParking = async (req, res) => {
  try {
    const { parkingId } = req.params;
    const { search = '' } = req.query;
    const organizationId = req.user.organization;

    const parking = await Parking.findOne({ _id: parkingId, organization: organizationId });
    if (!parking) {
      return res.status(404).json({ message: 'Estacionamiento no encontrado.' });
    }
    const query = {
      parking: parkingId,
      organization: organizationId, 
      spotIdentifier: { $regex: search, $options: 'i' }
    };
    const spots = await ParkingSpot.find(query);
    res.status(200).json(spots);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los lugares', error });
  }
};

// --- Función para actualizar el estado de un lugar (CORREGIDA) ---
exports.updateSpotStatus = async (req, res) => {
    try {
        const { spotId } = req.params;
        const { status } = req.body;

        // Determine authorization context
        let query = { _id: spotId };
        if (req.esp32SpotId) {
            // If authenticated by ESP32 API key, ensure the spotId matches the authenticated spot
            if (req.esp32SpotId !== spotId) {
                return res.status(403).json({ message: 'No autorizado para actualizar este lugar con la API Key proporcionada.' });
            }
            // No need to add organization to query, as API key is tied to the spot itself
        } else if (req.user && req.user.organization) {
            // If authenticated by JWT, use user's organization
            query.organization = req.user.organization;
        } else {
            return res.status(401).json({ message: 'No autorizado. Se requiere autenticación.' });
        }

        if (!status || !['disponible', 'ocupado', 'mantenimiento', 'deshabilitado', 'reservado'].includes(status)) {
            return res.status(400).json({ message: 'El estado proporcionado no es válido.' });
        }

        const spotToUpdate = await ParkingSpot.findOne(query);
        if (!spotToUpdate) {
            return res.status(404).json({ message: 'Lugar no encontrado o no autorizado.' });
        }

        // Only update if the status has actually changed to avoid unnecessary database writes
        if (spotToUpdate.status === status) {
            return res.status(200).json(spotToUpdate.toObject());
        }

        spotToUpdate.status = status;
        const updatedSpot = await spotToUpdate.save();

        // --- LÓGICA DE CONTEO CORREGIDA ---
        // Volvemos a contar solo los lugares disponibles
        const parkingId = updatedSpot.parking;
        const availableSpotsCount = await ParkingSpot.countDocuments({ parking: parkingId, status: 'disponible' });
        // Actualizamos el parking
        await Parking.findByIdAndUpdate(parkingId, { availableSpots: availableSpotsCount });

        res.status(200).json(updatedSpot.toObject());
    } catch (error) {
        console.error("Error al actualizar estado:", error); // Añadimos un log para ver el error en la terminal
        res.status(500).json({ message: 'Error al actualizar el estado del lugar', error });
    }
};

// --- Función para eliminar un lugar ---
exports.deleteSpot = async (req, res) => {
    try {
        const { spotId } = req.params;
        const organizationId = req.user.organization;

        const spot = await ParkingSpot.findOne({ _id: spotId, organization: organizationId });
        if (!spot) {
            return res.status(404).json({ message: 'Lugar no encontrado o no pertenece a su organización.' });
        }

        const parkingId = spot.parking;
        await ParkingSpot.findByIdAndDelete(spotId); 

        // --- LÓGICA DE CONTEO CORREGIDA ---
        const totalSpotsCount = await ParkingSpot.countDocuments({ parking: parkingId });
        const availableSpotsCount = await ParkingSpot.countDocuments({ parking: parkingId, status: 'disponible' });
        
        await Parking.findByIdAndUpdate(parkingId, {
            availableSpots: availableSpotsCount,
            totalSpots: totalSpotsCount
        });

        res.status(200).json({ message: 'Lugar eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el lugar', error });
    }
};