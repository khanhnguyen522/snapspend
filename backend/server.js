const express = require("express");
const cors = require("cors");

const { port } = require("./src/config");
const errorHandler = require("./src/middleware/errorHandler");
const authRoutes = require("./src/routes/auth");
const expenseRoutes = require("./src/routes/expenses");
const categoryRoutes = require("./src/routes/categories");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "Snapspend API running" }));

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/categories", categoryRoutes);

app.use(errorHandler);

app.listen(port, () => console.log(`Snapspend API on port ${port}`));
