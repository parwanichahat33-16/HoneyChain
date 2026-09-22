require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const apiaryRoutes = require('./routes/apiaryRoutes');
const hiveRoutes = require('./routes/hiveRoutes');
const batchRoutes = require('./routes/batchRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'honeychain-backend' }));

app.use('/api/auth', authRoutes);
app.use('/api/apiaries', apiaryRoutes);
app.use('/api/hives', hiveRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/verify', verificationRoutes); // public — QR codes link here
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🐝 HoneyChain API running on port ${PORT}`));
