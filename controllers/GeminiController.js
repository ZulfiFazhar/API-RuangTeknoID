const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

class GeminiController {
  static async generateText(req, res) {
    try {
      const { prompt } = req.body;

      const result = await model.generateContent(prompt);
      res.status(200).json({
        status: "success",
        message: "Text generated successfully",
        data: {
          response: result.response.text(),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to generate text" });
    }
  }
}

module.exports = GeminiController;
