const { Pool } = require('pg');
const config = require('../config/config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a la BD:', err.message);
  } else {
    console.log('Conectado a PostgreSQL correctamente');
    release();
  }
});

module.exports = pool;