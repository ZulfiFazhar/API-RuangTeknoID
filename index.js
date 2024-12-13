const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
// const { testingConnection } = require("./config/db");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/user", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Ruang Tekno ID API");
});

// app.get("/testdb", testingConnection);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
