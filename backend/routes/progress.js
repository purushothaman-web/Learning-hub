const express = require('express');
const router = express.Router();
const { PROGRESS_FILE } = require('../lib/config');
const { readJsonFile, writeJsonFile } = require('../lib/db');

router.get('/', (req, res) => {
  try {
    const data = readJsonFile(PROGRESS_FILE, {});
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Architectural failure parsing local database.' });
  }
});

router.post('/', (req, res) => {
  try {
    const data = readJsonFile(PROGRESS_FILE, {});
    const updated = { ...data, ...req.body };
    writeJsonFile(PROGRESS_FILE, updated);
    res.json({ message: 'Atomic commit successful.' });
  } catch {
    res.status(500).json({ error: 'Failed to allocate memory safely to disk.' });
  }
});

router.patch('/', (req, res) => {
  try {
    const data = readJsonFile(PROGRESS_FILE, {});
    const updated = { ...data, ...req.body };
    writeJsonFile(PROGRESS_FILE, updated);
    res.json({ message: 'Patched.' });
  } catch {
    res.status(500).json({ error: 'Failed to patch progress.' });
  }
});

router.get('/export', (req, res) => {
  try {
    const data = readJsonFile(PROGRESS_FILE, {});
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to export progress data.' });
  }
});

router.post('/import', (req, res) => {
  try {
    const { progressData } = req.body;
    if (!progressData || typeof progressData !== 'object') {
      return res.status(400).json({ error: 'Invalid progress data provided.' });
    }
    // Simple deep merge or direct overwrite depending on strategy
    // We'll use direct overwrite as it's cleaner for "Importing" a backup
    writeJsonFile(PROGRESS_FILE, progressData);
    res.json({ message: 'Progress imported successfully.' });
  } catch {
    res.status(500).json({ error: 'Failed to import progress data.' });
  }
});

module.exports = router;
