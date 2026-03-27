import { Code2, ShieldCheck, Database, Server, Cloud, Layers, Cpu, Activity, Smartphone, Terminal, Globe, Lock, ShieldAlert } from 'lucide-react';
import type { Topic, TopicLevel } from '../types/curriculum';

export const curriculum: Topic[] = [
  // ── Foundations (7 topics) ──────────────────────────────────────────
  { id: 'html-css',        title: 'HTML/CSS Basics',              icon: Code2,       level: 'Foundations' as TopicLevel },
  { id: 'javascript',      title: 'JavaScript Essentials',        icon: Code2,       level: 'Foundations' as TopicLevel, required: true },
  { id: 'react',           title: 'React Foundations',            icon: Layers,      level: 'Foundations' as TopicLevel },
  { id: 'typescript',      title: 'TypeScript Depth',             icon: Code2,       level: 'Foundations' as TopicLevel, required: true },
  { id: 'linux',           title: 'Linux Basics',                 icon: Terminal,    level: 'Foundations' as TopicLevel, required: true },
  { id: 'git',             title: 'Git & Version Control',        icon: Code2,       level: 'Foundations' as TopicLevel, required: true },
  { id: 'websockets',      title: 'WebSockets & Real-Time',       icon: Globe,       level: 'Foundations' as TopicLevel },

  // ── Mastery (11 topics) ───────────────────────────────────────────────
  { id: 'security',        title: 'Web Security',                 icon: ShieldCheck, level: 'Mastery' as TopicLevel },
  { id: 'testing',         title: 'Testing Excellence',           icon: Server,      level: 'Mastery' as TopicLevel },
  { id: 'docker',          title: 'Docker Mastery',               icon: Layers,      level: 'Mastery' as TopicLevel },
  { id: 'cicd',            title: 'CI/CD Pipelines',              icon: Cloud,       level: 'Mastery' as TopicLevel },
  { id: 'postgresql',      title: 'PostgreSQL Advanced',          icon: Database,    level: 'Mastery' as TopicLevel },
  { id: 'redis',           title: 'Redis & Sessions',             icon: Database,    level: 'Mastery' as TopicLevel },
  { id: 'node',            title: 'Advanced Node.js',             icon: Server,      level: 'Mastery' as TopicLevel },
  { id: 'react-advanced',  title: 'React Architecture',           icon: Layers,      level: 'Mastery' as TopicLevel },
  { id: 'react-native',    title: 'React Native',                 icon: Smartphone,  level: 'Mastery' as TopicLevel },
  { id: 'networking',      title: 'Networking Basics',            icon: Globe,       level: 'Mastery' as TopicLevel },
  { id: 'secure-coding',   title: 'Secure Coding',                icon: Lock,        level: 'Mastery' as TopicLevel },

  // ── Expert & AI (7 topics) ───────────────────────────────────────────
  { id: 'systemdesign',    title: 'System Design',                icon: Cpu,         level: 'Expert & AI' as TopicLevel },
  { id: 'ai-orchestration', title: 'AI Orchestration',            icon: Cpu,         level: 'Expert & AI' as TopicLevel },
  { id: 'performance',     title: 'Performance & Observability',  icon: Activity,    level: 'Expert & AI' as TopicLevel },
  { id: 'cloud',           title: 'Cloud Deployment',             icon: Cloud,       level: 'Expert & AI' as TopicLevel },
  { id: 'kubernetes',      title: 'Kubernetes',                   icon: Layers,      level: 'Expert & AI' as TopicLevel },
  { id: 'terraform',       title: 'Terraform & IaC',              icon: Code2,       level: 'Expert & AI' as TopicLevel },
  { id: 'mobile-advanced', title: 'Mobile Architecture',         icon: Smartphone,  level: 'Expert & AI' as TopicLevel },
  { id: 'auth-deepdive',   title: 'Auth & OAuth Deep Dive',       icon: Lock,        level: 'Expert & AI' as TopicLevel },
  { id: 'pentesting',      title: 'Penetration Testing',          icon: ShieldAlert, level: 'Expert & AI' as TopicLevel },

  // ── DSA Track (3 topics) ──────────────────────────────────────────
  { id: 'dsa-foundations', title: 'DSA Foundations',              icon: Cpu,         level: 'DSA' as TopicLevel, required: true },
  { id: 'dsa-mastery',     title: 'DSA Mastery',                  icon: Cpu,         level: 'DSA' as TopicLevel },
  { id: 'dsa-expert',      title: 'DSA Expert',                   icon: Cpu,         level: 'DSA' as TopicLevel },
];