const express = require('express');
const router = express.Router();
const { PROGRESS_FILE } = require('../lib/config');
const { readJsonFile, writeJsonFile } = require('../lib/db');

// Save onboarding results
router.post('/complete', (req, res) => {
  try {
    const { careerPath, experienceLevel, customPath } = req.body;
    const data = readJsonFile(PROGRESS_FILE, {});
    
    const updated = {
      ...data,
      careerPath,
      experienceLevel,
      customPath: customPath || null,
      onboardingCompleted: true,
      lastUpdated: new Date().toISOString()
    };
    
    writeJsonFile(PROGRESS_FILE, updated);
    res.json({ message: 'Onboarding completed successfully', data: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

module.exports = router;
