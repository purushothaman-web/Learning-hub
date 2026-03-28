const express = require('express');
const router = express.Router();
const { MAX_PRACTICE_CONTEXT_LENGTH } = require('../lib/config');
const { isString, getDb } = require('../lib/db');
const { hasGeminiKey, createGeminiModel, parseJsonFromText } = require('../lib/ai');
const { getSetting, buildLearnerProfile } = require('../lib/profile');
const { updateCard, toSM2Quality } = require('../lib/sm2');
const { randomUUID } = require('crypto');

// ─── Constants ────────────────────────────────────────────────────────────────

const PASS_THRESHOLD     = 70;   // Single source of truth for pass/fail
const QUIZ_QUESTION_COUNT = 5;

// ─── Prompt Builders ──────────────────────────────────────────────────────────

/**
 * System instruction for the quiz AI.
 * Separated so it can be tuned independently of route logic.
 */
function buildQuizSystemInstruction() {
  return `
You are an expert AI software engineering tutor inside a Learning Hub application.
Your role: Generate comprehension quiz questions based on lesson content.

## Hard Rules
- Respond ONLY with a single valid JSON array. No markdown fences, no preamble, no explanation.
- Do not include any text before or after the JSON array.
- Every question must be directly and specifically answerable from the lesson content provided.
- Never generate generic questions that could be answered without reading the lesson.
`.trim();
}

/**
 * Builds the user-facing prompt for quiz generation.
 * Adapts question depth and style to the learner's level and history.
 */
function buildGeneratePrompt(lessonLabel, lessonContext, experienceLevel, profile) {
  const difficultyGuidance =
    profile.averageScore > 85
      ? 'Make questions HARD: test edge cases, nuanced distinctions, and deeper "why" understanding.'
      : profile.averageScore > 60
        ? 'Make questions MEDIUM: mix straightforward recall with some applied understanding.'
        : 'Make questions EASY: focus on core concept recall and basic understanding.';

  const levelNote =
    experienceLevel === 'Beginner'
      ? 'Use simple, plain language in questions and options. Avoid jargon in the question text itself.'
      : experienceLevel === 'Advanced'
        ? 'Questions can assume foundational knowledge — focus on nuance, trade-offs, and real-world implications.'
        : '';

  return `
Generate exactly ${QUIZ_QUESTION_COUNT} multiple-choice comprehension questions for the lesson below.

## Learner Profile
- Experience Level: ${experienceLevel}
- Average Score: ${profile.averageScore}%
- ${levelNote}

## Difficulty Guidance
${difficultyGuidance}

## Question Rules
- Every question must be answerable ONLY by someone who read this specific lesson.
- Do not ask generic questions about the topic that require outside knowledge.
- Vary the question types: some recall, some applied understanding, some "what would happen if...".
- All 4 options must be plausible — avoid obviously wrong distractors.
- The explanation must clearly state WHY the correct answer is right, not just restate it.

## Lesson
Title: ${lessonLabel}
Content:
${lessonContext}

## Required JSON Output Shape
Return ONLY a JSON array of exactly ${QUIZ_QUESTION_COUNT} objects. Each object must match:
[
  {
    "question": "string — the question text",
    "options": ["string", "string", "string", "string"],
    "correctAnswerIndex": number (0–3),
    "explanation": "string — one sentence explaining why the correct answer is right"
  }
]
`.trim();
}

// ─── Validators ───────────────────────────────────────────────────────────────

/**
 * Validates a single quiz question object.
 */
