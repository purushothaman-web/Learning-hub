import type { LucideIcon } from 'lucide-react';

export type TopicLevel = 'Foundations' | 'Mastery' | 'Expert & AI' | 'DSA';

export interface Topic {
  id: string;
  title: string;
  icon: LucideIcon;
  level: TopicLevel;
  required?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  complexity?: string;
  content: string[];
  code?: string;
  badge?: string;
  badgeClass?: string;
  instructions?: string;
  notes?: string[];
}

export interface ProgressRecord {
  careerPath?: string;
  customPath?: string[];
  experienceLevel?: string;
  onboardingCompleted?: boolean;
  lastVisited?: {
    topicId: string;
    lessonId: string;
  };
  [key: string]: string[] | string | boolean | object | number | null | undefined;
  completedDSATopics?: string[];
  pendingPracticePrompt?: {
    problemId: string;
    triggeredAt: number;
  } | null;
}

export interface DSAProblem {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  exampleCases?: {
    input: string;
    output: string;
    explanation?: string;
  }[];
}
