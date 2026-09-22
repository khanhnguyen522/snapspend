const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../db");
const auth = require("../middleware/auth");
const { loginLimiter } = require("../middleware/rateLimiter");
const asyncHandler = require("../utils/asyncHandler");
const { jwtSecret, jwtExpiresIn } = require("../config");

const router = express.Router();

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

router.post(
  "/register",
  asyncHandler(async (req, res) => {
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
    res.json({ token: signToken(user), user });
  }),
);

router.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    const user = result.rows[0];
    const valid = user && (await bcrypt.compare(password, user.password_hash));
    if (!valid)
      return res.status(400).json({ error: "Invalid email or password" });

    res.json({
      token: signToken(user),
      user: { id: user.id, email: user.email, name: user.name },
    });
  }),
);

router.get(
  "/me",
  auth,
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [req.user.id],
    );
    res.json(result.rows[0]);
  }),
);

module.exports = router;
