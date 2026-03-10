// En: controllers/organizationController.js

const Organization = require('../models/Organization'); // Ya la tienes

// --- Función para crear una nueva organización agregada por cris quitar si es necesario ---
exports.createOrganization = async (req, res) => {
    try {
        // Obtenemos los campos obligatorios del cuerpo de la petición (req.body)
        const { name, address, phone, email, logoUrl } = req.body;
        
        // Creamos la nueva organización usando el modelo
        const newOrganization = await Organization.create({ 
            name, 
            address, 
            phone, 
            email, 
            logoUrl 
        });
        
        // Enviamos una respuesta de éxito (201 Created)
        res.status(201).json(newOrganization);
        
    } catch (error) {
        // Si hay un error de validación (ej. falta el 'name'), devolvemos 400
        console.error('Error al crear organización:', error);
        res.status(400).json({ 
            message: 'Error al crear la organización.', 
            error: error.message 
        });
    }
};

// --- Tu función existente ---
exports.getOrganizationById = async (req, res) => {
    // ... (Tu código para getOrganizationById) ...
};