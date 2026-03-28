const { getDb } = require('./db');

function buildLearnerProfile(topicId, lessonId) {
  const db = getDb();

  const recentAttempts = db.prepare(`
    SELECT topic_id, lesson_id, type, score, created_at
    FROM attempts
    ORDER BY created_at DESC
    LIMIT 20
  `).all();

  const weakLessons = db.prepare(`
    SELECT topic_id, lesson_id, AVG(score) as avg_score
    FROM attempts
    GROUP BY topic_id, lesson_id
    HAVING avg_score < 70
    ORDER BY avg_score ASC
    LIMIT 5
  `).all();

  const currentCard = db.prepare(`
    SELECT * FROM srs_cards 
    WHERE topic_id = ? AND lesson_id = ?
  `).get(topicId, lessonId);

  const averageScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((s, a) => s + (a.score || 0), 0) / recentAttempts.length)
    : 70; // Default to 70 if no data

  return {
    recentScores: recentAttempts,
    weakTopics: weakLessons,
    currentCard: currentCard,
    averageScore: averageScore
  };
}

function getSetting(key, defaultValue = null) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : defaultValue;
}

function setSetting(key, value) {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
}

module.exports = {
  buildLearnerProfile,
  getSetting,
  setSetting
};
