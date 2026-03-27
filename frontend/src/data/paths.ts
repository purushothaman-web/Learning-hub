export interface CareerPath {
  id: string;
  title: string;
  description: string;
  topics: string[];
  mandatoryTopics: string[];
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    description: 'Master the art of building beautiful, interactive user interfaces.',
    topics: ['html-css', 'javascript', 'react', 'typescript', 'react-advanced', 'performance'],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'html-css', 'react']
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    description: 'Build scalable servers, databases, and robust system architectures.',
    topics: ['javascript', 'node', 'postgresql', 'redis', 'docker', 'security', 'systemdesign'],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'node', 'postgresql', 'security']
  },
  {
    id: 'fullstack',
    title: 'Full Stack Developer',
    description: 'The complete package. Handle everything from database to browser.',
    topics: [
      'html-css', 'javascript', 'react', 'typescript', 'git', 'linux',
      'node', 'postgresql', 'redis', 'docker', 
      'security', 'systemdesign', 'react-advanced', 'performance', 'cloud'
    ],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'html-css', 'react', 'node', 'postgresql', 'security']
  },
  {
    id: 'mobile',
    title: 'React Native Developer',
    description: 'Build native mobile apps for iOS and Android using React and JavaScript.',
    topics: ['javascript', 'react', 'typescript', 'react-native', 'mobile-advanced'],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'html-css', 'react']
  },
  {
    id: 'devops',
    title: 'DevOps / Cloud Engineer',
    description: 'Automate infrastructure, manage cloud deployments, and scale systems.',
    topics: ['docker', 'cicd', 'linux', 'kubernetes', 'terraform', 'cloud', 'performance'],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'docker', 'cicd']
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity Engineer',
    description: 'Protect systems and data from evolving security threats.',
    topics: ['security', 'networking', 'auth-deepdive', 'pentesting', 'secure-coding'],
    mandatoryTopics: ['javascript', 'git', 'linux', 'typescript', 'networking', 'security']
  }
];

export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export const LEVEL_MAPPING: Record<string, ExperienceLevel> = {
  // Assessment logic: [writtenCode_builtSomething_workingInTech]
  // --- Beginner ---
  'Never_No_No':    'Beginner',
  'Never_Yes_No':   'Beginner',    // unlikely but valid answer
  'Never_No_Yes':   'Beginner',    // working in tech but never written code
  'Never_Yes_Yes':  'Intermediate',// working in tech + shipped something = at least Intermediate

  // --- A Little coding ---
  'ALittle_No_No':  'Beginner',
  'ALittle_No_Yes': 'Intermediate',
  'ALittle_Yes_No': 'Intermediate',
  'ALittle_Yes_Yes':'Intermediate',

  // --- Yes coding ---
  'Yes_No_No':      'Intermediate',
  'Yes_No_Yes':     'Intermediate',
  'Yes_Yes_No':     'Intermediate',
  'Yes_Yes_Yes':    'Advanced',
};

export const getSuggestedLevel = (answers: { code: string; built: string; tech: string }): ExperienceLevel => {
  const key = `${answers.code}_${answers.built}_${answers.tech}`;
  return LEVEL_MAPPING[key] || 'Beginner';
};
