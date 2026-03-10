const express = require('express');
const router = express.Router();
const entryController = require('../controllers/entryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// --- RUTA PARA OBTENER ENTRADAS ACTIVAS ---
router.get('/active', protect, entryController.getActiveEntries);

// --- RUTA PARA OBTENER EL HISTORIAL (LA QUE FALTABA) ---
router.get('/completed', protect, authorize('administracion', 'admin'), entryController.getCompletedEntries);

// --- RUTAS PARA OPERACIONES ---
router.post('/check-in', protect, authorize('cajero', 'admin'), entryController.checkIn);
router.patch('/check-out/:plate', protect, authorize('cajero', 'admin'), entryController.checkOut);

module.exports = router;