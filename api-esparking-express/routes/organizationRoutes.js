const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');
const { protect } = require('../middleware/authMiddleware'); // Solo necesitamos 'protect'

// Definimos la ruta GET /api/organizations/:id
// 'protect' asegura que el usuario esté logueado
// NOTA: No lleva 'protect' para que puedas crear la primera organización.
//post agregado por cris para agregar la primera organizacion
router.post('/', organizationController.createOrganization);

router.get('/:id', protect, organizationController.getOrganizationById);

module.exports = router;