const [username, password] = process.argv.slice(2);
const AUTH = 'http://localhost:5000/api/auth/login';
const BASE = 'http://localhost:5000/api/flights';

const day = new Date().toISOString().slice(0, 10);
const sample = {
  flight_number: 'TEST999',
  airline: 'Test Air',
  origin_code: 'DEL',
  origin_city: 'New Delhi',
  destination_code: 'PNQ',
  destination_city: 'Pune',
  departure_time: `${day}T20:00`,
  arrival_time: `${day}T22:00`,
  terminal: 'Terminal 1',
  gate: '12',
  checkin_counters: 'A-10',
  boarding_time: `${day}T19:30`,
  status: 'On Time',
};

async function call(label, method, url, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  console.log(`${label}\n   status: ${response.status} | ${data.message || data.status}`);
  return data;
}

async function main() {
  const login = await fetch(AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const { token } = await login.json();
  if (!token) {
    console.log('Login failed. Check the username and password.');
    return;
  }

  await call('1. Add a flight without logging in (expect 401)', 'POST', BASE, sample);
  const created = await call('2. Add a flight as admin (expect 201)', 'POST', BASE, sample, token);
  await call('3. Add the same flight number again (expect 409)', 'POST', BASE, sample, token);
  await call('4. Add a flight with bad airport codes (expect 400)', 'POST', BASE, { ...sample, flight_number: 'TEST998', origin_code: 'D1' }, token);
  await call('5. Add a flight arriving before it departs (expect 400)', 'POST', BASE, { ...sample, flight_number: 'TEST997', arrival_time: `${day}T18:00` }, token);

  if (created.flight) {
    const id = created.flight.id;
    await call('6. Edit the flight status to Delayed (expect 200)', 'PUT', `${BASE}/${id}`, { ...sample, status: 'Delayed' }, token);
    await call('7. Delete the flight without logging in (expect 401)', 'DELETE', `${BASE}/${id}`);
    await call('8. Delete the flight as admin (expect 200)', 'DELETE', `${BASE}/${id}`, null, token);
    await call('9. Delete it again (expect 404)', 'DELETE', `${BASE}/${id}`, null, token);
  }
}

main().catch((error) => console.error('Test failed:', error.message));