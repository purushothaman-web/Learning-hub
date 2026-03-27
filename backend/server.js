const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { PORT } = require('./lib/config');
const { initDb } = require('./lib/db');

// Route Imports
const progressRoutes = require('./routes/progress');
const onboardingRoutes = require('./routes/onboarding');
const chatRoutes = require('./routes/chat');
const practiceRoutes = require('./routes/practice');
const executeRoutes = require('./routes/execute');
const explainRoutes = require('./routes/explain');
const quizRoutes = require('./routes/quiz');
const reviewRoutes = require('./routes/review');
const logRoutes = require('./routes/logs');

const app = express();

// Initialize Database
initDb();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/progress', progressRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/explain', explainRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/log', logRoutes);

// Server Start
app.listen(PORT, () => {
  console.log(`Healthcheck: http://localhost:${PORT}/api/progress`);
});
