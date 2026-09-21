const express = require("express");
const multer = require("multer");

const pool = require("../db");
const auth = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { readReceipt } = require("../claudeService");
const { normalizeImage } = require("../imageUtils");
const { uploadToS3, deleteFromS3, getSignedPhotoUrl } = require("../s3");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(auth);

const buildPhotoKey = (userId, originalname) => {
  const safeName = (originalname || "photo").replace(/[^a-zA-Z0-9._-]/g, "_");
  return `receipts/${userId}/${Date.now()}-${safeName}`;
};

const uploadPhotoIfPresent = async (req) => {
  if (!req.file) return undefined;
  const { buffer, mimeType } = await normalizeImage(
    req.file.buffer,
    req.file.mimetype,
  );
  const key = buildPhotoKey(req.user.id, req.file.originalname);
  await uploadToS3(buffer, key, mimeType);
  return key;
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
      [req.user.id],
    );
    const withUrls = await Promise.all(
      result.rows.map(async (row) => {
        try {
          return {
            ...row,
            photo_url: await getSignedPhotoUrl(row.photo_url),
          };
        } catch (signErr) {
          console.error(
            "SIGN URL ERROR for row",
            row.id,
            "key:",
            row.photo_url,
            signErr,
          );
          return { ...row, photo_url: null };
        }
      }),
    );
    res.json(withUrls);
  }),
);

router.post(
  "/scan",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No photo file received" });
    }
    // Scan is read-only: nothing is uploaded to S3 or inserted into the DB here.
    const { data } = await readReceipt(req.file.buffer, req.file.mimetype);
    res.json({ extracted: data });
  }),
);

router.post(
  "/confirm-scan",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const { store_name, amount, category, date, note } = req.body;
    const photo_url = await uploadPhotoIfPresent(req); // uploads to S3 now, for the first time
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, entry_type, note, user_id)
       VALUES ($1, $2, $3, $4, $5, 'scan', $6, $7) RETURNING *`,
      [
        store_name,
        parseFloat(amount),
        category,
        date,
        photo_url || null,
        note || null,
        req.user.id,
      ],
    );
    res.json(result.rows[0]);
  }),
);

router.post(
  "/manual",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const { store_name, amount, category, date, note } = req.body;
    const photo_url = await uploadPhotoIfPresent(req);
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, note, entry_type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7) RETURNING *`,
      [
        store_name || "Manual entry",
        parseFloat(amount),
        category || "uncategorized",
        date || new Date().toISOString().split("T")[0],
        photo_url || null,
        note || null,
        req.user.id,
      ],
    );
    res.json(result.rows[0]);
  }),
);

router.patch(
  "/:id",
  upload.single("photo"),
  asyncHandler(async (req, res) => {
    const { store_name, amount, category, date, note } = req.body;

    let photo_url; // stays undefined if no new photo -> field skipped in UPDATE
    if (req.file) {
      // fetch old key first so we can delete it after a successful upload
      const existing = await pool.query(
        "SELECT photo_url FROM expenses WHERE id = $1 AND user_id = $2",
        [req.params.id, req.user.id],
      );
      photo_url = await uploadPhotoIfPresent(req);
      if (existing.rows[0]?.photo_url) {
        await deleteFromS3(existing.rows[0].photo_url);
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;
    const setField = (name, value) => {
      fields.push(`${name}=$${idx++}`);
      values.push(value);
    };
    if (store_name !== undefined) setField("store_name", store_name);
    if (amount !== undefined) setField("amount", parseFloat(amount));
    if (category !== undefined) setField("category", category);
    if (date !== undefined) setField("date", date);
    if (note !== undefined) setField("note", note);
    if (photo_url !== undefined) setField("photo_url", photo_url);

    values.push(req.params.id, req.user.id);
    const result = await pool.query(
      `UPDATE expenses SET ${fields.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      values,
    );
    res.json(result.rows[0]);
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const row = await pool.query(
      "SELECT photo_url FROM expenses WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id],
    );
    if (row.rows[0]?.photo_url) {
      await deleteFromS3(row.rows[0].photo_url);
    }
    await pool.query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Deleted" });
  }),
);

module.exports = router;
