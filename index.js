const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const postRoutes = require("./routes/postRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userActivityLog = require("./routes/userActivityLogRoutes");
require("dotenv").config();

const corsOptions = {
  origin: process.env.FE_HOST, // Ganti dengan URL frontend Anda
  optionsSuccessStatus: 200,
};

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Routes
app.use("/user", userRoutes);
app.use("/gemini", geminiRoutes);
app.use("/post", postRoutes);
app.use("/hashtag", hashtagRoutes);
app.use("/comment", commentRoutes);
app.use("/activity", userActivityLog);

app.get("/", (req, res) => {
  res.send("Welcome to the Ruang Tekno ID API");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
