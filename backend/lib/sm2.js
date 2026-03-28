/**
 * SM-2 Algorithm Implementation
 * 
 * qualityScore: 0-5
 * 0-2 = failed (reset), 3 = pass with difficulty, 4 = correct, 5 = perfect
 */

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return Math.floor(date.getTime());
};

function updateCard(card, qualityScore) {
  const currentCard = card || {
    interval: 1,
    easiness: 2.5,
    repetitions: 0,
    next_review: daysFromNow(1),
    last_score: 0
  };

  if (qualityScore < 3) {
    // Failed — reset repetitions, short interval
    return {
      ...currentCard,
      repetitions: 0,
      interval: 1,
      next_review: daysFromNow(1),
      last_score: qualityScore
    };
  }

  const newEF = Math.max(
    1.3,
    currentCard.easiness + (0.1 - (5 - qualityScore) * (0.08 + (5 - qualityScore) * 0.02))
  );

  let newInterval;
  if (currentCard.repetitions === 0) {
    newInterval = 1;
  } else if (currentCard.repetitions === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(currentCard.interval * newEF);
  }

  return {
    ...currentCard,
    easiness: newEF,
    repetitions: currentCard.repetitions + 1,
    interval: newInterval,
    next_review: daysFromNow(newInterval),
    last_score: qualityScore
  };
}

const toSM2Quality = (score) => {
  if (score >= 90) return 5;
  if (score >= 80) return 4;
  if (score >= 70) return 3;
  if (score >= 50) return 2;
  return 1;
};

module.exports = {
  updateCard,
  toSM2Quality
};
