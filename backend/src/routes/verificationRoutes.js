const express = require('express');
const router = express.Router();
const { verifyBatch, getBlockchainDetails } = require('../controllers/verificationController');
const { submitFeedback, getFeedback } = require('../controllers/feedbackController');

// Public — no authentication. This is what the QR code links to.
router.get('/:batchId', verifyBatch);
router.get('/:batchId/blockchain', getBlockchainDetails);
router.get('/:batchId/feedback', getFeedback);
router.post('/:batchId/feedback', submitFeedback);

module.exports = router;
