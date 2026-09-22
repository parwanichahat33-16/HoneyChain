const pool = require('../config/db');
const { generateReading } = require('../services/sensorSimulator');
const { runPrediction } = require('../services/predictionService');

// GET latest + history for a hive
async function getSensorHistory(req, res) {
  try {
    const { hiveId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const result = await pool.query(
      `SELECT * FROM sensor_data WHERE hive_id = $1 ORDER BY timestamp DESC LIMIT $2`,
      [hiveId, limit]
    );
    res.json(result.rows.reverse()); // chronological order for charts
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sensor history' });
  }
}

// POST: generate one new simulated reading for a hive (optionally forced abnormal for demo)
async function simulateReading(req, res) {
  try {
    const { hiveId } = req.params;
    const { abnormal } = req.body; // true triggers the demo anomaly scenario

    const hiveCheck = await pool.query('SELECT id FROM hives WHERE id = $1', [hiveId]);
    if (hiveCheck.rows.length === 0) return res.status(404).json({ error: 'Hive not found' });

    const reading = generateReading({ abnormal: !!abnormal });

    const inserted = await pool.query(
      `INSERT INTO sensor_data (hive_id, temperature, humidity, weight, acoustic_level, colony_strength, is_simulated)
       VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *`,
      [hiveId, reading.temperature, reading.humidity, reading.weight, reading.acoustic_level, reading.colony_strength]
    );

    // Trigger AI prediction based on new reading (and recent history)
    const prediction = await runPrediction(hiveId);

    res.json({ reading: inserted.rows[0], prediction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to simulate reading' });
  }
}

module.exports = { getSensorHistory, simulateReading };
