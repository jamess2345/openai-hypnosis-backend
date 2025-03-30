const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/generate-reasons', async (req, res) => {
  const { goals } = req.body;
  if (!goals || !Array.isArray(goals)) return res.status(400).send({ error: "Invalid input" });

  try {
    const results = await Promise.all(goals.map(async goal => {
      const prompt = `Give me 3 motivational reasons why someone would want to ${goal}. Respond in bullet points.`;
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8
      });
      return completion.data.choices[0].message.content.trim();
    }));

    res.send({ reasons: results });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "OpenAI request failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
