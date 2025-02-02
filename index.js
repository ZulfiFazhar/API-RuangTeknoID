const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const geminiRoutes = require("./routes/geminiRoutes");
const postRoutes = require("./routes/postRoutes");
const hashtagRoutes = require("./routes/hashtagRoutes");
const commentRoutes = require("./routes/commentRoutes");
const discussionRoutes = require("./routes/discussionRoutes");
const userActivityLog = require("./routes/userActivityLogRoutes");
const unsplashRoutes = require("./routes/unsplashRoutes");
const imageKitRoutes = require("./routes/imageKitRoutes");
require("dotenv").config();

const myFE = process.env.FE_HOST;

const corsOptions = {
  origin: myFE,
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
app.use("/discussion", discussionRoutes);
app.use("/activity", userActivityLog);
app.use("/unsplash", unsplashRoutes);
app.use("/imagekit", imageKitRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Ruang Tekno ID API");
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

console.log("My FE Host = ", myFE);
