const express = require('express');
const router = express.Router();
const { getDb } = require('../lib/db');

router.get('/queue', (req, res) => {
  const db = getDb();
  try {
    const now = Date.now();
    
    // Get all cards where next_review is in the past or now
    const queue = db.prepare(`
      SELECT topic_id as topicId, lesson_id as lessonId, next_review, repetitions
      FROM srs_cards
      WHERE next_review <= ?
      ORDER BY next_review ASC
      LIMIT 10
    `).all(now);

    res.json({ 
      queue: queue.map(item => ({
        ...item,
        reason: item.repetitions === 0 ? 'Initial Review' : 'Spaced Repetition'
      }))
    });
  } catch (err) {
    console.error('SRS Queue Error:', err);
    res.status(500).json({ error: 'Failed to generate review queue.' });
  }
});

module.exports = router;
