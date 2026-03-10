const Vehicle = require('../models/Vehicle');

// --- Obtener todos los vehículos (de la organización) ---
exports.getVehicles = async (req, res) => {
    try {
        const { search = '' } = req.query;
        const query = {
            organization: req.user.organization, // Filtro por organización
            plate: { $regex: search, $options: 'i' }
        };
        const vehicles = await Vehicle.find(query);
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los vehículos', error });
    }
};

// --- Crear un nuevo vehículo (LÓGICA CORREGIDA) ---
exports.createVehicle = async (req, res) => {
    try {
        const { plate } = req.body;
        const organizationId = req.user.organization;

        // --- ESTA ES LA VALIDACIÓN CORRECTA ---
        // Buscamos si la placa ya existe SOLAMENTE DENTRO de la organización del usuario
        const existingVehicle = await Vehicle.findOne({ 
            plate: plate.toUpperCase(), 
            organization: organizationId 
        });
        
        if (existingVehicle) {
            return res.status(400).json({ message: 'Error de duplicado. Esta placa ya existe en su organización.' });
        }
        
        // Si no existe en su organización, la creamos
        const newVehicle = new Vehicle({
            ...req.body,
            organization: organizationId // Asignamos la organización
        });
        await newVehicle.save();
        res.status(201).json(newVehicle);
    } catch (error) {
        // Este error saltará si el nuevo "índice compuesto" falla
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Error de duplicado. Esta placa ya existe en su organización.' });
        }
        res.status(400).json({ message: 'Error al registrar el vehículo', error });
    }
};

// --- Actualizar un vehículo existente (de la organización) ---
exports.updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOne({ 
            _id: req.params.id, 
            organization: req.user.organization 
        });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehículo no encontrado o no pertenece a su organización' });
        }

        vehicle.color = req.body.color || vehicle.color;
        vehicle.type = req.body.type || vehicle.type;
        vehicle.category = req.body.category || vehicle.category;
        vehicle.status = req.body.status || vehicle.status;
        
        const updatedVehicle = await vehicle.save();
        res.status(200).json(updatedVehicle);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el vehículo', error });
    }
};

// --- Eliminar un vehículo (de la organización) ---
exports.deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findOneAndDelete({ 
            _id: req.params.id, 
            organization: req.user.organization 
        });

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehículo no encontrado o no pertenece a su organización' });
        }
        res.status(200).json({ message: 'Vehículo eliminado exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el vehículo', error });
    }
};