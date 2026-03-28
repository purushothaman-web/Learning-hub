const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/db');

router.post('/', (req, res) => {
  try {
    const { topicId, lessonId, durationSeconds } = req.body;
    const db = getDb();
    
    const id = `log_${Date.now()}`;
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0];

    db.prepare(`
      INSERT INTO study_sessions (id, topic_id, lesson_id, duration_seconds, timestamp, date)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, topicId || 'general', lessonId || 'any', durationSeconds || 0, timestamp, date);

    res.json({ 
      message: 'Study session logged.', 
      session: { id, topicId, lessonId, durationSeconds, timestamp, date } 
    });
  } catch (err) {
    console.error('Log Error:', err);
    res.status(500).json({ error: 'Failed to log study session.' });
  }
});

router.get('/heatmap', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT date, SUM(duration_seconds) as total_duration
      FROM study_sessions
      GROUP BY date
    `).all();

    const heatmap = {};
    rows.forEach(row => {
      heatmap[row.date] = row.total_duration;
    });

    res.json({ heatmap });
  } catch (err) {
    console.error('Heatmap Error:', err);
    res.status(500).json({ error: 'Failed to generate heatmap.' });
  }
});

module.exports = router;
