const express = require('express');
const router = express.Router();
const { MAX_CONTEXT_LENGTH } = require('../lib/config');
const { isString } = require('../lib/db');
const { hasGeminiKey, createGeminiModel } = require('../lib/ai');
const { getSetting, buildLearnerProfile } = require('../lib/profile');

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STYLES = ['ELI5', 'Analogies', 'Deep Dive', 'Default'];

// ─── Style Definitions ────────────────────────────────────────────────────────

/**
 * Each style defines:
 *  - instruction : what the AI should do
 *  - format      : how the response should be structured
 *  - tone        : voice/register to use
 */
const STYLE_CONFIGS = {
  ELI5: {
    instruction: `
Explain this lesson as if the learner is a complete beginner with zero technical background.
- Use everyday language. Avoid all jargon. If a technical term is unavoidable, define it immediately in plain English.
- Use short sentences and short paragraphs.
- Use a friendly, encouraging, and patient tone — like a kind teacher explaining to a curious child.
    `.trim(),
    format: `
## Response Format
1. Start with a one-sentence "Big Idea" that captures the core concept simply.
2. Use a simple real-life analogy (non-technical) to introduce the concept.
3. Walk through the concept step by step in plain language.
4. End with: "⭐ Remember: [one-sentence takeaway a child could repeat]"
    `.trim(),
    tone: 'Warm, simple, encouraging',
  },

  Analogies: {
    instruction: `
Explain this lesson by anchoring every concept to a vivid, creative real-world analogy.
- Choose analogies from everyday life (cooking, sports, cities, nature, etc.) — not from other programming concepts.
- Each analogy must map clearly: explain which part of the analogy corresponds to which technical idea.
- After the analogy, follow up with the accurate technical explanation so the learner isn't left with only a metaphor.
    `.trim(),
    format: `
## Response Format
1. Introduce the concept in one sentence.
2. Present the analogy clearly: "Think of [concept] like [real-world thing] because..."
3. Break down the analogy mapping: "Just like [X in analogy] → [X in code]..."
4. Follow with the technical explanation.
5. End with a "⚠️ Where the analogy breaks down:" note to prevent misconceptions.
    `.trim(),
    tone: 'Creative, visual, grounded',
  },

  'Deep Dive': {
    instruction: `
Provide a thorough technical deep dive into this concept.
- Assume the learner has solid fundamentals and wants to understand the "why" behind the "what".
- Cover: underlying mechanics, performance characteristics, common pitfalls, edge cases, and real-world usage patterns.
- Reference how this concept behaves differently across environments or contexts where relevant.
    `.trim(),
    format: `
## Response Format
1. **Overview**: Brief restatement of the concept and why it matters at an advanced level.
2. **How It Actually Works**: Internal mechanics / under the hood.
3. **Performance & Trade-offs**: Time/space complexity, memory, or runtime considerations.
4. **Edge Cases & Gotchas**: What trips up even experienced developers.
5. **Real-World Usage Patterns**: How this is used in production code.
6. **Further Exploration**: 1–2 advanced topics the learner can research next.
    `.trim(),
    tone: 'Precise, technical, thorough',
  },

  Default: {
    instruction: `
Explain this lesson content in a clear, well-structured alternative way to help the learner build a solid understanding.
- Be thorough but not overwhelming.
- Use code examples where they naturally aid understanding.
    `.trim(),
    format: `
## Response Format
1. Summarise the core idea in 1–2 sentences.
2. Explain the concept clearly with an example.
3. Highlight the most important things to remember.
4. End with a 💡 tip or a follow-up question to encourage curiosity.
    `.trim(),
    tone: 'Clear, balanced, educational',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the system instruction for the explanation route.
 * Kept separate so prompts can be iterated without touching route logic.
 */
function buildSystemInstruction(styleConfig, experienceLevel, profile, topicId, lessonId) {
  const weakNote = profile.weakTopics?.includes(topicId)
    ? `Note: This learner has previously struggled with this topic. Be extra clear and patient.`
    : '';

  const scoreNote = profile.averageScore != null
    ? `Their average score is ${profile.averageScore}%.`
    : '';

  return `
You are an expert AI software engineering tutor inside a Learning Hub application.

## Learner Profile
- Experience Level: ${experienceLevel}
- ${scoreNote}
- Topic: ${topicId || 'General'}
- Lesson: ${lessonId || 'General'}
- ${weakNote}

## Explanation Style: ${styleConfig.tone}
${styleConfig.instruction}

${styleConfig.format}

## Hard Rules
- Respond only in clean **Markdown**.
- Use fenced code blocks with correct language tags (e.g. \`\`\`javascript) for all code.
- Stay strictly on-topic. Do not introduce unrelated concepts.
- Never skip the format structure defined above.
- If the content provided is too vague to explain meaningfully, say so clearly and ask for more detail.
`.trim();
}

// ─── Route ────────────────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  try {
    const { topicId, lessonId, content, style } = req.body;

    // ── Input Validation ──────────────────────────────────────────────────────
    if (!isString(content) || !content.trim()) {
      return res.status(400).json({ error: 'Lesson content is required.' });
    }
    if (content.length > MAX_CONTEXT_LENGTH) {
      return res.status(400).json({
        error: `Lesson content too large. Maximum ${MAX_CONTEXT_LENGTH} characters.`,
      });
    }

    const resolvedStyle = VALID_STYLES.includes(style) ? style : 'Default';

    if (!hasGeminiKey()) {
      return res.status(500).json({
        error: 'Gemini API key is missing. Please add GEMINI_API_KEY to your .env file.',
      });
    }

    // ── Build Prompt ──────────────────────────────────────────────────────────
    const experienceLevel = getSetting('experienceLevel', 'Beginner');
    const profile = buildLearnerProfile();
    const styleConfig = STYLE_CONFIGS[resolvedStyle];

    const systemInstruction = buildSystemInstruction(
      styleConfig,
      experienceLevel,
      profile,
      topicId,
      lessonId
    );

    // ── Call Gemini ───────────────────────────────────────────────────────────
    const model = createGeminiModel({
      systemInstruction,
      generationConfig: {
        temperature: resolvedStyle === 'Deep Dive' ? 0.3 : 0.6, // Lower temp = more precise for deep dives
        maxOutputTokens: resolvedStyle === 'Deep Dive' ? 2048 : 1024,
      },
    });

    const userPrompt = `Please explain the following lesson content using the assigned style:\n\n${content.trim()}`;
    const result = await model.generateContent(userPrompt);
    const explanation = result.response.text();

    return res.json({
      explanation,
      style: resolvedStyle, // Echo back resolved style so frontend knows what was used
    });

  } catch (err) {
    const isGeminiError = err?.message?.includes('GoogleGenerativeAI');
    console.error('[Explain Route]', isGeminiError ? 'Gemini API error:' : 'Unexpected error:', err);

    res.status(500).json({
      error: isGeminiError
        ? 'The AI service returned an error. Please try again.'
        : 'Failed to generate explanation.',
    });
  }
});

module.exports = router;