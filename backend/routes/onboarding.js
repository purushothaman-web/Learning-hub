const express = require('express');
const router = express.Router();
const { setSetting } = require('../lib/profile');

// Save onboarding results
router.post('/complete', (req, res) => {
  try {
    const { careerPath, experienceLevel, customPath, dailyTarget } = req.body;
    
    setSetting('careerPath', careerPath);
    setSetting('experienceLevel', experienceLevel);
    setSetting('customPath', customPath || null);
    setSetting('dailyTarget', dailyTarget || 3);
    setSetting('onboardingCompleted', true);
    setSetting('lastUpdated', new Date().toISOString());
    
    res.json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Onboarding save error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

module.exports = router;
