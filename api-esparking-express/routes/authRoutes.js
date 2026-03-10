const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Importa protect

router.post('/register', authController.register);
router.post('/login', authController.login);
// --- NUEVA RUTA ---
router.get('/me', protect, authController.getMe); // Protegida, requiere un token válido

module.exports = router;