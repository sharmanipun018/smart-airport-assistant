const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/flights  or  /api/flights?q=mumbai
router.get('/', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (q.length > 50) {
      return res.status(400).json({ status: 'error', message: 'Search text is too long' });
    }

    const result = await pool.query(
      `SELECT * FROM flights
       WHERE $1 = ''
          OR flight_number ILIKE $2
          OR airline ILIKE $2
          OR origin_city ILIKE $2
          OR destination_city ILIKE $2
          OR destination_code ILIKE $2
       ORDER BY departure_time`,
      [q, `%${q}%`]
    );

    res.json({ status: 'ok', count: result.rows.length, flights: result.rows });
  } catch (error) {
    console.error('Flight search error:', error.message);
    res.status(500).json({ status: 'error', message: 'Could not fetch flights' });
  }
});

// GET /api/flights/SK101
router.get('/:flightNumber', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM flights WHERE flight_number ILIKE $1',
      [req.params.flightNumber.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Flight not found' });
    }

    res.json({ status: 'ok', flight: result.rows[0] });
  } catch (error) {
    console.error('Flight lookup error:', error.message);
    res.status(500).json({ status: 'error', message: 'Could not fetch flight' });
  }
});

module.exports = router;