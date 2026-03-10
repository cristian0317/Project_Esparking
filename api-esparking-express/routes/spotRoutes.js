// /routes/spotRoutes.js
const express = require('express');
const router = express.Router();
const spotController = require('../controllers/spotController');
const { protect, authorize } = require('../middleware/authMiddleware');
const esp32Auth = require('../middleware/esp32AuthMiddleware');

// Ruta para actualizar el estado (PUT)
router.put('/:spotId/status', esp32Auth, spotController.updateSpotStatus);

// Ruta para eliminar un lugar (DELETE)
router.delete('/:spotId', protect, authorize('admin'), spotController.deleteSpot);

module.exports = router;