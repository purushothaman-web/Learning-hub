const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, '..', 'data');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress.json');
const PRACTICE_FILE = path.join(DATA_DIR, 'practice.json');
const LOG_FILE = path.join(DATA_DIR, 'logs.json');
const QUIZ_FILE = path.join(DATA_DIR, 'quiz.json');

const MAX_CHAT_PROMPT_LENGTH = 4000;
const MAX_CONTEXT_LENGTH = 6000;
const MAX_CODE_LENGTH = 20000;
const MAX_PRACTICE_CONTEXT_LENGTH = 12000;

module.exports = {
  PORT,
  DATA_DIR,
  PROGRESS_FILE,
  PRACTICE_FILE,
  LOG_FILE,
  QUIZ_FILE,
  MAX_CHAT_PROMPT_LENGTH,
  MAX_CONTEXT_LENGTH,
  MAX_CODE_LENGTH,
  MAX_PRACTICE_CONTEXT_LENGTH
};
