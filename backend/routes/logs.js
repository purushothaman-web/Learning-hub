const express = require('express');
const router = express.Router();
const { LOG_FILE } = require('../lib/config');
const { readJsonFile, writeJsonFile } = require('../lib/db');

router.post('/', (req, res) => {
  try {
    const { topicId, lessonId, durationSeconds } = req.body;
    
    const logsDb = readJsonFile(LOG_FILE, { sessions: [] });
    const session = {
      id: `log_${Date.now()}`,
      topicId,
      lessonId,
      durationSeconds,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };

    logsDb.sessions.push(session);
    writeJsonFile(LOG_FILE, logsDb);

    res.json({ message: 'Study session logged.', session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log study session.' });
  }
});

router.get('/heatmap', (req, res) => {
  try {
    const logsDb = readJsonFile(LOG_FILE, { sessions: [] });
    const heatmap = {};

    logsDb.sessions.forEach(s => {
      heatmap[s.date] = (heatmap[s.date] || 0) + (s.durationSeconds || 0);
    });

    res.json({ heatmap });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate heatmap.' });
  }
});

module.exports = router;
