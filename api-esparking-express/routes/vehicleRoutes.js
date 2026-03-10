const express = require('express');
const router = express.Router();
// Correcto con doble 'r'
const vehicleController = require('../controllers/vehicleController'); 
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    // Correcto con doble 'r'
    .get(protect, vehicleController.getVehicles) 
    // Correcto con doble 'r'
    .post(protect, authorize('cajero', 'admin'), vehicleController.createVehicle); 

router.route('/:id')
    // Correcto con doble 'r'
    .put(protect, authorize('cajero', 'admin'), vehicleController.updateVehicle) 
    // Correcto con doble 'r'
    .delete(protect, authorize('cajero', 'admin'), vehicleController.deleteVehicle); 

module.exports = router;