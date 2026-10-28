require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db');

async function main() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.log('Usage: node scripts/createAdmin.js <username> <password>');
    process.exit(1);
  }
  if (username.length > 50 || password.length < 8 || password.length > 100) {
    console.log('Username must be 50 characters or fewer, and password must be 8 to 100 characters.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO admins (username, password_hash) VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash]
  );

  console.log(`Admin "${username}" saved.`);
  await pool.end();
}

main().catch((error) => {
  console.error('Could not create admin:', error.message);
  process.exit(1);
});