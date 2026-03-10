const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/financial-summary', protect, authorize('administracion', 'admin'), reportsController.getFinancialSummary);
router.get('/daily-revenue', protect, authorize('administracion', 'admin'), reportsController.getDailyRevenue);
router.get('/advanced', protect, authorize('administracion', 'admin'), reportsController.getAdvancedReport);
module.exports = router;