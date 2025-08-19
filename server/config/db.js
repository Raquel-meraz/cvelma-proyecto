const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Puedes descomentar lo de abajo si necesitas SSL para producción:
  // ssl: { rejectUnauthorized: false }
});

module.exports = pool;
