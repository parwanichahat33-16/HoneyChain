const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const {
  createBatch,
  addTraceabilityEvent,
  getMyBatches,
  getAllBatchesAdmin,
} = require('../controllers/batchController');

router.post('/', authenticate, requireRole('beekeeper'), createBatch);
router.post('/:batchId/events', authenticate, requireRole('beekeeper'), addTraceabilityEvent);
router.get('/mine', authenticate, requireRole('beekeeper'), getMyBatches);
router.get('/all', authenticate, requireRole('admin'), getAllBatchesAdmin);

module.exports = router;
