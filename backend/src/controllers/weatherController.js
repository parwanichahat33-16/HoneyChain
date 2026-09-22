const axios = require('axios');
const pool = require('../config/db');

/**
 * Returns current weather for a hive's apiary location, using
 * Open-Meteo (https://open-meteo.com) — a free, no-API-key weather
 * service. No signup, no cost, no paid API involved.
 */
async function getHiveWeather(req, res) {
  try {
    const { id } = req.params;
    const apiaryRes = await pool.query(
      `SELECT a.latitude, a.longitude, a.cluster FROM hives h
       JOIN apiaries a ON a.id = h.apiary_id WHERE h.id = $1`,
      [id]
    );
    if (apiaryRes.rows.length === 0) return res.status(404).json({ error: 'Hive not found' });

    const { latitude, longitude, cluster } = apiaryRes.rows[0];
    if (!latitude || !longitude) {
      return res.status(404).json({ error: 'No location data for this hive\'s apiary yet.' });
    }

    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
        timezone: 'auto',
      },
      timeout: 5000,
    });

    const current = response.data.current;
    res.json({
      cluster,
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      weatherCode: current.weather_code,
      fetchedAt: current.time,
      source: 'Open-Meteo (live)',
    });
  } catch (err) {
    console.error('Weather fetch failed:', err.message);
    res.status(503).json({ error: 'Could not fetch live weather right now.' });
  }
}

module.exports = { getHiveWeather };
