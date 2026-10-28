require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const flightRoutes = require('./routes/flights');
const facilityRoutes = require('./routes/facilities');
const chatRoutes = require('./routes/chat');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in server/.env');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use('/api/flights', flightRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Smart Airport API is running',
    time: new Date().toISOString(),
  });
});

app.get('/api/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time');
    res.json({
      status: 'ok',
      message: 'Connected to PostgreSQL',
      databaseTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Could not connect to the database',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});