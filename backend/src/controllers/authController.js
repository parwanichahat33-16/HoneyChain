const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const allowedRole = role === 'admin' ? 'admin' : 'beekeeper'; // admins should normally be seeded, not self-registered
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role, created_at`,
      [name, email, hashed, allowedRole]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };
