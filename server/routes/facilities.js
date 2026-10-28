const express = require('express');
const pool = require('../db');

const router = express.Router();

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

module.exports = router;