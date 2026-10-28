const express = require('express');
const pool = require('../db');

const router = express.Router();

const CATEGORY_KEYWORDS = [
  { category: 'Washroom', words: ['washroom', 'toilet', 'restroom', 'bathroom'] },
  { category: 'Drinking Water', words: ['water', 'drinking'] },
  { category: 'Restaurant', words: ['food', 'eat', 'restaurant', 'cafe', 'coffee', 'hungry', 'snack'] },
  { category: 'Medical', words: ['medical', 'doctor', 'first aid', 'medicine', 'ambulance'] },
  { category: 'Information Desk', words: ['information', 'help desk', 'enquiry', 'inquiry'] },
  { category: 'Lounge', words: ['lounge', 'rest area'] },
  { category: 'Shop', words: ['shop', 'duty free', 'shopping', 'buy'] },
  { category: 'Baggage', words: ['baggage', 'luggage', 'belt'] },
  { category: 'Security', words: ['security'] },
];

function formatTime(value) {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function describeFlight(f) {
  return (
    `${f.flight_number} (${f.airline}) from ${f.origin_city} to ${f.destination_city}\n` +
    `Departs ${formatTime(f.departure_time)}, boarding ${formatTime(f.boarding_time)}\n` +
    `${f.terminal}, Gate ${f.gate}, check-in ${f.checkin_counters || 'n/a'}\n` +
    `Status: ${f.status}`
  );
}

function describeFacility(f) {
  return `${f.name} (${f.terminal}, ${f.floor}): ${f.description}`;
}

async function answer(message) {
  const text = message.toLowerCase();

  // 1. Flight number, e.g. SK101
  const flightMatch = text.match(/\b([a-z]{2}\d{2,4})\b/);
  if (flightMatch) {
    const result = await pool.query('SELECT * FROM flights WHERE flight_number ILIKE $1', [flightMatch[1]]);
    if (result.rows.length > 0) {
      return { reply: describeFlight(result.rows[0]) };
    }
    return { reply: `I could not find flight ${flightMatch[1].toUpperCase()} in the sample data.` };
  }

  // 2. A specific gate, e.g. "where is gate 24"
  const gateMatch = text.match(/gate\s*(\d{1,2})\b/);
  if (gateMatch) {
    const result = await pool.query('SELECT * FROM facilities WHERE name ILIKE $1', [`Gate ${gateMatch[1]}`]);
    if (result.rows.length > 0) {
      return {
        reply: `${describeFacility(result.rows[0])}\nOpen the Map tab and use From/To to see a route.`,
      };
    }
    return { reply: `I could not find Gate ${gateMatch[1]} in the sample data.` };
  }

  // 3. Facility type, e.g. "nearest washroom"
  for (const item of CATEGORY_KEYWORDS) {
    if (item.words.some((w) => text.includes(w))) {
      const result = await pool.query(
        'SELECT * FROM facilities WHERE category = $1 ORDER BY terminal, name LIMIT 5',
        [item.category]
      );
      if (result.rows.length > 0) {
        return {
          reply:
            `Here is what I found for ${item.category}:\n` +
            result.rows.map((f) => `- ${describeFacility(f)}`).join('\n'),
        };
      }
    }
  }

  // 4. Flights to a city, e.g. "flights to Mumbai"
  const cityResult = await pool.query(
    "SELECT * FROM flights WHERE $1::text ILIKE '%' || destination_city || '%' ORDER BY departure_time",
    [message]
  );
  if (cityResult.rows.length > 0) {
    return {
      reply:
        `Flights to ${cityResult.rows[0].destination_city}:\n\n` +
        cityResult.rows.map(describeFlight).join('\n\n'),
    };
  }

  // 5. Greeting
  if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))\b/.test(text)) {
    return { reply: 'Hello! I can help with flight information and airport facilities. What do you need?' };
  }

  // 6. Fallback
  return {
    reply:
      'Sorry, I did not understand that. You can ask me about a flight number (like SK101), ' +
      'flights to a city, a gate, or facilities like washrooms, food, water or medical help.',
  };
}

router.post('/', async (req, res) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

    if (!message) {
      return res.status(400).json({ status: 'error', message: 'Please type a question' });
    }
    if (message.length > 200) {
      return res.status(400).json({ status: 'error', message: 'Question is too long' });
    }

    const result = await answer(message);
    res.json({ status: 'ok', reply: result.reply });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ status: 'error', message: 'The assistant could not answer right now' });
  }
});

module.exports = router;