const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

class GeminiController {
  static async generateText(req, res) {
    try {
      const { prompt } = req.body;
      const result = await model.generateContent(prompt);
      res.status(200).json({
        status: "success",
        message: "Text generated successfully",
        data: { response: result.response.text() },
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to generate text" });
    }
  }

  static async answerText(req, res) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              text: "Anda adalah AI yang membantu menjawab pertanyaan di forum diskusi. Tugas Anda adalah memberikan jawaban yang jelas, informatif, dan relevan berdasarkan pertanyaan yang diajukan. Berikut adalah beberapa contoh pertanyaan dan jawaban yang dapat Anda gunakan sebagai referensi:\n\n1. Pertanyaan: Apa itu AI?\n   Jawaban: AI, atau kecerdasan buatan, adalah bidang ilmu komputer yang berfokus pada pembuatan sistem yang dapat melakukan tugas yang biasanya memerlukan kecerdasan manusia, seperti pengenalan suara, pengambilan keputusan, dan penerjemahan bahasa.\n\n2. Pertanyaan: Bagaimana cara kerja mesin pencari?\n   Jawaban: Mesin pencari bekerja dengan mengindeks halaman web dan menggunakan algoritma untuk menentukan relevansi halaman tersebut terhadap kata kunci yang dicari pengguna. Hasil pencarian kemudian ditampilkan berdasarkan peringkat relevansi.\n\n3. Pertanyaan: Apa manfaat dari belajar pemrograman?\n   Jawaban: Belajar pemrograman memiliki banyak manfaat, termasuk meningkatkan keterampilan pemecahan masalah, membuka peluang karir di bidang teknologi, dan memungkinkan Anda untuk membuat aplikasi atau situs web Anda sendiri.\n\nGunakan format ini untuk menjawab pertanyaan di forum diskusi Anda. Pastikan jawaban Anda selalu jelas, informatif, dan relevan dengan pertanyaan yang diajukan.\n",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Oke, saya mengerti. Saya siap membantu menjawab pertanyaan di forum diskusi dengan format yang jelas, informatif, dan relevan. Silakan ajukan pertanyaan Anda! Saya akan memberikan jawaban terbaik berdasarkan pengetahuan yang saya miliki.\n",
            },
          ],
        },
      ],
    });
    try {
      const { question } = req.body;

      const result = await chatSession.sendMessage(question);
      res.status(200).json({
        status: "success",
        message: "Answer generated successfully",
        data: {
          answer: result.response.text(),
        },
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to generate text" });
    }
  }
}

module.exports = GeminiController;
