const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All device routes require authentication and admin/organization role
router.use(protect, authorize('admin', 'administracion'));

router.route('/')
  .post(deviceController.createDevice)
  .get(deviceController.getDevices);

router.route('/:id')
  .delete(deviceController.deleteDevice);

module.exports = router;