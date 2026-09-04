const { Pool, types } = require("pg");
types.setTypeParser(1082, (val) => val);
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "snapspend",
});

const createTables = async () => {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Expenses table
  await pool.query(`
  CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) REFERENCES buckets(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    photo_url TEXT,
    note TEXT,
    entry_type VARCHAR(20) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
  )
`);

  // Buckets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS buckets (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(10) DEFAULT '💰',
      budget DECIMAL(10,2) DEFAULT 0,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("Snapspend tables ready");
};

createTables();
module.exports = pool;
