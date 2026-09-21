const express = require("express");

const pool = require("../db");
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.use(auth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM buckets WHERE user_id = $1 ORDER BY created_at ASC",
      [req.user.id],
    );
    res.json({ categories: result.rows });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { id, name, icon, budget } = req.body;
    const result = await pool.query(
      `INSERT INTO buckets (id, name, icon, budget, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, icon || "💰", parseFloat(budget) || 0, req.user.id],
    );
    res.json({ category: result.rows[0] });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const { name, icon, budget } = req.body;
    const result = await pool.query(
      `UPDATE buckets SET name=$1, icon=$2, budget=$3
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [name, icon, parseFloat(budget) || 0, req.params.id, req.user.id],
    );
    res.json({ category: result.rows[0] });
  }),
);

// Deleting a bucket that still has expenses fails the FK constraint (23503);
// that's an expected case, so it's caught locally and turned into a 409
// instead of falling through to the generic error handler.
router.delete(
  "/:id",
  asyncHandler(async (req, res, next) => {
    try {
      await pool.query("DELETE FROM buckets WHERE id=$1 AND user_id=$2", [
        req.params.id,
        req.user.id,
      ]);
      res.json({ message: "Deleted" });
    } catch (err) {
      if (err.code === "23503") {
        const countResult = await pool.query(
          "SELECT COUNT(*) FROM expenses WHERE category = $1 AND user_id = $2",
          [req.params.id, req.user.id],
        );
        const count = parseInt(countResult.rows[0].count, 10);
        return res.status(409).json({
          error: "BUCKET_HAS_EXPENSES",
          message: `This category has ${count} expense${count === 1 ? "" : "s"} — reassign them first.`,
        });
      }
      next(err);
    }
  }),
);

router.post(
  "/:id/reassign-and-delete",
  asyncHandler(async (req, res) => {
    const { targetId } = req.body;
    if (!targetId) {
      return res.status(400).json({ error: "targetId is required" });
    }
    if (targetId === req.params.id) {
      return res.status(400).json({
        error: "Target bucket must be different from the one being deleted",
      });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const targetCheck = await client.query(
        "SELECT id FROM buckets WHERE id = $1 AND user_id = $2",
        [targetId, req.user.id],
      );
      if (targetCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Target bucket not found" });
      }

      await client.query(
        "UPDATE expenses SET category = $1 WHERE category = $2 AND user_id = $3",
        [targetId, req.params.id, req.user.id],
      );

      await client.query("DELETE FROM buckets WHERE id = $1 AND user_id = $2", [
        req.params.id,
        req.user.id,
      ]);

      await client.query("COMMIT");
      res.json({ message: "Reassigned and deleted" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }),
);

module.exports = router;
