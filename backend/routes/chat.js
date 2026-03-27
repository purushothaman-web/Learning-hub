const express = require('express');
const router = express.Router();
const { MAX_CHAT_PROMPT_LENGTH, MAX_CONTEXT_LENGTH } = require('../lib/config');
const { isString } = require('../lib/db');
const { hasGeminiKey, createGeminiModel } = require('../lib/ai');

router.post('/', async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!isString(prompt) || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
    }
    if (prompt.length > MAX_CHAT_PROMPT_LENGTH) {
      return res.status(400).json({ error: `Prompt too large. Maximum ${MAX_CHAT_PROMPT_LENGTH} characters.` });
    }
    if (context !== undefined && !isString(context)) {
      return res.status(400).json({ error: 'Context must be a string when provided.' });
    }
    if (isString(context) && context.length > MAX_CONTEXT_LENGTH) {
      return res.status(400).json({ error: `Context too large. Maximum ${MAX_CONTEXT_LENGTH} characters.` });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({ error: 'Gemini API Key is missing. Please add it to your .env file.' });
    }

    const model = createGeminiModel();
    const systemPrompt = `You are an expert AI software engineering tutor inside a Learning Hub.\nThe user is currently studying the topic: ${context || 'General Engineering'}.\nAnswer clearly using Markdown and keep it strictly educational.`;
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    res.json({ reply: response.text() });
  } catch (err) {
    console.error('AI Core Engine Error:', err);
    res.status(500).json({ error: 'Failed to communicate with the Gemini AI Core.' });
  }
});

module.exports = router;
