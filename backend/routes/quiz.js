const express = require('express');
const router = express.Router();
const { QUIZ_FILE, MAX_PRACTICE_CONTEXT_LENGTH } = require('../lib/config');
const { isString, readJsonFile, writeJsonFile } = require('../lib/db');
const { hasGeminiKey, createGeminiModel, parseJsonFromText } = require('../lib/ai');

router.post('/generate', async (req, res) => {
  try {
    const { topicId, lessonId, lessonTitle, lessonContent } = req.body;

    if (!isString(lessonContent) || !lessonContent.trim()) {
      return res.status(400).json({ error: 'Lesson content is required.' });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({ error: 'Gemini API Key is missing.' });
    }

    const model = createGeminiModel();
    const prompt = `Create a 5-question multiple choice quiz for this lesson.\nReturn ONLY valid JSON as an array of objects. Each object must have: question(string), options(array of 4 strings), correctAnswerIndex(number 0-3).\nTopic: ${topicId}\nLesson: ${lessonTitle || lessonId}\nContent:\n${lessonContent}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJsonFromText(text);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Invalid quiz format generated.');
    }

    res.json({ quiz: parsed });
  } catch (err) {
    console.error('Quiz Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

router.post('/score', (req, res) => {
  try {
    const { topicId, lessonId, score, total } = req.body;
    
    const quizDb = readJsonFile(QUIZ_FILE, { completions: [] });
    const completion = {
      id: `qz_${Date.now()}`,
      topicId,
      lessonId,
      score,
      total,
      percentage: Math.round((score / total) * 100),
      createdAt: new Date().toISOString()
    };

    quizDb.completions.push(completion);
    writeJsonFile(QUIZ_FILE, quizDb);

    res.json({ message: 'Quiz score recorded.', completion });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record quiz score.' });
  }
});

module.exports = router;
