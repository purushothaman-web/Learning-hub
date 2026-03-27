const express = require('express');
const router = express.Router();
const { PRACTICE_FILE, MAX_PRACTICE_CONTEXT_LENGTH } = require('../lib/config');
const { isString, readJsonFile, writeJsonFile } = require('../lib/db');
const { 
  hasGeminiKey, createGeminiModel, parseJsonFromText, 
  inferDifficulty, defaultChallenge, defaultEvaluation 
} = require('../lib/ai');

router.post('/generate', async (req, res) => {
  try {
    const { topicId, lessonId, lessonTitle, lessonSummary, lessonContent } = req.body;

    // Accept either lessonSummary (string) or lessonContent (array of strings from frontend)
    const rawContent = isString(lessonSummary) && lessonSummary.trim()
      ? lessonSummary
      : Array.isArray(lessonContent)
        ? lessonContent.join('\n')
        : '';

    if (!isString(topicId) || !topicId.trim() || !isString(lessonId) || !lessonId.trim() || !rawContent.trim()) {
      return res.status(400).json({ error: 'topicId, lessonId, and lessonSummary (or lessonContent) are required.' });
    }

    // Trim to max allowed length
    const lessonContext = rawContent.slice(0, MAX_PRACTICE_CONTEXT_LENGTH);

    if (!hasGeminiKey()) {
      return res.json(defaultChallenge({ topicId, lessonTitle, lessonSummary: lessonContext }));
    }

    const model = createGeminiModel();

    // Prompt explicitly anchors the challenge to the specific concept taught in the lesson,
    // not just the general topic — this is the core alignment fix.
    const prompt = `You are creating a coding practice challenge. The challenge MUST test the SPECIFIC concept taught in the lesson below — not general ${topicId} knowledge.

Lesson title: ${lessonTitle || lessonId}
Lesson content:
${lessonContext}

Rules:
- The challenge must directly exercise the concept explained above (e.g. if the lesson is about indexes, the challenge must involve writing or reasoning about indexes — not generic SQL).
- The starterCode must reflect the lesson's exact topic with relevant variable names and structure.
- Keep instructions practical and concrete, not vague.

Return ONLY valid JSON with these keys: title, difficulty (easy|medium|hard), durationMinutes (number), instructions (array of 3-5 strings), starterCode (string).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsed = parseJsonFromText(text);

    if (!parsed || !isString(parsed.title) || !Array.isArray(parsed.instructions) || !isString(parsed.starterCode)) {
      return res.json(defaultChallenge({ topicId, lessonTitle, lessonSummary: lessonContext }));
    }

    const difficulty = ['easy', 'medium', 'hard'].includes(parsed.difficulty) ? parsed.difficulty : inferDifficulty(lessonTitle);
    const durationMinutes = Number.isFinite(parsed.durationMinutes) ? Math.max(10, Math.min(90, Math.round(parsed.durationMinutes))) : 30;

    res.json({
      challengeId: `ch_${Date.now()}`,
      title: parsed.title,
      difficulty,
      durationMinutes,
      instructions: parsed.instructions.slice(0, 5).map((item) => String(item)),
      starterCode: parsed.starterCode
    });
  } catch (err) {
    console.error('Practice generation error:', err);
    res.json(defaultChallenge({ ...req.body, lessonSummary: req.body.lessonSummary || '' }));
  }
});

router.post('/evaluate', async (req, res) => {
  try {
    const {
      challengeId, topicId, lessonId, challengeTitle,
      challengePrompt, userCode, executionOutput, timeTakenSeconds
    } = req.body;

    if (!isString(topicId) || !isString(lessonId) || !isString(userCode)) {
      return res.status(400).json({ error: 'topicId, lessonId, and userCode are required.' });
    }

    let evaluation;
    if (!hasGeminiKey()) {
      evaluation = defaultEvaluation({ challengeTitle, userCode, executionOutput, timeTakenSeconds });
    } else {
      const model = createGeminiModel();
      const prompt = `You are evaluating a coding challenge solution.\nReturn ONLY valid JSON with keys: score(0-100), verdict(pass|needs_improvement), strengths(array of strings), gaps(array of strings), learnMore(array of strings), feedbackSummary(string).\nChallenge title: ${challengeTitle || ''}\nChallenge instructions: ${challengePrompt || ''}\nUser code:\n${userCode}\nExecution output:\n${executionOutput || ''}\nTime taken seconds: ${Number(timeTakenSeconds) || 0}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = parseJsonFromText(text);
      if (!parsed || !Number.isFinite(parsed.score)) {
        evaluation = defaultEvaluation({ challengeTitle, userCode, executionOutput, timeTakenSeconds });
      } else {
        evaluation = {
          score: Math.max(0, Math.min(100, Math.round(parsed.score))),
          verdict: parsed.verdict === 'pass' ? 'pass' : 'needs_improvement',
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map((x) => String(x)).slice(0, 4) : [],
          gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map((x) => String(x)).slice(0, 4) : [],
          learnMore: Array.isArray(parsed.learnMore) ? parsed.learnMore.map((x) => String(x)).slice(0, 4) : [],
          feedbackSummary: isString(parsed.feedbackSummary) ? parsed.feedbackSummary : 'Evaluation completed.'
        };
      }
    }

    const practiceDb = readJsonFile(PRACTICE_FILE, { attempts: [] });
    const attempt = {
      id: `att_${Date.now()}`,
      challengeId: isString(challengeId) ? challengeId : `ch_${Date.now()}`,
      topicId, lessonId,
      challengeTitle: isString(challengeTitle) ? challengeTitle : lessonId,
      challengePrompt: isString(challengePrompt) ? challengePrompt : '',
      userCode, executionOutput: isString(executionOutput) ? executionOutput : '',
      timeTakenSeconds: Number(timeTakenSeconds) || 0,
      createdAt: new Date().toISOString(),
      ...evaluation
    };

    const nextDb = {
      attempts: [...(Array.isArray(practiceDb.attempts) ? practiceDb.attempts : []), attempt].slice(-500)
    };
    writeJsonFile(PRACTICE_FILE, nextDb);

    res.json({ ...evaluation, attemptId: attempt.id });
  } catch (err) {
    console.error('Practice evaluation error:', err);
    res.status(500).json({ error: 'Failed to evaluate practice attempt.' });
  }
});

