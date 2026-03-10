const express = require('express');
const router = express.Router();
const rateController = require('../controllers/rateController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Solo los admins pueden modificar las tarifas
// Todos los usuarios logueados pueden verlas
router.route('/')
    .get(protect, rateController.getRates)
    .post(protect, authorize('admin'), rateController.createRate);

router.route('/:id')
    .put(protect, authorize('admin'), rateController.updateRate)
    .delete(protect, authorize('admin'), rateController.deleteRate);

module.exports = router;