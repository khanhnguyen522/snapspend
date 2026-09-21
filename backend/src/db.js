const { Pool, types } = require("pg");

const config = require("./config");

// Postgres returns DATE columns as JS Date objects by default, which get
// shifted by local timezone when serialized. Keep them as plain strings
// ("YYYY-MM-DD") instead.
types.setTypeParser(1082, (val) => val);

const pool = new Pool(config.db);

const createTables = async () => {
  // Users first — buckets and expenses both reference it.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Buckets before expenses: expenses.category references buckets(id),
  // so buckets must exist first on a fresh database.
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

  console.log("Snapspend tables ready");
};

createTables().catch((err) => {
  console.error("Failed to initialize database tables:", err);
  process.exit(1);
});

module.exports = pool;