function isValidQuestion(q) {
  return (
    q &&
    isString(q.question) && q.question.trim() &&
    Array.isArray(q.options) && q.options.length === 4 &&
    q.options.every(o => isString(o) && o.trim()) &&
    Number.isInteger(q.correctAnswerIndex) &&
    q.correctAnswerIndex >= 0 && q.correctAnswerIndex <= 3 &&
    isString(q.explanation) && q.explanation.trim()
  );
}

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/generate', async (req, res) => {
  try {
    const { topicId, lessonId, lessonTitle, lessonContent } = req.body;

    // ── Resolve content ───────────────────────────────────────────────────
    const contentStr = Array.isArray(lessonContent)
      ? lessonContent.join('\n')
      : isString(lessonContent) ? lessonContent : '';

    if (!contentStr.trim()) {
      return res.status(400).json({ error: 'Lesson content is required.' });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.',
      });
    }

    // ── Build prompt ──────────────────────────────────────────────────────
    const experienceLevel = getSetting('experienceLevel', 'Beginner');
    const profile         = buildLearnerProfile(topicId, lessonId);
    const lessonLabel     = isString(lessonTitle) && lessonTitle.trim() ? lessonTitle : (lessonId || 'Lesson');
    const lessonContext   = contentStr.slice(0, MAX_PRACTICE_CONTEXT_LENGTH);

    const model = createGeminiModel({
      systemInstruction: buildQuizSystemInstruction(),
      generationConfig: {
        temperature:     0.3,    // Low temp = consistent JSON structure and accurate question targeting
        maxOutputTokens: 1536,   // 5 questions with explanations fit well within this
      },
    });

    const userPrompt = buildGeneratePrompt(lessonLabel, lessonContext, experienceLevel, profile);
    const result     = await model.generateContent(userPrompt);
    const text       = result.response.text();
    const parsed     = parseJsonFromText(text);

    // ── Normalise response shape ──────────────────────────────────────────
    // Handle: direct array OR { "quiz": [...] } wrapper
    const quizArray = Array.isArray(parsed)
      ? parsed
      : (parsed && Array.isArray(parsed.quiz)) ? parsed.quiz : null;

    if (!quizArray || quizArray.length === 0) {
      console.warn('[Quiz/generate] Malformed or empty AI response.');
      return res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
    }

    // ── Validate each question ────────────────────────────────────────────
    const validQuestions = quizArray.filter(isValidQuestion);

    if (validQuestions.length === 0) {
      console.warn('[Quiz/generate] No valid questions in AI response:', JSON.stringify(quizArray));
      return res.status(500).json({ error: 'Quiz generation produced invalid questions. Please try again.' });
    }

    // Partial success: return however many valid questions we got (up to 5)
    return res.json({
      quiz:  validQuestions.slice(0, QUIZ_QUESTION_COUNT),
      total: Math.min(validQuestions.length, QUIZ_QUESTION_COUNT),
    });

  } catch (err) {
    console.error('[Quiz/generate] Error:', err);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────

router.post('/score', (req, res) => {
  const db = getDb();
  try {
    const { topicId, lessonId, score, total } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────
    if (!isString(topicId) || !topicId.trim()) {
      return res.status(400).json({ error: 'topicId is required.' });
    }
    if (!isString(lessonId) || !lessonId.trim()) {
      return res.status(400).json({ error: 'lessonId is required.' });
    }

    const scoreNum = Number(score);
    const totalNum = Number(total);

    if (!Number.isFinite(scoreNum) || scoreNum < 0) {
      return res.status(400).json({ error: 'score must be a non-negative number.' });
    }
    if (!Number.isFinite(totalNum) || totalNum <= 0) {
      return res.status(400).json({ error: 'total must be a positive number.' });
    }
    if (scoreNum > totalNum) {
      return res.status(400).json({ error: 'score cannot exceed total.' });
    }

    // ── Compute result ────────────────────────────────────────────────────
    const percentage = Math.round((scoreNum / totalNum) * 100);
    const verdict    = percentage >= PASS_THRESHOLD ? 'pass' : 'needs_improvement';
    const createdAt  = Date.now();
    const attemptId  = `qz_${randomUUID()}`;

    // ── Persist — wrapped in a transaction ───────────────────────────────
    db.transaction(() => {
      // 1. Save attempt
      db.prepare(`
        INSERT INTO attempts (id, topic_id, lesson_id, type, score, verdict, time_taken_s, created_at)
        VALUES (?, ?, ?, 'quiz', ?, ?, 0, ?)
      `).run(attemptId, topicId, lessonId, percentage, verdict, createdAt);

      // 2. Update SRS card (keeps quiz scores in the spaced repetition system)
      const currentCard = db.prepare(
        'SELECT * FROM srs_cards WHERE topic_id = ? AND lesson_id = ?'
      ).get(topicId, lessonId);

      const quality  = toSM2Quality(percentage);
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
      if (verdict === 'pass') {
        db.prepare(`
          INSERT OR IGNORE INTO progress (topic_id, lesson_id, mastered_at)
          VALUES (?, ?, ?)
        `).run(topicId, lessonId, createdAt);
      }
    })();

    return res.json({
      message:    'Quiz score recorded.',
      completion: {
        id:         attemptId,
        topicId,
        lessonId,
        score:      scoreNum,
        total:      totalNum,
        percentage,
        verdict,
        createdAt,
      },
    });

  } catch (err) {
    console.error('[Quiz/score] Error:', err);
    res.status(500).json({ error: 'Failed to record quiz score.' });
  }
});

module.exports = router;