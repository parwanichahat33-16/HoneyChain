const pool = require('../config/db');

async function getDashboardStats(req, res) {
  try {
    const [beekeepers, apiaries, hives, atRisk, batches, verifiedBatches, honeyTotal] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'beekeeper'`),
      pool.query(`SELECT COUNT(*) FROM apiaries`),
      pool.query(`SELECT COUNT(*) FROM hives`),
      pool.query(`SELECT COUNT(*) FROM hives WHERE status = 'high_risk'`),
      pool.query(`SELECT COUNT(*) FROM batches`),
      pool.query(`SELECT COUNT(*) FROM batches WHERE blockchain_hash IS NOT NULL`),
      pool.query(`SELECT COALESCE(SUM(quantity),0) AS total FROM batches`),
    ]);

    res.json({
      totalBeekeepers: parseInt(beekeepers.rows[0].count),
      totalApiaries: parseInt(apiaries.rows[0].count),
      activeHives: parseInt(hives.rows[0].count),
      atRiskHives: parseInt(atRisk.rows[0].count),
      honeyProducedKg: parseFloat(honeyTotal.rows[0].total),
      verifiedBatches: parseInt(verifiedBatches.rows[0].count),
      totalBatches: parseInt(batches.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}

async function getClusterAnalytics(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.cluster,
              COUNT(DISTINCT a.id) AS apiary_count,
              COUNT(DISTINCT h.id) AS hive_count,
              COUNT(DISTINCT h.id) FILTER (WHERE h.status = 'high_risk') AS at_risk_count,
              COALESCE(SUM(b.quantity), 0) AS honey_kg
       FROM apiaries a
       LEFT JOIN hives h ON h.apiary_id = a.id
       LEFT JOIN batches b ON b.hive_id = h.id
       GROUP BY a.cluster
       ORDER BY hive_count DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cluster analytics' });
  }
}

async function getHiveHealthBreakdown(req, res) {
  try {
    const result = await pool.query(
      `SELECT status, COUNT(*) FROM hives GROUP BY status`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hive health breakdown' });
  }
}

async function getApiaryLocations(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.id, a.name, a.cluster, a.latitude, a.longitude, u.name AS beekeeper_name,
              COUNT(h.id) AS hive_count,
              COUNT(h.id) FILTER (WHERE h.status = 'high_risk') AS at_risk_count
       FROM apiaries a
       JOIN users u ON u.id = a.beekeeper_id
       LEFT JOIN hives h ON h.apiary_id = a.id
       WHERE a.latitude IS NOT NULL AND a.longitude IS NOT NULL
       GROUP BY a.id, u.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch apiary locations' });
  }
}

async function getFlaggedHives(req, res) {
  try {
    const result = await pool.query(
      `SELECT h.id, h.hive_number, a.name AS apiary_name, a.cluster, u.name AS beekeeper_name,
              p.disease_risk, p.recommendation, p.timestamp AS predicted_at
       FROM hives h
       JOIN apiaries a ON a.id = h.apiary_id
       JOIN users u ON u.id = a.beekeeper_id
       LEFT JOIN LATERAL (
         SELECT disease_risk, recommendation, timestamp FROM predictions
         WHERE hive_id = h.id ORDER BY timestamp DESC LIMIT 1
       ) p ON true
       WHERE h.status = 'high_risk'
       ORDER BY p.disease_risk DESC NULLS LAST`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch flagged hives' });
  }
}

async function getAuditLog(req, res) {
  try {
    const result = await pool.query(
      `SELECT te.batch_id, te.event_type, te.location, te.blockchain_tx, te.timestamp,
              u.name AS beekeeper_name
       FROM traceability_events te
       JOIN batches b ON b.batch_id = te.batch_id
       JOIN users u ON u.id = b.beekeeper_id
       ORDER BY te.timestamp DESC
       LIMIT 200`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
}

module.exports = { getDashboardStats, getClusterAnalytics, getHiveHealthBreakdown, getApiaryLocations, getFlaggedHives, getAuditLog };
