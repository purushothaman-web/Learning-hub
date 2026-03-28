const express = require('express');
const router = express.Router();
const { MAX_CHAT_PROMPT_LENGTH, MAX_CONTEXT_LENGTH } = require('../lib/config');
const { isString } = require('../lib/db');
const { hasGeminiKey, createGeminiModel } = require('../lib/ai');
const { getSetting, buildLearnerProfile } = require('../lib/profile');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Builds a rich, structured system instruction for the AI tutor.
 * Separating this keeps the route handler clean and makes prompt
 * iteration easy without touching business logic.
 */
function buildSystemInstruction(experienceLevel, profile, contextStr) {
  const weakTopics = profile.weakTopics?.length
    ? `The learner struggles with: ${profile.weakTopics.map(w => w.lesson_id).join(', ')}.`
    : '';

  const scoreNote = profile.averageScore != null
    ? `Their average quiz score is ${profile.averageScore}%.`
    : '';

  return `
You are an expert AI software engineering tutor inside a Learning Hub application.

## Your Role
- Guide learners through software engineering concepts step by step.
- Adapt explanations to the learner's level. Never talk down or over-complicate.
- Stay strictly educational. Do not answer questions unrelated to software engineering or technology.
- If a question is ambiguous, ask one clarifying question before answering.

## Learner Profile
- Experience Level: ${experienceLevel}
- Current Topic: ${contextStr}
- ${scoreNote}
- ${weakTopics}

## Response Format Rules
- Always respond in clean **Markdown**.
- For code examples: use fenced code blocks with the correct language tag (e.g. \`\`\`javascript).
- Keep answers concise but complete. Prefer bullet points over long paragraphs.
- End every response with a "💡 Quick Tip" or a follow-up question to encourage deeper thinking.
- If the learner's level is "Beginner", use simple analogies before technical details.
- If the learner's level is "Advanced", skip basics and go straight to nuance and edge cases.

## Hard Boundaries
- Never generate harmful, offensive, or non-educational content.
- If asked something outside software engineering, respond: "I'm your coding tutor — let's keep it technical! 😊"
`.trim();
}

/**
 * Normalizes conversation history from the request body.
 * Expects: [{ role: 'user' | 'model', text: string }]
 * Returns Gemini-compatible `contents` array.
 */
function buildChatHistory(history = []) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(msg => isString(msg?.text) && ['user', 'model'].includes(msg?.role))
    .slice(-10) // Keep last 10 turns to stay within token limits
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));
}

// ─── Route ───────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { prompt, context, history } = req.body;

    // ── Input Validation ────────────────────────────────────────────────────
    if (!isString(prompt) || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt must be a non-empty string.' });
    }
    if (prompt.length > MAX_CHAT_PROMPT_LENGTH) {
      return res.status(400).json({
        error: `Prompt too large. Maximum ${MAX_CHAT_PROMPT_LENGTH} characters.`,
      });
    }

    const contextStr = isString(context) ? context.trim() : 'General Engineering';
    if (contextStr.length > MAX_CONTEXT_LENGTH) {
      return res.status(400).json({
        error: `Context too large. Maximum ${MAX_CONTEXT_LENGTH} characters.`,
      });
    }

    if (!hasGeminiKey()) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.',
      });
    }

    // ── Build Prompt & Profile ───────────────────────────────────────────────
    const experienceLevel = getSetting('experienceLevel', 'Beginner');
    const profile = buildLearnerProfile();

    const systemInstruction = buildSystemInstruction(experienceLevel, profile, contextStr);
    const chatHistory = buildChatHistory(history);

    // ── Call Gemini ──────────────────────────────────────────────────────────
    const model = createGeminiModel({
      systemInstruction,           // Passed as a dedicated field, not mixed into the prompt
      generationConfig: {
        temperature: 0.5,          // Balanced: creative enough, but not hallucinatory
        maxOutputTokens: 1024,
      },
    });

    // Use startChat for multi-turn support when history is provided
    if (chatHistory.length > 0) {
      const chat = model.startChat({ history: chatHistory });
      const result = await chat.sendMessage(prompt.trim());
      const reply = result.response.text();
      return res.json({ reply });
    }

    // Single-turn fallback (no history)
    const result = await model.generateContent(prompt.trim());
    const reply = result.response.text();
    return res.json({ reply });

  } catch (err) {
    // Distinguish Gemini API errors from unexpected crashes
    const isGeminiError = err?.message?.includes('GoogleGenerativeAI');
    console.error('[AI Chat Route]', isGeminiError ? 'Gemini API error:' : 'Unexpected error:', err);

    res.status(500).json({
      error: isGeminiError
        ? 'The AI service returned an error. Please try again.'
        : 'An unexpected server error occurred.',
    });
  }
});

module.exports = router;