router.get('/attempts', (req, res) => {
  try {
    const { topicId, lessonId } = req.query;
    const practiceDb = readJsonFile(PRACTICE_FILE, { attempts: [] });
    let attempts = Array.isArray(practiceDb.attempts) ? practiceDb.attempts : [];

    if (isString(topicId) && topicId.trim()) {
      attempts = attempts.filter((item) => item.topicId === topicId);
    }
    if (isString(lessonId) && lessonId.trim()) {
      attempts = attempts.filter((item) => item.lessonId === lessonId);
    }

    attempts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ attempts: attempts.slice(0, 20) });
  } catch {
    res.status(500).json({ error: 'Failed to load practice attempts.' });
  }
});

router.get('/stats', (req, res) => {
  try {
    const practiceDb = readJsonFile(PRACTICE_FILE, { attempts: [] });
    const attempts = Array.isArray(practiceDb.attempts) ? practiceDb.attempts : [];

    if (attempts.length === 0) {
      return res.json({ totalAttempts: 0, averageScore: 0, topicStats: [], scoreHistory: [] });
    }

    const topicMap = {};
    const history = attempts
      .map(att => ({ date: att.createdAt.split('T')[0], score: att.score }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    attempts.forEach(att => {
      if (!topicMap[att.topicId]) {
        topicMap[att.topicId] = { topicId: att.topicId, count: 0, totalScore: 0 };
      }
      topicMap[att.topicId].count++;
      topicMap[att.topicId].totalScore += att.score;
    });

    const topicStats = Object.values(topicMap).map(t => ({
      topicId: t.topicId,
      avgScore: Math.round(t.totalScore / t.count),
      attempts: t.count
    }));

    const avgScore = Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length);

    res.json({
      totalAttempts: attempts.length,
      averageScore: avgScore,
      topicStats,
      scoreHistory: history.slice(-30)
    });
  } catch (err) {
    console.error('Stats aggregation error:', err);
    res.status(500).json({ error: 'Kernel failed to aggregate telemetry.' });
  }
});

module.exports = router;