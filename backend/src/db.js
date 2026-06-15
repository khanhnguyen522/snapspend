const { Pool } = require("pg");
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

  // Settings table — text value, per user
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) NOT NULL,
      value TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (key, user_id)
    )
  `);

  // Expenses table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      store_name VARCHAR(255),
      amount DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) DEFAULT 'other',
      date DATE NOT NULL,
      photo_url TEXT,
      note TEXT,
      paid_by VARCHAR(255),
      is_settled BOOLEAN DEFAULT FALSE,
      entry_type VARCHAR(20) DEFAULT 'manual',
      created_at TIMESTAMP DEFAULT NOW(),
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Migrate existing expenses/settings to have nullable user_id (for old data)
  await pool
    .query(
      `ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`,
    )
    .catch(() => {});

  console.log("Snapspend tables ready");
};

createTables();
module.exports = pool;
