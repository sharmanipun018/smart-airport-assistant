const [username, password] = process.argv.slice(2);
const BASE = 'http://localhost:5000/api/auth';

async function main() {
  console.log('1. Login with the given details');
  const login = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const loginData = await login.json();
  console.log('   status:', login.status, '| token received:', Boolean(loginData.token));

  if (loginData.token) {
    console.log('2. /me with the token');
    const me = await fetch(`${BASE}/me`, { headers: { Authorization: `Bearer ${loginData.token}` } });
    console.log('   status:', me.status, '|', JSON.stringify(await me.json()));
  }

  console.log('3. /me without a token');
  const noToken = await fetch(`${BASE}/me`);
  console.log('   status:', noToken.status, '|', JSON.stringify(await noToken.json()));

  console.log('4. Login with a wrong password');
  const bad = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: 'definitely-wrong' }),
  });
  console.log('   status:', bad.status, '|', JSON.stringify(await bad.json()));
}

main().catch((error) => console.error('Test failed:', error.message));