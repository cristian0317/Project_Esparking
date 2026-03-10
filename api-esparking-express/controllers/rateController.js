const Rate = require('../models/Rate');

// --- Obtener todas las tarifas DE MI ORGANIZACIÓN ---
exports.getRates = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        const rates = await Rate.find({ organization: organizationId });
        res.status(200).json(rates);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener las tarifas', error });
    }
};

// --- Crear una nueva tarifa PARA MI ORGANIZACIÓN ---
exports.createRate = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        const newRate = new Rate({
            ...req.body,
            organization: organizationId // Asignamos la organización
        });
        await newRate.save();
        res.status(201).json(newRate);
    } catch (error) {
        if (error.code === 11000) { // Error de índice duplicado
            return res.status(400).json({ message: 'Ya existe una tarifa para este tipo de vehículo en su organización.' });
        }
        res.status(400).json({ message: 'Error al crear la tarifa', error });
    }
};

// --- Actualizar una tarifa DE MI ORGANIZACIÓN ---
exports.updateRate = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        // Buscamos la tarifa por ID y que pertenezca a la organización
        const rate = await Rate.findOne({ 
            _id: req.params.id, 
            organization: organizationId 
        });

        if (!rate) {
            return res.status(404).json({ message: 'Tarifa no encontrada o no pertenece a su organización.' });
        }

        // Actualizamos los campos
        rate.rateType = req.body.rateType || rate.rateType;
        rate.amount = req.body.amount || rate.amount;
        rate.isActive = req.body.isActive !== undefined ? req.body.isActive : rate.isActive;
        
        await rate.save();
        res.status(200).json(rate);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar la tarifa', error });
    }
};

// --- Eliminar una tarifa DE MI ORGANIZACIÓN ---
exports.deleteRate = async (req, res) => {
    try {
        const organizationId = req.user.organization;
        // Buscamos y eliminamos solo si coincide ID y organización
        const rate = await Rate.findOneAndDelete({ 
            _id: req.params.id, 
            organization: organizationId 
        });

        if (!rate) {
            return res.status(404).json({ message: 'Tarifa no encontrada o no pertenece a su organización.' });
        }
        res.status(200).json({ message: 'Tarifa eliminada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la tarifa', error });
    }
};