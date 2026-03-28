const express = require('express');
const router = express.Router();
const { MAX_PRACTICE_CONTEXT_LENGTH } = require('../lib/config');
const { isString, getDb } = require('../lib/db');
const {
  hasGeminiKey, createGeminiModel, parseJsonFromText,
  inferDifficulty, defaultChallenge, defaultEvaluation
} = require('../lib/ai');
const { buildLearnerProfile } = require('../lib/profile');
const { updateCard, toSM2Quality } = require('../lib/sm2');
const { randomUUID } = require('crypto'); // Collision-safe IDs

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_USER_CODE_LENGTH  = 8000;  // ~2k tokens — enough for any practice task
const MAX_OUTPUT_LENGTH     = 2000;
const MAX_TIME_SECONDS      = 7200;  // 2 hours ceiling

// ─── Prompt Builders ──────────────────────────────────────────────────────────

/**
 * System instruction shared by both generate and evaluate.
 * Keeping it separate makes A/B testing prompts straightforward.
 */
function buildPracticeSystemInstruction(role) {
  return `
You are an expert AI software engineering tutor inside a Learning Hub application.
Your role: ${role}

## Hard Rules
- Respond ONLY with a single valid JSON object. No markdown fences, no preamble, no explanation.
- Do not include any text before or after the JSON.
- All string values in the JSON must be clean, readable, and educational.
- Never invent or hallucinate code that doesn't relate to the lesson topic.
`.trim();
}

/**
 * Builds the user-facing prompt for challenge generation.
 */
function buildGeneratePrompt(profile, lessonTitle, lessonId, lessonContext) {
  const weakOverlap = profile.weakTopics?.some(w => w.lesson_id === lessonId);
  const repetitions = profile.currentCard?.repetitions ?? 0;
  const lastScore   = profile.currentCard?.last_score ?? null;

  const difficultyGuidance =
    profile.averageScore > 85 ? 'Make the challenge HARD — add constraints, edge cases, or performance requirements.' :
    profile.averageScore > 60 ? 'Make the challenge MEDIUM — standard implementation with one or two edge cases.' :
                                'Make the challenge EASY — focus on the core concept only, minimal edge cases.';

  const weakNote = weakOverlap
    ? 'IMPORTANT: The learner has previously struggled with this topic. Add an extra edge case that targets their gap.'
    : '';

  const progressNote = repetitions > 0
    ? `They have attempted this lesson ${repetitions} time(s). Last score: ${lastScore ?? 'unknown'}.`
    : 'This is their first attempt at this lesson.';

  return `
Generate a coding practice challenge for the lesson described below.

## Learner Profile
- Average score across all lessons: ${profile.averageScore}%
- ${progressNote}
- ${weakNote}

## Difficulty Guidance
${difficultyGuidance}

## Lesson Details
- Title: ${lessonTitle}
- Content:
${lessonContext}

## Required JSON Output Shape
Return exactly this structure (no extra keys):
{
  "title": "string — a short, specific challenge title",
  "difficulty": "easy | medium | hard",
  "durationMinutes": number (between 10 and 90),
  "instructions": ["string", "string", "string"] (3 to 5 clear steps),
  "starterCode": "string — syntactically valid starter code relevant to the lesson"
}
`.trim();
}

/**
 * Builds the user-facing prompt for solution evaluation.
 */
function buildEvaluatePrompt({ challengeTitle, challengePrompt, userCode, executionOutput, timeTakenSeconds }) {
  return `
Evaluate the learner's coding challenge solution below.

## Challenge
- Title: ${challengeTitle || 'Untitled'}
- Instructions:
${challengePrompt || 'No instructions provided.'}

## Learner Submission
\`\`\`
${userCode}
\`\`\`

## Execution Output
${executionOutput || 'No output recorded.'}

## Time Taken
${timeTakenSeconds} seconds

## Required JSON Output Shape
Return exactly this structure (no extra keys):
{
  "score": number (0–100),
  "verdict": "pass | needs_improvement",
  "strengths": ["string"] (up to 4 — what the learner did well),
  "gaps": ["string"] (up to 4 — specific things to improve),
  "learnMore": ["string"] (up to 4 — topic names or concepts to explore next),
  "feedbackSummary": "string — 2 to 3 sentence overall summary for the learner"
}

## Scoring Guidance
- 90–100: Correct, clean, handles edge cases.
- 70–89: Correct core logic, minor issues.
- 50–69: Partially correct or has significant gaps.
- Below 50: Incorrect or missing key requirements.
- A verdict of "pass" requires a score of 70 or above.
`.trim();
}

// ─── Input Sanitisers ─────────────────────────────────────────────────────────

