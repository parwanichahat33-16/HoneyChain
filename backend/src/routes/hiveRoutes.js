const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createHive, getMyHives, getHiveDetails, getAllHivesAdmin, updateHive, deleteHive,
  getHiveBatchHistory, getMyAlerts, resolveAlert,
} = require('../controllers/hiveController');
const { getSensorHistory, simulateReading } = require('../controllers/sensorController');
const { getHiveWeather } = require('../controllers/weatherController');

router.post('/', authenticate, requireRole('beekeeper'), createHive);
router.get('/mine', authenticate, requireRole('beekeeper'), getMyHives);
router.get('/all', authenticate, requireRole('admin'), getAllHivesAdmin);
router.get('/alerts/mine', authenticate, requireRole('beekeeper'), getMyAlerts);
router.post('/alerts/:alertId/resolve', authenticate, requireRole('beekeeper'), resolveAlert);
router.get('/:id', authenticate, getHiveDetails);
router.put('/:id', authenticate, requireRole('beekeeper'), updateHive);
router.delete('/:id', authenticate, requireRole('beekeeper'), deleteHive);
router.get('/:id/batches', authenticate, getHiveBatchHistory);
router.get('/:id/weather', authenticate, getHiveWeather);

router.get('/:hiveId/sensor-data', authenticate, getSensorHistory);
router.post('/:hiveId/simulate', authenticate, requireRole('beekeeper'), simulateReading);

module.exports = router;
