const fs = require('fs');
const { PROGRESS_FILE, PRACTICE_FILE, QUIZ_FILE, LOG_FILE } = require('./config');
const { getDb, readJsonFile } = require('./db');

function migrateFromJson() {
  const db = getDb();
  
  // 1. Migrate Settings & Progress
  if (fs.existsSync(PROGRESS_FILE)) {
    console.log('Migrating progress.json...');
    const progress = readJsonFile(PROGRESS_FILE, {});
    
    // Settings
    const settings = ['onboardingCompleted', 'careerPath', 'experienceLevel'];
    settings.forEach(key => {
      if (progress[key] !== undefined) {
        db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run(key, String(progress[key]));
      }
    });

    // Lessons (Topic ID -> Array of Lesson IDs)
    for (const [topicId, lessons] of Object.entries(progress)) {
      if (Array.isArray(lessons)) {
        for (const lessonId of lessons) {
          db.prepare(`INSERT OR IGNORE INTO progress (topic_id, lesson_id, mastered_at) VALUES (?, ?, ?)`).run(topicId, lessonId, Date.now());
          
          // Initialize SRS card for mastered lessons if not exists
          db.prepare(`INSERT OR IGNORE INTO srs_cards (topic_id, lesson_id, next_review) VALUES (?, ?, ?)`).run(topicId, lessonId, Date.now());
        }
      }
    }
  }

  // 2. Migrate Practice Attempts
  if (fs.existsSync(PRACTICE_FILE)) {
    console.log('Migrating practice.json...');
    const practice = readJsonFile(PRACTICE_FILE, { attempts: [] });
    const attempts = Array.isArray(practice.attempts) ? practice.attempts : [];
    
    for (const att of attempts) {
      db.prepare(`
        INSERT OR IGNORE INTO attempts (id, topic_id, lesson_id, type, score, verdict, time_taken_s, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        att.id,
        att.topicId,
        att.lessonId,
        'practice',
        att.score,
        att.verdict,
        att.timeTakenSeconds || 0,
        new Date(att.createdAt).getTime()
      );
    }
  }

  // 3. Migrate Quiz Completions
  if (fs.existsSync(QUIZ_FILE)) {
    console.log('Migrating quiz.json...');
    const quiz = readJsonFile(QUIZ_FILE, { completions: [] });
    const completions = Array.isArray(quiz.completions) ? quiz.completions : [];
    
    for (const q of completions) {
      db.prepare(`
        INSERT OR IGNORE INTO attempts (id, topic_id, lesson_id, type, score, verdict, time_taken_s, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        q.id,
        q.topicId,
        q.lessonId,
        'quiz',
        q.percentage || q.score,
        (q.percentage || q.score) >= 70 ? 'pass' : 'needs_improvement',
        0,
        new Date(q.createdAt).getTime()
      );
    }
  }

  // 4. Migrate Study Logs
  if (fs.existsSync(LOG_FILE)) {
    console.log('Migrating logs.json...');
    const logs = readJsonFile(LOG_FILE, { sessions: [] });
    const sessions = Array.isArray(logs.sessions) ? logs.sessions : [];

    for (const s of sessions) {
      db.prepare(`
        INSERT OR IGNORE INTO study_sessions (id, topic_id, lesson_id, duration_seconds, timestamp, date)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        s.id,
        s.topicId,
        s.lessonId,
        s.durationSeconds || 0,
        s.timestamp || Date.now(),
        s.date || new Date().toISOString().split('T')[0]
      );
    }
  }

  // 5. Seed Heatmap if empty
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM study_sessions').get().count;
  if (sessionCount === 0) {
    console.log('Seeding study sessions for heatmap...');
    const topics = ['git', 'javascript', 'html-css', 'react', 'node-js'];
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    for (let i = 0; i < 30; i++) {
        // Randomly skip some days or add multiple sessions per day
        const numSessions = Math.floor(Math.random() * 3); 
        for (let j = 0; j < numSessions; j++) {
            const timestamp = now - (i * dayMs) - (Math.random() * dayMs * 0.5);
            const date = new Date(timestamp).toISOString().split('T')[0];
            const duration = 300 + Math.floor(Math.random() * 3600); // 5m to 1h
            
            db.prepare(`
                INSERT INTO study_sessions (id, topic_id, lesson_id, duration_seconds, timestamp, date)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(`seed_${i}_${j}`, topics[Math.floor(Math.random() * topics.length)], 'any', duration, timestamp, date);
        }
    }
  }

  console.log('Migration and seeding completed.');
}

module.exports = { migrateFromJson };
