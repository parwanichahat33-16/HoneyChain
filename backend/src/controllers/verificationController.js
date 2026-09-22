const pool = require('../config/db');
const { verifyBatchOnChain, getBatchOnChainDetails } = require('../services/blockchainService');

/**
 * Public endpoint — no authentication required.
 * Returns everything a consumer should see after scanning a QR code.
 */
async function verifyBatch(req, res) {
  try {
    const { batchId } = req.params;

    const batchRes = await pool.query(
      `SELECT b.*, h.hive_number, a.name AS apiary_name, a.cluster, u.name AS beekeeper_name
       FROM batches b
       JOIN hives h ON h.id = b.hive_id
       JOIN apiaries a ON a.id = h.apiary_id
       JOIN users u ON u.id = b.beekeeper_id
       WHERE b.batch_id = $1`,
      [batchId]
    );

    if (batchRes.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found. This QR code may be invalid.' });
    }
    const batch = batchRes.rows[0];

    const events = await pool.query(
      `SELECT event_type, location, notes, blockchain_tx, timestamp
       FROM traceability_events WHERE batch_id = $1 ORDER BY timestamp ASC`,
      [batchId]
    );

    // Optional: latest AI-generated hive health summary (non-diagnostic)
    const predictionRes = await pool.query(
      `SELECT disease_risk, health_status, timestamp FROM predictions
       WHERE hive_id = $1 ORDER BY timestamp DESC LIMIT 1`,
      [batch.hive_id]
    );

    const chain = await verifyBatchOnChain(batchId);

    res.json({
      batch: {
        batchId: batch.batch_id,
        beekeeper: batch.beekeeper_name,
        apiary: batch.apiary_name,
        cluster: batch.cluster,
        hive: batch.hive_number,
        harvestDate: batch.harvest_date,
        quantity: batch.quantity,
        honeyType: batch.honey_type,
        status: batch.status,
      },
      traceability: events.rows,
      hiveHealthSummary: predictionRes.rows[0]
        ? {
            aiEstimatedRisk: predictionRes.rows[0].disease_risk,
            status: predictionRes.rows[0].health_status,
            note: 'AI-estimated indicator based on environmental/behavioral hive data — not a laboratory or scientific diagnosis.',
          }
        : null,
      blockchain: {
        recordFound: !!batch.blockchain_hash,
        hashVerified: chain.verified !== false,
        onChainStatus: chain.verified ? 'verified' : chain.note ? chain.note : 'not verified',
        trustNote:
          'Blockchain verifies the integrity and traceability of recorded supply-chain events. Chemical purity or adulteration requires laboratory testing.',
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify batch' });
  }
}

/**
 * Public endpoint — returns the raw on-chain record for a batch,
 * for the "Verify Blockchain Record" detail view on the consumer page.
 */
async function getBlockchainDetails(req, res) {
  try {
    const { batchId } = req.params;
    const details = await getBatchOnChainDetails(batchId);
    if (!details) {
      return res.status(503).json({ error: 'Blockchain not configured — this batch has no on-chain record to inspect.' });
    }
    if (!details.exists) {
      return res.status(404).json({ error: 'No on-chain record found for this batch.' });
    }
    res.json(details);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch on-chain record' });
  }
}

module.exports = { verifyBatch, getBlockchainDetails };
