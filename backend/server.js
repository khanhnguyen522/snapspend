const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const pool = require("./src/db");
const { readReceipt } = require("./src/claudeService");

const upload = multer({ dest: "uploads/" });
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "snapspend-secret-key";

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Auth middleware ────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message: "Snapspend API running" }));

// ── Auth routes ────────────────────────────────────────────────────────────────
app.post("/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (exists.rows.length > 0)
      return res.status(400).json({ error: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email.toLowerCase(), hash, name || email.split("@")[0]],
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid email or password" });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(400).json({ error: "Invalid email or password" });
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "30d",
    });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/auth/me", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Expenses ───────────────────────────────────────────────────────────────────
app.get("/expenses", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC, created_at DESC",
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/expenses/scan", auth, upload.single("photo"), async (req, res) => {
  try {
    const data = await readReceipt(req.file.path);
    const photo_url = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, entry_type, note, user_id)
       VALUES ($1, $2, $3, $4, $5, 'scan', $6, $7) RETURNING *`,
      [
        data.store_name,
        data.amount,
        data.category,
        data.date,
        photo_url,
        req.body.note || null,
        req.user.id,
      ],
    );
    res.json({ expense: result.rows[0], extracted: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/expenses/manual", auth, upload.single("photo"), async (req, res) => {
  try {
    const { store_name, amount, category, date, note } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, note, entry_type, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, 'manual', $7) RETURNING *`,
      [
        store_name || "Manual entry",
        parseFloat(amount),
        category || "uncategorized",
        date || new Date().toISOString().split("T")[0],
        photo_url,
        note || null,
        req.user.id,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/expenses/:id", auth, upload.single("photo"), async (req, res) => {
  try {
    const { store_name, amount, category, date, note } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : undefined;
    const fields = [];
    const values = [];
    let idx = 1;
    if (store_name !== undefined) {
      fields.push(`store_name=$${idx++}`);
      values.push(store_name);
    }
    if (amount !== undefined) {
      fields.push(`amount=$${idx++}`);
      values.push(parseFloat(amount));
    }
    if (category !== undefined) {
      fields.push(`category=$${idx++}`);
      values.push(category);
    }
    if (date !== undefined) {
      fields.push(`date=$${idx++}`);
      values.push(date);
    }
    if (note !== undefined) {
      fields.push(`note=$${idx++}`);
      values.push(note);
    }
    if (photo_url !== undefined) {
      fields.push(`photo_url=$${idx++}`);
      values.push(photo_url);
    }
    values.push(req.params.id);
    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE expenses SET ${fields.join(", ")} WHERE id = $${idx} AND user_id = $${idx + 1} RETURNING *`,
      values,
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/expenses/:id", auth, async (req, res) => {
  try {
    const row = await pool.query(
      "SELECT photo_url FROM expenses WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id],
    );
    if (row.rows[0]?.photo_url) {
      try {
        fs.unlinkSync(path.join(__dirname, row.rows[0].photo_url));
      } catch {}
    }
    await pool.query("DELETE FROM expenses WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Buckets ────────────────────────────────────────────────────────────────────
app.get("/categories", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM buckets WHERE user_id = $1 ORDER BY created_at ASC",
      [req.user.id],
    );
    res.json({ categories: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/categories", auth, async (req, res) => {
  try {
    const { id, name, icon, budget } = req.body;
    const result = await pool.query(
      `INSERT INTO buckets (id, name, icon, budget, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, name, icon || "💰", parseFloat(budget) || 0, req.user.id],
    );
    res.json({ category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/categories/:id", auth, async (req, res) => {
  try {
    const { name, icon, budget } = req.body;
    const result = await pool.query(
      `UPDATE buckets SET name=$1, icon=$2, budget=$3
       WHERE id=$4 AND user_id=$5 RETURNING *`,
      [name, icon, parseFloat(budget) || 0, req.params.id, req.user.id],
    );
    res.json({ category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/categories/:id", auth, async (req, res) => {
  try {
    await pool.query("DELETE FROM buckets WHERE id=$1 AND user_id=$2", [
      req.params.id,
      req.user.id,
    ]);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`Snapspend API on port ${process.env.PORT || 3001}`),
);
