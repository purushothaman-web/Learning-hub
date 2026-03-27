const express = require('express');
const router = express.Router();
const { QUIZ_FILE, MAX_PRACTICE_CONTEXT_LENGTH } = require('../lib/config');
const { isString, readJsonFile, writeJsonFile } = require('../lib/db');
const { hasGeminiKey, createGeminiModel, parseJsonFromText } = require('../lib/ai');

router.post('/generate', async (req, res) => {
  try {
    const { topicId, lessonId, lessonTitle, lessonContent } = req.body;

    // Accept lessonContent as either a joined string or an array of paragraphs
    const contentStr = Array.isArray(lessonContent)
      ? lessonContent.join('\n')
      : isString(lessonContent) ? lessonContent : '';

    if (!contentStr.trim()) {
      return res.status(400).json({ error: 'Lesson content is required.' });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({ error: 'Gemini API Key is missing.' });
    }

    const model = createGeminiModel();
    const prompt = `You are creating a comprehension quiz. Generate exactly 5 multiple choice questions that test understanding of the SPECIFIC concepts explained in the lesson content below. Do not ask generic questions about the topic — every question must be answerable only by someone who read this lesson.

Lesson: ${lessonTitle || lessonId}
Content:
${contentStr.slice(0, MAX_PRACTICE_CONTEXT_LENGTH)}

Return ONLY valid JSON as an array of 5 objects. Each object must have:
- question (string)
- options (array of exactly 4 strings)
- correctAnswerIndex (number 0-3)
- explanation (string — one sentence explaining why the answer is correct)

No preamble, no markdown, just the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJsonFromText(text);

    // Flexible extraction: handle direct array or { "quiz": [...] } wrapper
    const quizArray = Array.isArray(parsed) 
      ? parsed 
      : (parsed && Array.isArray(parsed.quiz)) ? parsed.quiz : null;

    if (!quizArray || quizArray.length === 0) {
      throw new Error('Invalid quiz format generated.');
    }

    res.json({ quiz: quizArray });
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