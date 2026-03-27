const express = require('express');
const router = express.Router();
const { PROGRESS_FILE } = require('../lib/config');
const { readJsonFile } = require('../lib/db');

router.get('/queue', (req, res) => {
  try {
    const progress = readJsonFile(PROGRESS_FILE, {});
    const lastVisited = progress.lastVisited || {};
    
    // Simple SM-2 like logic for learning hub context
    // We'll return lessons that were mastered > 3 days ago or visited > 7 days ago
    const queue = [];
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    Object.keys(progress).forEach(topicId => {
      if (topicId === 'lastVisited' || topicId === 'experienceLevel' || topicId === 'careerPath' || topicId === 'onboardingCompleted') return;

      const masteredLessons = progress[topicId] || [];
      masteredLessons.forEach(lessonId => {
        // Since we don't have individual mastery timestamps yet, 
        // we'll simulate a review queue based on the global lastVisited timestamp if it matches
        if (lastVisited.topicId === topicId && lastVisited.lessonId === lessonId) {
          const age = now - (lastVisited.timestamp || 0);
          if (age > 3 * DAY_MS) {
            queue.push({ topicId, lessonId, reason: 'Spaced Repetition' });
          }
        }
      });
    });

    res.json({ queue: queue.slice(0, 5) });
  } catch (err) {
    console.error('SRS Queue Error:', err);
    res.status(500).json({ error: 'Failed to generate review queue.' });
  }
});

module.exports = router;
