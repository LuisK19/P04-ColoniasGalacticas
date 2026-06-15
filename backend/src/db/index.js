const { Pool } = require('pg');
require('dotenv').config();

const modo = process.env.DB_MODE || 'local';
console.log(`Modo de BD: ${modo.toUpperCase()}`);

const connectionString =
  modo === 'remota'
    ? process.env.DATABASE_URL_REMOTA
    : process.env.DATABASE_URL_LOCAL;

const pool = new Pool({
  connectionString,
  ssl: modo === 'remota' ? { rejectUnauthorized: false } : false
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a la BD:', err.message);
  } else {
    console.log(`Conectado a PostgreSQL (${modo})`);
    release();
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};