function sanitiseTimeTaken(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), MAX_TIME_SECONDS);
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/generate', async (req, res) => {
  try {
    const { topicId, lessonId, lessonTitle, lessonSummary, lessonContent } = req.body;

    // ── Resolve content source ─────────────────────────────────────────────
    const rawContent = isString(lessonSummary) && lessonSummary.trim()
      ? lessonSummary
      : Array.isArray(lessonContent)
        ? lessonContent.join('\n')
        : '';

    if (!isString(topicId) || !topicId.trim() ||
        !isString(lessonId) || !lessonId.trim() ||
        !rawContent.trim()) {
      return res.status(400).json({
        error: 'topicId, lessonId, and lessonSummary (or lessonContent) are required.',
      });
    }

    const lessonContext = rawContent.slice(0, MAX_PRACTICE_CONTEXT_LENGTH);

    // ── Fallback if no API key ─────────────────────────────────────────────
    if (!hasGeminiKey()) {
      return res.json(defaultChallenge({ topicId, lessonTitle, lessonSummary: lessonContext }));
    }

    // ── Build & send prompt ───────────────────────────────────────────────
    const profile = buildLearnerProfile(topicId, lessonId);

    const model = createGeminiModel({
      systemInstruction: buildPracticeSystemInstruction(
        'Generate a coding practice challenge tailored to the learner\'s level and the lesson content.'
      ),
      generationConfig: {
        temperature: 0.4,       // Low temp = consistent, valid JSON structure
        maxOutputTokens: 1024,
      },
    });

    const userPrompt = buildGeneratePrompt(
      profile,
      lessonTitle || lessonId,
      lessonId,
      lessonContext
    );

    const result  = await model.generateContent(userPrompt);
    const text    = result.response.text();
    const parsed  = parseJsonFromText(text);

    // ── Validate parsed shape ─────────────────────────────────────────────
    if (!parsed ||
        !isString(parsed.title) ||
        !Array.isArray(parsed.instructions) ||
        !isString(parsed.starterCode)) {
      console.warn('[Practice/generate] Malformed AI response, using default challenge.');
      return res.json(defaultChallenge({ topicId, lessonTitle, lessonSummary: lessonContext }));
    }

    const difficulty = ['easy', 'medium', 'hard'].includes(parsed.difficulty)
      ? parsed.difficulty
      : inferDifficulty(lessonTitle);

    const durationMinutes = Number.isFinite(parsed.durationMinutes)
      ? Math.max(10, Math.min(90, Math.round(parsed.durationMinutes)))
      : 30;

    return res.json({
      challengeId: `ch_${randomUUID()}`,   // Collision-safe
      title: parsed.title,
      difficulty,
      durationMinutes,
      instructions: parsed.instructions.slice(0, 5).map(String),
      starterCode: parsed.starterCode,
    });

  } catch (err) {
    console.error('[Practice/generate] Error:', err);
    res.json(defaultChallenge({ ...req.body, lessonSummary: req.body.lessonSummary || '' }));
  }
});

// ─────────────────────────────────────────────────────────────────────────────

