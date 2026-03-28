const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { DATA_DIR } = require('./config');

const DB_PATH = path.join(DATA_DIR, 'learning_hub.db');

// Initialize Database connection
let db;

const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  db = new Database(DB_PATH);
  
  // Enable WAL mode for performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      topic_id     TEXT NOT NULL,
      lesson_id    TEXT NOT NULL,
      mastered_at  INTEGER,        -- Unix timestamp, null = not mastered
      time_spent_s INTEGER DEFAULT 0,
      visit_count  INTEGER DEFAULT 1,
      PRIMARY KEY (topic_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id           TEXT PRIMARY KEY,
      topic_id     TEXT NOT NULL,
      lesson_id    TEXT NOT NULL,
      type         TEXT NOT NULL,  -- 'practice' | 'quiz'
      score        INTEGER,
      verdict      TEXT,
      time_taken_s INTEGER,
      created_at   INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS srs_cards (
      topic_id     TEXT NOT NULL,
      lesson_id    TEXT NOT NULL,
      interval     INTEGER DEFAULT 1,   -- days until next review
      easiness     REAL DEFAULT 2.5,    -- SM-2 EF factor
      repetitions  INTEGER DEFAULT 0,   -- consecutive correct reviews
      next_review  INTEGER,             -- Unix timestamp
      last_score   INTEGER,             -- 0-5 quality rating (SM-2 scale)
      PRIMARY KEY (topic_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS study_sessions (
      id                TEXT PRIMARY KEY,
      topic_id          TEXT NOT NULL,
      lesson_id         TEXT NOT NULL,
      duration_seconds  INTEGER NOT NULL,
      timestamp         INTEGER NOT NULL,
      date              TEXT NOT NULL   -- YYYY-MM-DD
    );
  `);

  console.log('Database initialized at:', DB_PATH);
  return db;
};

const getDb = () => {
  if (!db) return initDb();
  return db;
};

// JSON legacy helpers (useful for migration)
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

const isString = (value) => typeof value === 'string';
const isObjectRecord = (value) =>
  value && typeof value === 'object' && !Array.isArray(value);

module.exports = {
  initDb,
  getDb,
  readJsonFile,
  writeJsonFile,
  isString,
  isObjectRecord
};
