const express = require('express');
const pool = require('../db');
const requireAdmin = require('../middleware/auth');

const router = express.Router();

const STATUSES = ['On Time', 'Boarding', 'Delayed', 'Cancelled'];
const TIME_PATTERN = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2})?$/;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Checks the incoming flight data. Returns { error } or { data }.
function validateFlight(body) {
  const b = body || {};

  const data = {
    flight_number: text(b.flight_number).toUpperCase(),
    airline: text(b.airline),
    origin_code: text(b.origin_code).toUpperCase(),
    origin_city: text(b.origin_city),
    destination_code: text(b.destination_code).toUpperCase(),
    destination_city: text(b.destination_city),
    departure_time: text(b.departure_time),
    arrival_time: text(b.arrival_time),
    terminal: text(b.terminal),
    gate: text(b.gate),
    checkin_counters: text(b.checkin_counters) || null,
    boarding_time: text(b.boarding_time),
    status: text(b.status) || 'On Time',
  };

  if (!/^[A-Z0-9]{3,10}$/.test(data.flight_number)) {
    return { error: 'Flight number must be 3 to 10 letters or numbers' };
  }
  if (!data.airline || data.airline.length > 60) {
    return { error: 'Airline is required (60 characters at most)' };
  }
  if (!/^[A-Z]{3}$/.test(data.origin_code) || !/^[A-Z]{3}$/.test(data.destination_code)) {
    return { error: 'Airport codes must be exactly 3 letters, like DEL' };
  }
  if (data.origin_code === data.destination_code) {
    return { error: 'Origin and destination must be different' };
  }
  if (!data.origin_city || data.origin_city.length > 60 || !data.destination_city || data.destination_city.length > 60) {
    return { error: 'Origin city and destination city are required (60 characters at most)' };
  }
  for (const field of ['departure_time', 'arrival_time', 'boarding_time']) {
    if (!TIME_PATTERN.test(data[field]) || Number.isNaN(Date.parse(data[field]))) {
      return { error: `${field.replace('_', ' ')} is not a valid date and time` };
    }
  }
  if (Date.parse(data.arrival_time) <= Date.parse(data.departure_time)) {
    return { error: 'Arrival must be after departure' };
  }
  if (Date.parse(data.boarding_time) > Date.parse(data.departure_time)) {
    return { error: 'Boarding time must not be after departure' };
  }
  if (!data.terminal || data.terminal.length > 20) {
    return { error: 'Terminal is required (20 characters at most)' };
  }
  if (!data.gate || data.gate.length > 10) {
    return { error: 'Gate is required (10 characters at most)' };
  }
  if (data.checkin_counters && data.checkin_counters.length > 30) {
    return { error: 'Check-in counters must be 30 characters or fewer' };
  }
  if (!STATUSES.includes(data.status)) {
    return { error: `Status must be one of: ${STATUSES.join(', ')}` };
  }

  return { data };
}

const FIELDS = [
  'flight_number', 'airline', 'origin_code', 'origin_city', 'destination_code', 'destination_city',
  'departure_time', 'arrival_time', 'terminal', 'gate', 'checkin_counters', 'boarding_time', 'status',
];

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

// POST /api/flights  (admin only) - add a flight
router.post('/', requireAdmin, async (req, res) => {
  const { error, data } = validateFlight(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  try {
    const result = await pool.query(
      `INSERT INTO flights (${FIELDS.join(', ')})
       VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(', ')})
       RETURNING *`,
      FIELDS.map((f) => data[f])
    );
    res.status(201).json({ status: 'ok', flight: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'A flight with that number already exists' });
    }
    console.error('Flight create error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not add the flight' });
  }
});

// PUT /api/flights/5  (admin only) - edit a flight by its id
router.put('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ status: 'error', message: 'Flight id must be a number' });
  }

  const { error, data } = validateFlight(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  try {
    const result = await pool.query(
      `UPDATE flights SET ${FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ')}
       WHERE id = $${FIELDS.length + 1}
       RETURNING *`,
      [...FIELDS.map((f) => data[f]), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Flight not found' });
    }
    res.json({ status: 'ok', flight: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ status: 'error', message: 'A flight with that number already exists' });
    }
    console.error('Flight update error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not update the flight' });
  }
});

// DELETE /api/flights/5  (admin only) - delete a flight by its id
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ status: 'error', message: 'Flight id must be a number' });
  }

  try {
    const result = await pool.query('DELETE FROM flights WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Flight not found' });
    }
    res.json({ status: 'ok', message: 'Flight deleted' });
  } catch (err) {
    console.error('Flight delete error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not delete the flight' });
  }
});

module.exports = router;