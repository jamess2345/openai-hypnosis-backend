const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/generate-reasons', async (req, res) => {
  const { goals } = req.body;
  if (!goals || !Array.isArray(goals)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const results = await Promise.all(goals.map(async goal => {
      const prompt = goal.startsWith("Rephrase this vague or informal goal")
        ? goal
        : `Give me exactly 2 short, first-person, hypnotic affirmations to support the goal: "${goal}". Do not number or bullet them. Make them sound calm, confident, and soothing.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      });

      return completion.choices[0].message.content.trim();
    }));

    res.json({ reasons: results });
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "Failed to generate reasons from OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
