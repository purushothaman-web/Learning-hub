const fs = require('fs');
const { DATA_DIR, PROGRESS_FILE, PRACTICE_FILE } = require('./config');

const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(PRACTICE_FILE)) {
    fs.writeFileSync(PRACTICE_FILE, JSON.stringify({ attempts: [] }, null, 2));
  }
};

const isString = (value) => typeof value === 'string';
const isObjectRecord = (value) =>
  value && typeof value === 'object' && !Array.isArray(value);

const isProgressPayload = (value) => {
  if (!isObjectRecord(value)) return false;
  return Object.values(value).every(
    (topicLessons) =>
      Array.isArray(topicLessons) &&
      topicLessons.every((lessonId) => isString(lessonId))
  );
};

const readJsonFile = (filePath, fallback) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return fallback;
  }
};

const writeJsonFile = (filePath, payload) => {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
};

module.exports = {
  initDb,
  isString,
  isObjectRecord,
  isProgressPayload,
  readJsonFile,
  writeJsonFile
};
