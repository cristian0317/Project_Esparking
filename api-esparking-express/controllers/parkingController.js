const Parking = require('../models/Parking');
const ParkingSpot = require('../models/ParkingSpot'); // ← AGREGADO

// --- Función para crear un nuevo estacionamiento (CORREGIDA) ---
exports.createParking = async (req, res) => {
  try {
    // 1. Obtenemos el ID de la organización del usuario que está haciendo la petición
    const organizationId = req.user.organization;

    // 2. Creamos el nuevo estacionamiento combinando los datos del body Y el ID de la organización
    const newParking = new Parking({
      ...req.body,
      organization: organizationId 
    });
    
    await newParking.save();
    res.status(201).json(newParking.toObject());
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error al registrar el estacionamiento', error });
  }
};

// --- Función para obtener todos los estacionamientos (FILTRADA) ---
exports.getAllParkings = async (req, res) => {
  try {
    // Filtramos para devolver solo los parkings de la organización del usuario
    const parkings = await Parking.find({ organization: req.user.organization });
    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los estacionamientos', error });
  }
};

// --- Función para obtener estacionamientos cercanos (FILTRADA) ---
exports.getNearbyParkings = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query; // Valor por defecto 5km
        if (!lat || !lng) {
            return res.status(400).json({ message: 'Se requieren latitud y longitud.' });
        }
        
        const parkings = await Parking.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance) // Usa el valor del frontend
                }
            }
        });
        res.status(200).json(parkings);
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar estacionamientos cercanos', error });
    }
};

exports.getMyParking = async (req, res) => {
  try {
    const parking = await Parking.findOne({ organization: req.user.organization });
    if (!parking) {
      return res.status(404).json({ message: 'No se encontró un estacionamiento para su organización.' });
    }
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el estacionamiento', error });
  }
};

// --- NUEVA FUNCIÓN PARA APP MÓVIL (AGREGADA AL FINAL) ---
exports.getParkingsForMobile = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 20000 } = req.query; // 20km por defecto
        
        let filter = {};
        
        // Si vienen coordenadas, filtrar por ubicación
        if (lat && lng) {
            filter.location = {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            };
        }
        
        const parkings = await Parking.find(filter);
        
        // CONSULTAR DATOS REALES DE SPOTS - CAMBIO REALIZADO
        const parkingsForMobile = await Promise.all(
            parkings.map(async (parking) => {
                // CONSULTAR TODOS LOS SPOTS DE ESTE ESTACIONAMIENTO
                const spots = await ParkingSpot.find({ parking: parking._id });
                
                // CONTAR CARROS REALES
                const carSpots = spots.filter(spot => spot.spotType === 'carro');
                const carsTotal = carSpots.length;
                const carsAvailable = carSpots.filter(spot => spot.status === 'disponible').length;
                
                // CONTAR MOTOS REALES  
                const motorcycleSpots = spots.filter(spot => spot.spotType === 'moto');
                const motorcyclesTotal = motorcycleSpots.length;
                const motorcyclesAvailable = motorcycleSpots.filter(spot => spot.status === 'disponible').length;
                
                return {
                    _id: parking._id,
                    name: parking.name,
                    address: parking.address,
                    location: parking.location,
                    availability: {
                        cars: {
                            total: carsTotal,
                            available: carsAvailable
                        },
                        motorcycles: {
                            total: motorcyclesTotal,
                            available: motorcyclesAvailable
                        }
                    }
                };
            })
        );

        res.status(200).json(parkingsForMobile);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estacionamientos para móvil', error });
    }
};