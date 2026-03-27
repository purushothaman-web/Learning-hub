const express = require('express');
const router = express.Router();
const { MAX_CONTEXT_LENGTH } = require('../lib/config');
const { isString } = require('../lib/db');
const { hasGeminiKey, createGeminiModel } = require('../lib/ai');

router.post('/', async (req, res) => {
  try {
    const { topicId, lessonId, content, style } = req.body;

    if (!isString(content) || !content.trim()) {
      return res.status(400).json({ error: 'Lesson content is required.' });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({ error: 'Gemini API Key is missing.' });
    }

    const model = createGeminiModel();
    
    let stylePrompt = '';
    switch (style) {
      case 'ELI5':
        stylePrompt = 'Explain this like I am 5 years old. Use simple language and very basic concepts.';
        break;
      case 'Analogies':
        stylePrompt = 'Explain this using creative real-world analogies to make the abstract concepts concrete.';
        break;
      case 'Deep Dive':
        stylePrompt = 'Provide a technical deep dive. Explain the underlying mechanics, performance implications, and advanced edge cases.';
        break;
      default:
        stylePrompt = 'Explain this lesson content in a clear, alternative way to help a student understand it better.';
    }

    const systemPrompt = `You are an expert AI software engineering tutor.\nStyle: ${stylePrompt}\nTopic: ${topicId || 'General'}\nLesson: ${lessonId || 'General'}`;
    const fullPrompt = `${systemPrompt}\n\nContent to explain:\n${content}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    res.json({ explanation: response.text() });
  } catch (err) {
    console.error('Explain Error:', err);
    res.status(500).json({ error: 'Failed to generate explanation.' });
  }
});

module.exports = router;
