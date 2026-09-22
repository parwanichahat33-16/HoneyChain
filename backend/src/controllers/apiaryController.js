const pool = require('../config/db');

async function createApiary(req, res) {
  try {
    const { name, location, cluster, latitude, longitude } = req.body;
    const result = await pool.query(
      `INSERT INTO apiaries (name, location, cluster, latitude, longitude, beekeeper_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, location, cluster, latitude || null, longitude || null, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create apiary' });
  }
}

async function getMyApiaries(req, res) {
  try {
    const result = await pool.query(
      `SELECT a.*, COUNT(h.id) AS hive_count
       FROM apiaries a
       LEFT JOIN hives h ON h.apiary_id = a.id
       WHERE a.beekeeper_id = $1
       GROUP BY a.id ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch apiaries' });
  }
}

async function updateApiary(req, res) {
  try {
    const { id } = req.params;
    const { name, location, cluster, latitude, longitude } = req.body;
    const result = await pool.query(
      `UPDATE apiaries SET name = $1, location = $2, cluster = $3, latitude = $4, longitude = $5
       WHERE id = $6 AND beekeeper_id = $7 RETURNING *`,
      [name, location, cluster, latitude || null, longitude || null, id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Apiary not found or not owned by you' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update apiary' });
  }
}

async function deleteApiary(req, res) {
  try {
    const { id } = req.params;
    const hiveCheck = await pool.query('SELECT COUNT(*) FROM hives WHERE apiary_id = $1', [id]);
    if (parseInt(hiveCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete an apiary that still has hives. Remove its hives first.' });
    }
    const result = await pool.query(
      'DELETE FROM apiaries WHERE id = $1 AND beekeeper_id = $2 RETURNING id',
      [id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Apiary not found or not owned by you' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete apiary' });
  }
}

async function getAllApiaries(req, res) {
  // admin view
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS beekeeper_name, COUNT(h.id) AS hive_count
       FROM apiaries a
       JOIN users u ON u.id = a.beekeeper_id
       LEFT JOIN hives h ON h.apiary_id = a.id
       GROUP BY a.id, u.name ORDER BY a.cluster`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch apiaries' });
  }
}

module.exports = { createApiary, getMyApiaries, getAllApiaries, updateApiary, deleteApiary };
