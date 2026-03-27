const { GoogleGenerativeAI } = require('@google/generative-ai');

const hasGeminiKey = () =>
  Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_api_key_here');

const createGeminiModel = () => {
  if (!hasGeminiKey()) return null;
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

const parseJsonFromText = (text) => {
  const startObj = text.indexOf('{');
  const startArr = text.indexOf('[');
  let start = -1;
  let end = -1;

  if (startObj !== -1 && (startArr === -1 || startObj < startArr)) {
    start = startObj;
    end = text.lastIndexOf('}');
  } else if (startArr !== -1) {
    start = startArr;
    end = text.lastIndexOf(']');
  }

  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
};

const inferDifficulty = (lessonTitle = '') => {
  const value = lessonTitle.toLowerCase();
  if (value.includes('advanced') || value.includes('architecture') || value.includes('deep')) return 'hard';
  if (value.includes('practice') || value.includes('code')) return 'medium';
  return 'medium';
};

const defaultChallenge = ({ topicId, lessonTitle, lessonSummary }) => {
  const difficulty = inferDifficulty(lessonTitle);
  const durationMinutes = difficulty === 'hard' ? 45 : 30;
  const safeTopic = topicId || 'general';
  const title = `${lessonTitle || 'Lesson'} - Timed Practice`;

  return {
    challengeId: `ch_${Date.now()}`,
    title,
    difficulty,
    durationMinutes,
    instructions: [
      `Build a realistic ${safeTopic} feature based on this concept: ${lessonSummary.slice(0, 220)}...`,
      'Your solution must handle happy path and one failure path.',
      'Add concise comments only where the logic is non-obvious.',
      'Return output that proves your solution works end-to-end.'
    ],
    starterCode: `// ${title}\n// TODO: implement your solution here\nfunction solve(input) {\n  // implement\n  return input;\n}\n\nconsole.log(solve('demo'));`
  };
};

const defaultEvaluation = ({ challengeTitle, userCode, executionOutput, timeTakenSeconds }) => {
  const hasMeaningfulCode = userCode && userCode.trim().split('\n').length >= 4;
  const hasOutput = executionOutput && executionOutput.trim().length > 0;
  const score = hasMeaningfulCode ? (hasOutput ? 82 : 70) : 40;

  return {
    score,
    verdict: score >= 75 ? 'pass' : 'needs_improvement',
    strengths: hasMeaningfulCode
      ? ['You attempted a structured implementation instead of pseudo-code.']
      : ['You started the attempt and submitted on time.'],
    gaps: hasOutput
      ? ['Strengthen edge-case handling and validation.']
      : ['Run and verify executable output before submission.'],
    learnMore: [
      'Review validation and failure-path handling for this lesson.',
      'Retry with one additional test case and explicit error branch.'
    ],
    feedbackSummary: `Challenge ${challengeTitle || ''} completed in ${timeTakenSeconds || 0}s with score ${score}.`
  };
};

module.exports = {
  hasGeminiKey,
  createGeminiModel,
  parseJsonFromText,
  inferDifficulty,
  defaultChallenge,
  defaultEvaluation
};
