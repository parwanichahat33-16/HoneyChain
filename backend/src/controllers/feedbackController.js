const pool = require('../config/db');

async function submitFeedback(req, res) {
  try {
    const { batchId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const batchCheck = await pool.query('SELECT batch_id FROM batches WHERE batch_id = $1', [batchId]);
    if (batchCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    const result = await pool.query(
      `INSERT INTO feedback (batch_id, rating, comment) VALUES ($1,$2,$3) RETURNING *`,
      [batchId, rating, comment || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
}

async function getFeedback(req, res) {
  try {
    const { batchId } = req.params;
    const result = await pool.query(
      `SELECT rating, comment, created_at FROM feedback WHERE batch_id = $1 ORDER BY created_at DESC`,
      [batchId]
    );
    const avgRating = result.rows.length
      ? (result.rows.reduce((sum, f) => sum + f.rating, 0) / result.rows.length).toFixed(1)
      : null;
    res.json({ feedback: result.rows, averageRating: avgRating, count: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
}

module.exports = { submitFeedback, getFeedback };
