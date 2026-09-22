const axios = require('axios');
const pool = require('../config/db');
const { simulateNotifyAlert } = require('./notificationService');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Runs disease-risk + yield prediction for a hive using its most recent
 * sensor readings. Calls the Python AI service; if it's unreachable
 * (e.g. not started yet during early development), falls back to a
 * simple local heuristic so the rest of the app keeps working.
 */
async function runPrediction(hiveId) {
  const readings = await pool.query(
    `SELECT * FROM sensor_data WHERE hive_id = $1 ORDER BY timestamp DESC LIMIT 5`,
    [hiveId]
  );
  if (readings.rows.length === 0) {
    throw new Error('No sensor data available for this hive');
  }
  const latest = readings.rows[0];
  const previous = readings.rows[1] || latest;
  const weightChange = latest.weight - previous.weight;

  const payload = {
    temperature: Number(latest.temperature),
    humidity: Number(latest.humidity),
    weight: Number(latest.weight),
    weight_change: weightChange,
    acoustic_level: Number(latest.acoustic_level),
    colony_strength: Number(latest.colony_strength),
  };

  let result;
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/predict`, payload, { timeout: 4000 });
    result = response.data; // { disease_risk, health_status, predicted_yield, recommendation }
  } catch (err) {
    console.warn('AI service unreachable, using fallback heuristic:', err.message);
    result = fallbackHeuristic(payload);
  }

  const insert = await pool.query(
    `INSERT INTO predictions (hive_id, disease_risk, health_status, predicted_yield, recommendation)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [hiveId, result.disease_risk, result.health_status, result.predicted_yield, result.recommendation]
  );

  // Keep hive.status roughly in sync with the latest prediction
  await pool.query('UPDATE hives SET status = $1 WHERE id = $2', [result.health_status, hiveId]);

  // Auto-create an alert for high risk hives
  if (result.health_status === 'high_risk') {
    const alertRes = await pool.query(
      `INSERT INTO alerts (hive_id, severity, message, recommendation)
       VALUES ($1,'high',$2,$3) RETURNING *`,
      [
        hiveId,
        `AI-estimated disease/health risk is elevated (${result.disease_risk}%). Abnormal environmental/behavioral indicators detected.`,
        result.recommendation,
      ]
    );

    // Simulate notifying the beekeeper by email/WhatsApp (no real messages sent)
    const beekeeperRes = await pool.query(
      `SELECT u.email, h.hive_number FROM hives h
       JOIN apiaries a ON a.id = h.apiary_id
       JOIN users u ON u.id = a.beekeeper_id
       WHERE h.id = $1`,
      [hiveId]
    );
    if (beekeeperRes.rows.length > 0) {
      const alert = { ...alertRes.rows[0], hive_number: beekeeperRes.rows[0].hive_number };
      await simulateNotifyAlert(alert, beekeeperRes.rows[0].email);
    }
  }

  return insert.rows[0];
}

// Simple rule-based fallback, mirrors the logic the trained model approximates.
function fallbackHeuristic({ temperature, weight_change, acoustic_level, colony_strength }) {
  let risk = 10;
  if (temperature > 37) risk += 35;
  if (weight_change < -2) risk += 25;
  if (acoustic_level < 40) risk += 20;
  if (colony_strength < 45) risk += 15;
  risk = Math.min(risk, 95);

  const health_status = risk > 70 ? 'high_risk' : risk > 35 ? 'medium_risk' : 'healthy';
  const predicted_yield = Math.max(1, +(12 - risk / 10).toFixed(1));
  const recommendation =
    health_status === 'high_risk'
      ? 'Inspect hive within 24 hours. Temperature, weight, or acoustic anomalies detected.'
      : health_status === 'medium_risk'
      ? 'Monitor hive closely over the next few days.'
      : 'Environmental conditions are favorable. Continue routine monitoring.';

  return {
    disease_risk: risk,
    health_status,
    predicted_yield,
    recommendation,
  };
}

module.exports = { runPrediction };