router.post('/evaluate', async (req, res) => {
  const db = getDb();
  try {
    const {
      challengeId, topicId, lessonId, challengeTitle,
      challengePrompt, userCode, executionOutput,
    } = req.body;

    const timeTakenSeconds = sanitiseTimeTaken(req.body.timeTakenSeconds);

    // ── Input Validation ──────────────────────────────────────────────────
    if (!isString(topicId) || !topicId.trim() ||
        !isString(lessonId) || !lessonId.trim() ||
        !isString(userCode) || !userCode.trim()) {
      return res.status(400).json({ error: 'topicId, lessonId, and userCode are required.' });
    }

    if (userCode.length > MAX_USER_CODE_LENGTH) {
      return res.status(400).json({
        error: `Submitted code too large. Maximum ${MAX_USER_CODE_LENGTH} characters.`,
      });
    }

    // ── AI Evaluation ─────────────────────────────────────────────────────
    let evaluation;

    if (!hasGeminiKey()) {
      evaluation = defaultEvaluation({ challengeTitle, userCode, executionOutput, timeTakenSeconds });
    } else {
      const model = createGeminiModel({
        systemInstruction: buildPracticeSystemInstruction(
          'Evaluate a learner\'s coding challenge solution and return structured, constructive feedback.'
        ),
        generationConfig: {
          temperature: 0.2,     // Very low — evaluation must be consistent and objective
          maxOutputTokens: 1024,
        },
      });

      const userPrompt = buildEvaluatePrompt({
        challengeTitle,
        challengePrompt,
        userCode,
        executionOutput: isString(executionOutput)
          ? executionOutput.slice(0, MAX_OUTPUT_LENGTH)
          : '',
        timeTakenSeconds,
      });

      const result  = await model.generateContent(userPrompt);
      const text    = result.response.text();
      const parsed  = parseJsonFromText(text);

      if (!parsed || !Number.isFinite(parsed.score)) {
        console.warn('[Practice/evaluate] Malformed AI response, using default evaluation.');
        evaluation = defaultEvaluation({ challengeTitle, userCode, executionOutput, timeTakenSeconds });
      } else {
        evaluation = {
          score:           Math.max(0, Math.min(100, Math.round(parsed.score))),
          verdict:         parsed.verdict === 'pass' ? 'pass' : 'needs_improvement',
          strengths:       Array.isArray(parsed.strengths)  ? parsed.strengths.slice(0, 4).map(String)  : [],
          gaps:            Array.isArray(parsed.gaps)        ? parsed.gaps.slice(0, 4).map(String)        : [],
          learnMore:       Array.isArray(parsed.learnMore)   ? parsed.learnMore.slice(0, 4).map(String)   : [],
          feedbackSummary: isString(parsed.feedbackSummary)  ? parsed.feedbackSummary : 'Evaluation complete.',
        };
      }
    }

    // ── Persist — wrapped in a transaction ───────────────────────────────
    const attemptId = `att_${randomUUID()}`;
    const createdAt = Date.now();

    db.transaction(() => {
      // 1. Save attempt
      db.prepare(`
        INSERT INTO attempts (id, topic_id, lesson_id, type, score, verdict, time_taken_s, created_at)
        VALUES (?, ?, ?, 'practice', ?, ?, ?, ?)
      `).run(attemptId, topicId, lessonId, evaluation.score, evaluation.verdict, timeTakenSeconds, createdAt);

      // 2. Update SRS card
      const currentCard = db.prepare(
        'SELECT * FROM srs_cards WHERE topic_id = ? AND lesson_id = ?'
      ).get(topicId, lessonId);

      const quality  = toSM2Quality(evaluation.score);
      const nextCard = updateCard(currentCard, quality);

      db.prepare(`
        INSERT OR REPLACE INTO srs_cards
          (topic_id, lesson_id, interval, easiness, repetitions, next_review, last_score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        topicId, lessonId,
        nextCard.interval, nextCard.easiness, nextCard.repetitions,
        nextCard.next_review, nextCard.last_score
      );

      // 3. Mark as mastered if passing
      if (evaluation.verdict === 'pass') {
        db.prepare(`
          INSERT OR IGNORE INTO progress (topic_id, lesson_id, mastered_at)
          VALUES (?, ?, ?)
        `).run(topicId, lessonId, createdAt);
      }
    })(); // Execute immediately

    return res.json({ ...evaluation, attemptId });

  } catch (err) {
    console.error('[Practice/evaluate] Error:', err);
    res.status(500).json({ error: 'Failed to evaluate practice attempt.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

router.get('/attempts', (req, res) => {
  const db = getDb();
  try {
    const { topicId, lessonId } = req.query;
    let query = 'SELECT * FROM attempts WHERE 1=1';
    const params = [];

    if (isString(topicId) && topicId.trim()) {
      query += ' AND topic_id = ?';
      params.push(topicId.trim());
    }
    if (isString(lessonId) && lessonId.trim()) {
      query += ' AND lesson_id = ?';
      params.push(lessonId.trim());
    }

    query += ' ORDER BY created_at DESC LIMIT 20';
    const attempts = db.prepare(query).all(...params);

    const formatted = attempts.map(a => ({
      ...a,
      topicId:   a.topic_id,
      lessonId:  a.lesson_id,
      createdAt: new Date(a.created_at).toISOString(),
    }));

    return res.json({ attempts: formatted });

  } catch (err) {
    console.error('[Practice/attempts] Error:', err);
    res.status(500).json({ error: 'Failed to load practice attempts.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

router.get('/stats', (req, res) => {
  const db = getDb();
  try {
    const totalAttempts = db.prepare('SELECT COUNT(*) FROM attempts').pluck().get();

    if (totalAttempts === 0) {
      return res.json({ totalAttempts: 0, averageScore: 0, topicStats: [], scoreHistory: [] });
    }

    const averageScore = Math.round(
      db.prepare('SELECT AVG(score) FROM attempts').pluck().get()
    );

    const topicStats = db.prepare(`
      SELECT topic_id AS topicId, COUNT(*) AS attempts, ROUND(AVG(score)) AS avgScore
      FROM attempts
      GROUP BY topic_id
      ORDER BY attempts DESC
    `).all();

    // Only load what we need for history — avoid pulling full rows
    const scoreHistory = db.prepare(`
      SELECT created_at, score FROM attempts
      ORDER BY created_at ASC
      LIMIT 30
    `).all().map(a => ({
      date:  new Date(a.created_at).toISOString().split('T')[0],
      score: a.score,
    }));

    return res.json({ totalAttempts, averageScore, topicStats, scoreHistory });

  } catch (err) {
    console.error('[Practice/stats] Error:', err);
    res.status(500).json({ error: 'Failed to load practice statistics.' });
  }
});

module.exports = router;