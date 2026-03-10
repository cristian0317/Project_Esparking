const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const spotController = require('../controllers/spotController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- RUTAS PÚBLICAS (Para la app móvil) ---
router.get('/', parkingController.getAllParkings);
router.get('/nearby', parkingController.getNearbyParkings);
router.get('/my-parking', protect, parkingController.getMyParking);
router.get('/mobile', parkingController.getParkingsForMobile);
// --- RUTAS PROTEGIDAS (Para el panel de admin) ---
// Para crear un estacionamiento (solo admins)
router.post('/', protect, authorize('admin'), parkingController.createParking);

// --- RUTAS ANIDADAS PARA LUGARES ('SPOTS') ---
// Esta es la ruta que corrige tu error 404
router.post('/:parkingId/spots', protect, authorize('admin', 'administracion'), spotController.createSpot);
router.get('/:parkingId/spots', protect, spotController.getSpotsByParking);

module.exports = router;