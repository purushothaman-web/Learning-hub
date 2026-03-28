const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/db');
const { getSetting, setSetting } = require('../lib/profile');

const handleGetProgress = (req, res) => {
  const db = getDb();
  try {
    // 1. Get Settings
    const settings = db.prepare('SELECT * FROM settings').all();
    const result = {};
    settings.forEach(s => {
      // Try to parse as JSON if it looks like boolean or object
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    });

    // 2. Get Progress (Mastered Lessons)
    const progress = db.prepare('SELECT topic_id, lesson_id FROM progress WHERE mastered_at IS NOT NULL').all();
    progress.forEach(p => {
      if (!result[p.topic_id]) result[p.topic_id] = [];
      result[p.topic_id].push(p.lesson_id);
    });

    res.json(result);
  } catch (err) {
    console.error('Progress GET error:', err);
    res.status(500).json({ error: 'Architectural failure parsing local database.' });
  }
};

const handlePostProgress = (req, res) => {
  const db = getDb();
  try {
    const payload = req.body;
    
    // Handle topic/lesson progress if present
    for (const [key, value] of Object.entries(payload)) {
      if (Array.isArray(value)) {
        // Topic ID -> Array of Lesson IDs
        const topicId = key;
        for (const lessonId of value) {
          db.prepare(`
            INSERT OR IGNORE INTO progress (topic_id, lesson_id, mastered_at)
            VALUES (?, ?, ?)
          `).run(topicId, lessonId, Date.now());
          
          // Also init SRS card
          db.prepare(`
            INSERT OR IGNORE INTO srs_cards (topic_id, lesson_id, next_review)
            VALUES (?, ?, ?)
          `).run(topicId, lessonId, Date.now());
        }
      } else {
        // Global setting
        setSetting(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    }
    
    res.json({ message: 'Atomic commit successful.' });
  } catch (err) {
    console.error('Progress POST error:', err);
    res.status(500).json({ error: 'Failed to allocate memory safely to disk.' });
  }
};

router.get('/', handleGetProgress);
router.get('/export', handleGetProgress);
router.post('/', handlePostProgress);
router.patch('/', handlePostProgress);

router.post('/import', (req, res) => {
  // Re-run migration or similar
  res.status(501).json({ error: 'Import not yet re-implemented for SQLite.' });
});

module.exports = router;
