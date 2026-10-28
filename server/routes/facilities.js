const express = require('express');
const pool = require('../db');
const requireAdmin = require('../middleware/auth');

const router = express.Router();

const CATEGORIES = [
  'Gate', 'Washroom', 'Restaurant', 'Drinking Water', 'Medical', 'Information Desk',
  'Lounge', 'Shop', 'Baggage', 'Security', 'Entrance',
];
const TERMINALS = ['Terminal 1', 'Terminal 2', 'Terminal 3'];
const FLOORS = ['Level 1', 'Level 2'];

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Checks the incoming facility data. Returns { error } or { data }.
function validateFacility(body) {
  const b = body || {};

  const data = {
    name: text(b.name),
    category: text(b.category),
    terminal: text(b.terminal),
    floor: text(b.floor),
    description: text(b.description) || null,
    x: Number(b.x),
    y: Number(b.y),
  };

  if (!data.name || data.name.length > 80) {
    return { error: 'Name is required (80 characters at most)' };
  }
  if (!CATEGORIES.includes(data.category)) {
    return { error: `Category must be one of: ${CATEGORIES.join(', ')}` };
  }
  if (!TERMINALS.includes(data.terminal)) {
    return { error: `Terminal must be one of: ${TERMINALS.join(', ')}` };
  }
  if (!FLOORS.includes(data.floor)) {
    return { error: `Floor must be one of: ${FLOORS.join(', ')}` };
  }
  if (data.description && data.description.length > 200) {
    return { error: 'Description must be 200 characters or fewer' };
  }
  if (!Number.isInteger(data.x) || data.x < 0 || data.x > 100 || !Number.isInteger(data.y) || data.y < 0 || data.y > 100) {
    return { error: 'Map position x and y must be whole numbers from 0 to 100' };
  }

  return { data };
}

const FIELDS = ['name', 'category', 'terminal', 'floor', 'description', 'x', 'y'];

// GET /api/facilities
// Optional filters: ?category=Washroom&terminal=Terminal 3&q=water
router.get('/', async (req, res) => {
  try {
    const category = (req.query.category || '').trim();
    const terminal = (req.query.terminal || '').trim();
    const q = (req.query.q || '').trim();

    if (category.length > 30 || terminal.length > 20 || q.length > 50) {
      return res.status(400).json({ status: 'error', message: 'Filter text is too long' });
    }

    const result = await pool.query(
      `SELECT * FROM facilities
       WHERE ($1 = '' OR category ILIKE $1)
         AND ($2 = '' OR terminal ILIKE $2)
         AND ($3 = '' OR name ILIKE $4 OR description ILIKE $4 OR category ILIKE $4)
       ORDER BY terminal, name`,
      [category, terminal, q, `%${q}%`]
    );

    res.json({ status: 'ok', count: result.rows.length, facilities: result.rows });
  } catch (error) {
    console.error('Facilities error:', error.message);
    res.status(500).json({ status: 'error', message: 'Could not fetch facilities' });
  }
});

// GET /api/facilities/5
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ status: 'error', message: 'Facility id must be a number' });
    }

    const result = await pool.query('SELECT * FROM facilities WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Facility not found' });
    }

    res.json({ status: 'ok', facility: result.rows[0] });
  } catch (error) {
    console.error('Facility lookup error:', error.message);
    res.status(500).json({ status: 'error', message: 'Could not fetch facility' });
  }
});

// POST /api/facilities  (admin only) - add a facility
router.post('/', requireAdmin, async (req, res) => {
  const { error, data } = validateFacility(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  try {
    const result = await pool.query(
      `INSERT INTO facilities (${FIELDS.join(', ')})
       VALUES (${FIELDS.map((_, i) => `$${i + 1}`).join(', ')})
       RETURNING *`,
      FIELDS.map((f) => data[f])
    );
    res.status(201).json({ status: 'ok', facility: result.rows[0] });
  } catch (err) {
    console.error('Facility create error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not add the facility' });
  }
});

// PUT /api/facilities/5  (admin only) - edit a facility
router.put('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ status: 'error', message: 'Facility id must be a number' });
  }

  const { error, data } = validateFacility(req.body);
  if (error) {
    return res.status(400).json({ status: 'error', message: error });
  }

  try {
    const result = await pool.query(
      `UPDATE facilities SET ${FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ')}
       WHERE id = $${FIELDS.length + 1}
       RETURNING *`,
      [...FIELDS.map((f) => data[f]), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Facility not found' });
    }
    res.json({ status: 'ok', facility: result.rows[0] });
  } catch (err) {
    console.error('Facility update error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not update the facility' });
  }
});

// DELETE /api/facilities/5  (admin only) - delete a facility
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ status: 'error', message: 'Facility id must be a number' });
  }

  try {
    const result = await pool.query('DELETE FROM facilities WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Facility not found' });
    }
    res.json({ status: 'ok', message: 'Facility deleted' });
  } catch (err) {
    console.error('Facility delete error:', err.message);
    res.status(500).json({ status: 'error', message: 'Could not delete the facility' });
  }
});

module.exports = router;