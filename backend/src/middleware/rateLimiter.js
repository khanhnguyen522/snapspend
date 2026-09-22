const rateLimit = require("express-rate-limit");

// Limits POST /auth/login to 5 attempts per 5 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Too many login attempts. Try again in a few minutes (max 5 attempts per 5 min).",
  },
});

module.exports = { loginLimiter };
