const pool = require('../config/db');
const QRCode = require('qrcode');
const { recordBatchOnChain, addEventOnChain } = require('../services/blockchainService');

const CLUSTER_CODE = { Ahmedabad: 'AHM', Rajkot: 'RAJ', Junagadh: 'JUN', Banaskantha: 'BAN' };

async function generateBatchId(cluster) {
  const code = CLUSTER_CODE[cluster] || 'GEN';
  const year = new Date().getFullYear();
  const countRes = await pool.query(`SELECT COUNT(*) FROM batches WHERE batch_id LIKE $1`, [
    `HC-${year}-${code}-%`,
  ]);
  const nextNum = parseInt(countRes.rows[0].count) + 1;
  return `HC-${year}-${code}-${String(nextNum).padStart(4, '0')}`;
}

async function createBatch(req, res) {
  try {
    const { hive_id, harvest_date, quantity, honey_type, location, cluster } = req.body;

    const hiveCheck = await pool.query(
      `SELECT h.id FROM hives h JOIN apiaries a ON a.id = h.apiary_id WHERE h.id = $1 AND a.beekeeper_id = $2`,
      [hive_id, req.user.id]
    );
    if (hiveCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Hive not found or not owned by you' });
    }

    const batchId = await generateBatchId(cluster);

    // 1. Record on blockchain first (tamper-evident integrity layer)
    const chainResult = await recordBatchOnChain(batchId, { hive_id, harvest_date, quantity, beekeeper_id: req.user.id });

    // 2. Generate QR code encoding the public verification URL
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${batchId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);

    // 3. Insert batch record
    const result = await pool.query(
      `INSERT INTO batches (batch_id, hive_id, beekeeper_id, harvest_date, quantity, honey_type, location, status, blockchain_hash, qr_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'harvested',$8,$9) RETURNING *`,
      [batchId, hive_id, req.user.id, harvest_date, quantity, honey_type || 'Raw Honey', location, chainResult.txHash, qrDataUrl]
    );

    // 4. First traceability event
    await pool.query(
      `INSERT INTO traceability_events (batch_id, event_type, location, blockchain_tx)
       VALUES ($1,'HARVESTED',$2,$3)`,
      [batchId, location, chainResult.txHash]
    );

    res.status(201).json({ batch: result.rows[0], verifyUrl, blockchain: chainResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create batch' });
  }
}

async function addTraceabilityEvent(req, res) {
  try {
    const { batchId } = req.params;
    const { event_type, location, notes } = req.body;
    const validEvents = ['HARVESTED', 'EXTRACTED', 'PROCESSED', 'PACKAGED', 'DISTRIBUTED'];
    if (!validEvents.includes(event_type)) {
      return res.status(400).json({ error: `event_type must be one of ${validEvents.join(', ')}` });
    }

    const chainResult = await addEventOnChain(batchId, event_type, { location, notes });

    const result = await pool.query(
      `INSERT INTO traceability_events (batch_id, event_type, location, notes, blockchain_tx)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [batchId, event_type, location, notes || null, chainResult.txHash]
    );

    // keep batch.status roughly in sync with latest event
    await pool.query(`UPDATE batches SET status = $1 WHERE batch_id = $2`, [event_type.toLowerCase(), batchId]);

    res.status(201).json({ event: result.rows[0], blockchain: chainResult });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add traceability event' });
  }
}

async function getMyBatches(req, res) {
  try {
    const result = await pool.query(
      `SELECT b.*, h.hive_number FROM batches b JOIN hives h ON h.id = b.hive_id
       WHERE b.beekeeper_id = $1 ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
}

async function getAllBatchesAdmin(req, res) {
  try {
    const result = await pool.query(
      `SELECT b.*, h.hive_number, u.name AS beekeeper_name
       FROM batches b JOIN hives h ON h.id = b.hive_id JOIN users u ON u.id = b.beekeeper_id
       ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch batches' });
  }
}

module.exports = { createBatch, addTraceabilityEvent, getMyBatches, getAllBatchesAdmin };
