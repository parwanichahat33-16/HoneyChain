const pool = require('../config/db');

async function createHive(req, res) {
  try {
    const { hive_number, apiary_id, installation_date } = req.body;
    // verify apiary belongs to this beekeeper
    const apiaryCheck = await pool.query(
      'SELECT id FROM apiaries WHERE id = $1 AND beekeeper_id = $2',
      [apiary_id, req.user.id]
    );
    if (apiaryCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Apiary not found or not owned by you' });
    }
    const result = await pool.query(
      `INSERT INTO hives (hive_number, apiary_id, installation_date) VALUES ($1,$2,$3) RETURNING *`,
      [hive_number, apiary_id, installation_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create hive (hive_number must be unique)' });
  }
}

async function getMyHives(req, res) {
  try {
    const result = await pool.query(
      `SELECT h.*, a.name AS apiary_name, a.cluster,
              (SELECT row_to_json(s) FROM (
                 SELECT temperature, humidity, weight, acoustic_level, colony_strength, timestamp
                 FROM sensor_data WHERE hive_id = h.id ORDER BY timestamp DESC LIMIT 1
               ) s) AS latest_reading,
              (SELECT row_to_json(p) FROM (
                 SELECT disease_risk, health_status, predicted_yield, recommendation, timestamp
                 FROM predictions WHERE hive_id = h.id ORDER BY timestamp DESC LIMIT 1
               ) p) AS latest_prediction
       FROM hives h
       JOIN apiaries a ON a.id = h.apiary_id
       WHERE a.beekeeper_id = $1
       ORDER BY h.hive_number`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hives' });
  }
}

async function getHiveDetails(req, res) {
  try {
    const { id } = req.params;
    const hive = await pool.query(
      `SELECT h.*, a.name AS apiary_name, a.cluster, a.beekeeper_id
       FROM hives h JOIN apiaries a ON a.id = h.apiary_id WHERE h.id = $1`,
      [id]
    );
    if (hive.rows.length === 0) return res.status(404).json({ error: 'Hive not found' });

    const readings = await pool.query(
      `SELECT * FROM sensor_data WHERE hive_id = $1 ORDER BY timestamp DESC LIMIT 50`,
      [id]
    );
    const predictions = await pool.query(
      `SELECT * FROM predictions WHERE hive_id = $1 ORDER BY timestamp DESC LIMIT 10`,
      [id]
    );
    const alerts = await pool.query(
      `SELECT * FROM alerts WHERE hive_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [id]
    );

    res.json({
      hive: hive.rows[0],
      sensorHistory: readings.rows,
      predictions: predictions.rows,
      alerts: alerts.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hive details' });
  }
}

async function updateHive(req, res) {
  try {
    const { id } = req.params;
    const { hive_number, installation_date } = req.body;
    const result = await pool.query(
      `UPDATE hives h SET hive_number = $1, installation_date = $2
       FROM apiaries a
       WHERE h.id = $3 AND h.apiary_id = a.id AND a.beekeeper_id = $4
       RETURNING h.*`,
      [hive_number, installation_date, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hive not found or not owned by you' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update hive (hive_number must stay unique)' });
  }
}

async function deleteHive(req, res) {
  try {
    const { id } = req.params;
    const batchCheck = await pool.query('SELECT COUNT(*) FROM batches WHERE hive_id = $1', [id]);
    if (parseInt(batchCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete a hive that has honey batches recorded against it.' });
    }
    const result = await pool.query(
      `DELETE FROM hives h USING apiaries a
       WHERE h.id = $1 AND h.apiary_id = a.id AND a.beekeeper_id = $2
       RETURNING h.id`,
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hive not found or not owned by you' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete hive' });
  }
}

async function getAllHivesAdmin(req, res) {
  try {
    const result = await pool.query(
      `SELECT h.*, a.name AS apiary_name, a.cluster, u.name AS beekeeper_name
       FROM hives h
       JOIN apiaries a ON a.id = h.apiary_id
       JOIN users u ON u.id = a.beekeeper_id
       ORDER BY a.cluster, h.hive_number`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch hives' });
  }
}

async function getHiveBatchHistory(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT batch_id, harvest_date, quantity, honey_type, status, blockchain_hash, created_at
       FROM batches WHERE hive_id = $1 ORDER BY harvest_date DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch batch history for this hive' });
  }
}

async function getMyAlerts(req, res) {
  try {
    const result = await pool.query(
      `SELECT al.*, h.hive_number, a.name AS apiary_name, a.cluster
       FROM alerts al
       JOIN hives h ON h.id = al.hive_id
       JOIN apiaries a ON a.id = h.apiary_id
       WHERE a.beekeeper_id = $1
       ORDER BY al.is_resolved ASC, al.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
}

async function resolveAlert(req, res) {
  try {
    const { alertId } = req.params;
    const result = await pool.query(
      `UPDATE alerts al SET is_resolved = true
       FROM hives h, apiaries a
       WHERE al.id = $1 AND al.hive_id = h.id AND h.apiary_id = a.id AND a.beekeeper_id = $2
       RETURNING al.*`,
      [alertId, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Alert not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
}

module.exports = {
  createHive, getMyHives, getHiveDetails, getAllHivesAdmin, updateHive, deleteHive,
  getHiveBatchHistory, getMyAlerts, resolveAlert,
};
