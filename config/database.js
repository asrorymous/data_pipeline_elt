const { Pool } = require("pg");
require("dotenv").config();

// Configuration object using environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true, // Crucial for security!
  },
};

const pool = new Pool(dbConfig);

module.exports = {
  // We export a query function for better tracking
  query: (text, params) => pool.query(text, params),
  pool,
};
