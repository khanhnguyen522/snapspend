// Centralized error handler. Routes that need a specific status/message for
// an expected error (e.g. a foreign-key violation) still catch and respond
// locally; anything else reaches here as a generic 500.
const errorHandler = (err, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl} ERROR:`, err);
  res.status(err.status || 500).json({ error: err.message });
};

module.exports = errorHandler;
