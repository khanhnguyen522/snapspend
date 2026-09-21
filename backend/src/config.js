require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET || "snapspend-secret-key";

if (!process.env.JWT_SECRET) {
  console.warn(
    "WARNING: JWT_SECRET is not set in the environment — using an insecure default. " +
      "Set JWT_SECRET before deploying to production.",
  );
}

module.exports = {
  port: process.env.PORT || 3001,
  jwtSecret,
  jwtExpiresIn: "30d",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "snapspend",
  },
};
