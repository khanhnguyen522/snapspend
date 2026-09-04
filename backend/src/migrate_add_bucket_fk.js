/**
 * Migration: Link expenses.category -> buckets.id with a real FK constraint.
 *
 * Run this ONCE against your database (local first, then EC2/prod).
 * Usage: node migrate_add_bucket_fk.js
 *
 * What it does:
 *   1. Finds any expenses whose category doesn't match an existing bucket.id
 *      (per user, since buckets are scoped to user_id).
 *   2. For each orphaned category value, creates a matching bucket so no
 *      data is lost (instead of silently reassigning/deleting expenses).
 *   3. Alters expenses.category to VARCHAR(50) if needed (to match buckets.id type).
 *   4. Adds the FK constraint: expenses.category -> buckets.id ON DELETE RESTRICT.
 *
 * Safe to re-run: it checks for existing orphans/constraints before acting.
 */

const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "snapspend",
});

const CONSTRAINT_NAME = "fk_expenses_bucket";

async function findOrphanCategories(client) {
  // Expenses whose (category, user_id) has no matching bucket (id, user_id)
  const result = await client.query(`
    SELECT DISTINCT e.category, e.user_id
    FROM expenses e
    LEFT JOIN buckets b
      ON b.id = e.category AND b.user_id = e.user_id
    WHERE b.id IS NULL
      AND e.category IS NOT NULL
  `);
  return result.rows; // [{ category, user_id }, ...]
}

async function createMissingBuckets(client, orphans) {
  for (const { category, user_id } of orphans) {
    console.log(
      `  Creating bucket "${category}" for user_id=${user_id} (was orphaned)`,
    );
    await client.query(
      `
      INSERT INTO buckets (id, name, icon, budget, user_id)
      VALUES ($1, $2, '💰', 0, $3)
      ON CONFLICT (id) DO NOTHING
      `,
      [category, category, user_id],
    );
  }
}

async function constraintExists(client) {
  const result = await client.query(
    `
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = $1 AND table_name = 'expenses'
    `,
    [CONSTRAINT_NAME],
  );
  return result.rows.length > 0;
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Starting migration: link expenses.category -> buckets.id\n");

    await client.query("BEGIN");

    // 1. Check if constraint already exists (idempotent re-run)
    if (await constraintExists(client)) {
      console.log("Constraint already exists. Nothing to do.");
      await client.query("COMMIT");
      return;
    }

    // 2. Find and fix orphaned category values
    console.log("Checking for orphaned category values...");
    const orphans = await findOrphanCategories(client);

    if (orphans.length > 0) {
      console.log(`Found ${orphans.length} orphaned category/user combo(s).`);
      await createMissingBuckets(client, orphans);
    } else {
      console.log("  No orphans found.");
    }

    // 3. Handle NULL/empty categories -- decide on a fallback here.
    //    IMPORTANT: buckets.id is user-scoped, so a global 'other' bucket
    //    won't work per-user. We leave NULLs as NULL (FK allows NULL by
    //    default) rather than guessing a fallback bucket per user.
    const nullCount = await client.query(
      `SELECT COUNT(*) FROM expenses WHERE category IS NULL`,
    );
    if (parseInt(nullCount.rows[0].count, 10) > 0) {
      console.log(
        `  Note: ${nullCount.rows[0].count} expense(s) have NULL category -- these are allowed under the FK (NULL is not checked) and will show as uncategorized.`,
      );
    }

    // 4. Make column types match (buckets.id is VARCHAR(50))
    console.log("Ensuring expenses.category type matches buckets.id...");
    await client.query(`
      ALTER TABLE expenses
      ALTER COLUMN category TYPE VARCHAR(50)
    `);

    // 5. Add the FK constraint
    console.log("Adding foreign key constraint...");
    await client.query(`
      ALTER TABLE expenses
      ADD CONSTRAINT ${CONSTRAINT_NAME}
      FOREIGN KEY (category) REFERENCES buckets(id)
      ON DELETE RESTRICT
    `);

    await client.query("COMMIT");
    console.log(
      "\nMigration complete. expenses.category now references buckets.id.",
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\nMigration failed, rolled back. Error:");
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
