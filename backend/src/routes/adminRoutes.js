const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  getDashboardStats, getClusterAnalytics, getHiveHealthBreakdown, getApiaryLocations, getFlaggedHives, getAuditLog,
} = require('../controllers/adminController');

router.get('/dashboard', authenticate, requireRole('admin'), getDashboardStats);
router.get('/clusters', authenticate, requireRole('admin'), getClusterAnalytics);
router.get('/hive-health', authenticate, requireRole('admin'), getHiveHealthBreakdown);
router.get('/apiary-locations', authenticate, requireRole('admin'), getApiaryLocations);
router.get('/flagged-hives', authenticate, requireRole('admin'), getFlaggedHives);
router.get('/audit-log', authenticate, requireRole('admin'), getAuditLog);

module.exports = router;
