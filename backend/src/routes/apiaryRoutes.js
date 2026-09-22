const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { createApiary, getMyApiaries, getAllApiaries, updateApiary, deleteApiary } = require('../controllers/apiaryController');

router.post('/', authenticate, requireRole('beekeeper'), createApiary);
router.get('/mine', authenticate, requireRole('beekeeper'), getMyApiaries);
router.get('/', authenticate, requireRole('admin'), getAllApiaries);
router.put('/:id', authenticate, requireRole('beekeeper'), updateApiary);
router.delete('/:id', authenticate, requireRole('beekeeper'), deleteApiary);

module.exports = router;
