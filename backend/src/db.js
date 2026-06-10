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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      key VARCHAR(100) PRIMARY KEY,
      value DECIMAL(10,2)
    )
  `);
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
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    INSERT INTO settings (key, value) VALUES ('monthly_budget', 500)
    ON CONFLICT (key) DO NOTHING
  `);
  console.log("Snapspend tables ready");
};

createTables();
module.exports = pool;
