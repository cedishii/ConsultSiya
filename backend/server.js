const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Routes
app.use('/api/auth', require('./routes/auth'));
// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ConsultSiya API is running!' });
});

// Database test route
app.get('/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});