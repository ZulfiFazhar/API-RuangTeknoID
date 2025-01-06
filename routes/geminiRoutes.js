const express = require("express");
const geminiController = require("../controllers/GeminiController");

const router = express.Router();

router.post("/generate-text", geminiController.generateText);

module.exports = router;
