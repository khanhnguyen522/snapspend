const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pool = require("./src/db");
const { readReceipt } = require("./src/claudeService");

const upload = multer({ dest: "uploads/" });

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/", (req, res) => res.json({ message: "Snapspend API running" }));

// Get budget
app.get("/budget", async (req, res) => {
  const result = await pool.query(
    "SELECT value FROM settings WHERE key = 'monthly_budget'",
  );
  res.json({ budget: result.rows[0]?.value || 500 });
});

// Update budget
app.put("/budget", async (req, res) => {
  const { budget } = req.body;
  await pool.query(
    "INSERT INTO settings (key, value) VALUES ('monthly_budget', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
    [budget],
  );
  res.json({ budget });
});

// Get all expenses
app.get("/expenses", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM expenses ORDER BY date DESC, created_at DESC",
  );
  res.json(result.rows);
});

// Scan receipt — auto extract via Claude
app.post("/expenses/scan", upload.single("photo"), async (req, res) => {
  try {
    const data = await readReceipt(req.file.path);
    const photo_url = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, entry_type, note, paid_by)
       VALUES ($1, $2, $3, $4, $5, 'scan', $6, $7) RETURNING *`,
      [
        data.store_name,
        data.amount,
        data.category,
        data.date,
        photo_url,
        req.body.note || null,
        req.body.paid_by || null,
      ],
    );
    res.json({ expense: result.rows[0], extracted: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Manual entry
app.post("/expenses/manual", upload.single("photo"), async (req, res) => {
  try {
    const { store_name, amount, category, date, note, paid_by } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO expenses (store_name, amount, category, date, photo_url, note, paid_by, entry_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'manual') RETURNING *`,
      [
        store_name || "Manual entry",
        parseFloat(amount),
        category || "other",
        date || new Date().toISOString().split("T")[0],
        photo_url,
        note || null,
        paid_by || null,
      ],
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settle a debt
app.patch("/expenses/:id/settle", async (req, res) => {
  const result = await pool.query(
    "UPDATE expenses SET is_settled = true WHERE id = $1 RETURNING *",
    [req.params.id],
  );
  res.json(result.rows[0]);
});

// Delete expense
app.delete("/expenses/:id", async (req, res) => {
  const row = await pool.query("SELECT photo_url FROM expenses WHERE id = $1", [
    req.params.id,
  ]);
  if (row.rows[0]?.photo_url) {
    const filePath = path.join(__dirname, row.rows[0].photo_url);
    try {
      fs.unlinkSync(filePath);
    } catch {}
  }
  await pool.query("DELETE FROM expenses WHERE id = $1", [req.params.id]);
  res.json({ message: "Deleted" });
});

// AI Insights
app.get("/insights", async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM expenses ORDER BY date DESC LIMIT 50",
  );
  if (result.rows.length === 0)
    return res.json({ insights: "No expenses yet." });
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const summary = result.rows
    .map((r) => `${r.store_name} $${r.amount} (${r.category}) ${r.date}`)
    .join("\n");
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `Analyze these expenses and give 3-4 short insights. Be specific with numbers. One sentence each.\n\n${summary}`,
      },
    ],
  });
  res.json({ insights: msg.content[0].text });
});

app.listen(process.env.PORT || 3001, () =>
  console.log(`Snapspend API on port ${process.env.PORT || 3001}`),
);
