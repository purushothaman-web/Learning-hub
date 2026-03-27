import { useEffect, useMemo } from 'react';
import { lessonsData } from '../data/lessons';
import { dsaProblems } from '../data/dsa-problems';
import { apiRequest } from '../lib/api';
import type { ProgressRecord, Lesson } from '../types/curriculum';

export const useDSAProgress = (progress: ProgressRecord, setProgress: (p: ProgressRecord) => void) => {
  const dsaTopics = ['dsa-foundations', 'dsa-mastery', 'dsa-expert'];

  const completedDSATopics = useMemo(() => {
    return dsaTopics.filter(topicId => {
      const lessons = lessonsData[topicId] || [];
      if (lessons.length === 0) return false;
      const masteredSet = new Set((progress[topicId] as string[]) || []);
      return lessons.every((l: Lesson) => masteredSet.has(l.id));
    });
  }, [progress]);

  useEffect(() => {
    // Trigger check: every 3rd DSA topic completed AND no pending prompt
    if (completedDSATopics.length > 0 && 
        completedDSATopics.length % 3 === 0 && 
        !progress.pendingPracticePrompt) {
      
      // Pick a random problem matching the most recently completed topic
      const lastTopic = completedDSATopics[completedDSATopics.length - 1];
      const eligibleProblems = dsaProblems.filter(p => p.tags.includes(lastTopic));
      
      if (eligibleProblems.length > 0) {
        const randomProblem = eligibleProblems[Math.floor(Math.random() * eligibleProblems.length)];
        
        const newPrompt = {
          problemId: randomProblem.id,
          triggeredAt: Date.now()
        };

        // Update locally and on server
        const updatedProgress = { ...progress, pendingPracticePrompt: newPrompt };
        setProgress(updatedProgress);
        
        void apiRequest('/api/progress', {
          method: 'PATCH',
          body: { pendingPracticePrompt: newPrompt }
        });
      }
    }
  }, [completedDSATopics.length, progress.pendingPracticePrompt]);

  const clearPracticePrompt = async () => {
    const updatedProgress = { ...progress, pendingPracticePrompt: null };
    setProgress(updatedProgress);
    await apiRequest('/api/progress', {
      method: 'PATCH',
      body: { pendingPracticePrompt: null }
    });
  };

  return {
    completedDSATopics,
    clearPracticePrompt
  };
};
