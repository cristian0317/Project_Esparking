const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Todas las rutas en este archivo requieren que el usuario esté logueado Y que sea 'admin'
router.use(protect, authorize('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;