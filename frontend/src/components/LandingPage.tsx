import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Terminal, Shield, Cpu, Cloud, Globe,
  BookOpen, Play, TrendingUp, ChevronRight,
  Code2, Layers, Database, Server, Activity, Lock,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { CAREER_PATHS } from '../data/paths';
import type { ProgressRecord } from '../types/curriculum';

// ─────────────────────────────────────────────────────────────────────────────
// Static data
// ─────────────────────────────────────────────────────────────────────────────

const MARQUEE_TOPICS = [
  { label: 'JavaScript',       icon: Code2    },
  { label: 'TypeScript',       icon: Code2    },
  { label: 'React',            icon: Layers   },
  { label: 'Node.js',          icon: Server   },
  { label: 'PostgreSQL',       icon: Database },
  { label: 'Redis',            icon: Database },
  { label: 'Docker',           icon: Layers   },
  { label: 'Kubernetes',       icon: Layers   },
  { label: 'System Design',    icon: Cpu      },
  { label: 'Linux',            icon: Terminal },
  { label: 'WebSockets',       icon: Globe    },
  { label: 'Web Security',     icon: Shield   },
  { label: 'Cloud',            icon: Cloud    },
  { label: 'CI/CD',            icon: Activity },
  { label: 'DSA',              icon: Cpu      },
  { label: 'Penetration Test', icon: Lock     },
  { label: 'AI Orchestration', icon: Sparkles },
  { label: 'Terraform',        icon: Cloud    },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: TrendingUp,
    title: 'Pick your career path',
    desc: 'Choose from 6 paths — Frontend, Backend, Full Stack, DevOps, Mobile, or Cybersecurity. Answer 3 quick questions and get a curriculum personalised to your experience level.',
  },
  {
    step: '02',
    icon: BookOpen,
    title: 'Study structured lessons',
    desc: 'Every topic has focused lessons with real code examples, deep-dive notes, and complexity breakdowns. No filler — just the concepts that actually matter on the job.',
  },
  {
    step: '03',
    icon: Play,
    title: 'Practice in the playground',
    desc: 'Launch a timed AI-generated challenge from any lesson. Write code, run it in the sandbox, submit, and get a score with specific strengths and improvement tips.',
  },
];

const GLOBAL_STYLES = `
  @keyframes lh-scroll-left  { from { transform: translateX(0);    } to { transform: translateX(-50%); } }
  @keyframes lh-scroll-right { from { transform: translateX(-50%); } to { transform: translateX(0);    } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    display: 'block',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '0.6rem', fontWeight: 700,
    letterSpacing: '0.3em', textTransform: 'uppercase',
    color: 'var(--accent)', marginBottom: '1rem',
  }}>
    {children}
  </span>
);

const Reveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

const MarqueeRow: React.FC<{ reverse?: boolean }> = ({ reverse = false }) => {
  const items = [...MARQUEE_TOPICS, ...MARQUEE_TOPICS];
  return (
    <div style={{
      overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
    }}>
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        width: 'max-content',
        animation: `${reverse ? 'lh-scroll-right' : 'lh-scroll-left'} 38s linear infinite`,
      }}>
        {items.map((t, i) => {
          const Icon = t.icon;
          return (
            <div key={i} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 99,
              fontSize: '0.72rem', fontWeight: 600,
              color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <Icon size={11} style={{ color: 'var(--accent)', opacity: 0.7 }} />
              {t.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest<ProgressRecord>('/api/progress')
      .then(d => {
        setProgress(d);
        if (d?.onboardingCompleted) handleCTA();
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleCTA = () => {
    if (progress?.onboardingCompleted && progress?.lastVisited?.topicId) {
      const { topicId, lessonId } = progress.lastVisited;
      navigate(`/topic/${topicId}${lessonId ? `?lesson=${lessonId}` : ''}`);
    } else if (progress?.onboardingCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/welcome');
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#080b12' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', letterSpacing: '0.25em', color: 'var(--accent)' }}
        >
          LOADING ARCHIVE...
        </motion.div>
      </div>
    );
  }

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.13 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as any } } };

  return (
    <div style={{ minHeight: '100vh', background: '#080b12', color: 'var(--text-secondary)', overflowX: 'hidden' }}>

      <style>{GLOBAL_STYLES}</style>

      {/* Ambient blobs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-8%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 65%)' }} />
      </div>

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(2rem, 5vh, 4rem) clamp(1rem, 5vw, 3rem) 0' }}>

          {/* Masthead */}
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{
              display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start',
              paddingBottom: 'clamp(2rem, 5vw, 4rem)', borderBottom: '1px solid var(--border)', marginBottom: 'clamp(3rem, 10vw, 5rem)',
              gap: '1.5rem'
            }}
          >
            <div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.4rem' }}>
                Issue 01 // Spring 2026
              </div>
              <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
                LH <span style={{ color: 'var(--accent)' }}>STUDIO</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.3rem' }}>
                Curriculum Excellence
              </div>
              <div style={{ fontFamily: 'Lora, serif', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                Mastery in Engineering
              </div>
            </div>
          </motion.div>

          {/* Hero body */}
          <motion.div variants={stagger} initial="hidden" animate="show">

            {/* Headline */}
            <motion.div variants={fadeUp} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{
                fontFamily: 'Lora, serif',
                fontSize: 'clamp(3rem, 7vw, 6.5rem)',
                fontWeight: 700, fontStyle: 'italic',
                lineHeight: 0.95, letterSpacing: '-0.02em',
                color: 'var(--text-primary)', marginBottom: '1.5rem',
              }}>
                The{' '}
                <span style={{ fontFamily: 'Sora, sans-serif', fontStyle: 'normal', fontWeight: 800, color: 'var(--accent)' }}>
                  Architectural
                </span>
                <br />Odyssey
              </h2>
              <div style={{ width: 80, height: 2, background: 'var(--accent)', opacity: 0.25 }} />
            </motion.div>

            {/* Sub-copy */}
            <motion.p variants={fadeUp} style={{
              fontFamily: 'Lora, serif',
              fontSize: 'clamp(1rem, 2vw, 1.35rem)', lineHeight: 1.7,
              color: 'var(--text-muted)', maxWidth: 640, marginBottom: '3rem',
            }}>
              Beyond syntax. Beyond frameworks. A rigorous curriculum covering{' '}
              <span style={{ color: 'var(--text-primary)' }}>Cybersecurity</span>,{' '}
              <span style={{ color: 'var(--text-primary)' }}>Cloud Infrastructure</span>,{' '}
              <span style={{ color: 'var(--text-primary)' }}>Distributed Systems</span>, and{' '}
              <span style={{ color: 'var(--text-primary)' }}>Algorithms</span>.
            </motion.p>

            {/* CTA row */}
            <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '5rem' }}>
              <motion.button
                onClick={handleCTA}
                whileHover={{ y: -2, boxShadow: '0 16px 40px -8px rgba(245,158,11,0.35)' }}
                whileTap={{ y: 0 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem 2.25rem',
                  background: 'var(--accent)', color: '#000',
                  fontFamily: 'Sora, sans-serif', fontSize: '0.72rem', fontWeight: 800,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  border: 'none', borderRadius: 2, cursor: 'pointer',
                }}
              >
                {progress?.onboardingCompleted ? 'Resume the narrative' : 'Begin the expedition'}
                <ArrowRight size={16} />
              </motion.button>

              {!progress?.onboardingCompleted && (
                <button
                  onClick={() => document.getElementById('lh-paths')?.scrollIntoView({ behavior: 'smooth' })}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.65rem', fontWeight: 700,
                    letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-faint)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
                >
                  <Terminal size={13} style={{ color: 'var(--accent)' }} />
                  View career paths
                </button>
              )}
            </motion.div>

            {/* Stat bar — Fluid Adaptive Grid */}
            <motion.div variants={fadeUp} style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
              borderTop: '1px solid var(--border)', 
              background: 'var(--border)',
              gap: '1px'
            }}>
              {[
                { icon: Shield, code: 'SECURE', label: 'Cybersecurity'  },
                { icon: Cloud,  code: 'SCALE',  label: 'Cloud / DevOps' },
                { icon: Cpu,    code: 'SOLVE',  label: 'DSA / Systems'  },
                { icon: Globe,  code: 'SHIP',   label: 'Full Cycle'     },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    padding: '1.5rem 1.25rem',
                    background: '#080b12',
                    display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  }}>
                    <Icon size={18} style={{ color: 'var(--accent)', opacity: 0.5 }} />
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                      {item.code}
                    </div>
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </motion.div>

          </motion.div>
        </div>

        {/* Marquee — full bleed */}
        <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <MarqueeRow />
          <MarqueeRow reverse />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, padding: '8rem 0' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 3rem' }}>

          <Reveal>
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
              gap: '2rem',
              alignItems: 'flex-end', marginBottom: '4rem',
              paddingBottom: '3rem', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <Eyebrow>How it works</Eyebrow>
                <h2 style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  Learn. Code.{' '}
                  <span style={{ fontFamily: 'Sora, sans-serif', fontStyle: 'normal', fontWeight: 800, color: 'var(--accent)' }}>Improve.</span>
                </h2>
              </div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)', paddingBottom: '0.25rem' }}>
                Three steps from picking a path to writing real, evaluated code — entirely on your machine, no account needed.
              </p>
            </div>
          </Reveal>

          {/* 3-col step cards - Fluid Stacking */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', 
            gap: '1px', 
            background: 'var(--border)' 
          }}>
            {HOW_IT_WORKS.map((item, i) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.step} delay={i * 0.1}>
                  <div
                    style={{ background: '#080b12', padding: '2.5rem 2rem', position: 'relative', height: '100%', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#080b12')}
                  >
                    <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-faint)' }}>
                      {item.step}
                    </div>
                    <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 8, marginBottom: '2rem' }}>
                      <Icon size={18} style={{ color: 'var(--accent)' }} />
                    </div>
                    <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.83rem', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                      {item.desc}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CAREER PATHS
      ══════════════════════════════════════════════════ */}
      <section id="lh-paths" style={{ position: 'relative', zIndex: 1, paddingBottom: '8rem' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 3rem' }}>

          <Reveal>
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', 
              gap: '2rem',
              alignItems: 'flex-end', marginBottom: '4rem',
              paddingBottom: '3rem', borderBottom: '1px solid var(--border)',
            }}>
              <div>
                <Eyebrow>Career paths</Eyebrow>
                <h2 style={{ fontFamily: 'Lora, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  What do you want<br />to{' '}
                  <span style={{ fontFamily: 'Sora, sans-serif', fontStyle: 'normal', fontWeight: 800, color: 'var(--accent)' }}>become?</span>
                </h2>
              </div>
              <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-muted)', paddingBottom: '0.25rem' }}>
                Each path comes with a curated curriculum, mandatory topics, and a personalised starting point based on your experience.
              </p>
            </div>
          </Reveal>

          {/* Path cards - Fluid Stacking */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', 
            gap: '1px', 
            background: 'var(--border)' 
          }}>
            {CAREER_PATHS.map((path, i) => (
              <Reveal key={path.id} delay={(i % 3) * 0.08}>
                <motion.div
                  whileHover={{ background: 'var(--bg-raised)' } as any}
                  onClick={() => navigate(`/onboarding?path=${path.id}`)}
                  style={{
                    background: '#080b12', padding: '2rem', cursor: 'pointer',
                    position: 'relative', overflow: 'hidden', height: '100%',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, pointerEvents: 'none', background: 'radial-gradient(circle at top right, rgba(245,158,11,0.05), transparent 70%)' }} />

                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.55rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.14)', borderRadius: 99, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.06em', marginBottom: '1.25rem', width: 'fit-content' }}>
                    {path.topics.length} topics
                  </div>

                  <h3 style={{ fontFamily: 'Sora, sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.6rem' }}>
                    {path.title}
                  </h3>
                  <p style={{ fontFamily: 'Sora, sans-serif', fontSize: '0.8rem', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                    {path.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '1.5rem' }}>
                    {path.mandatoryTopics.slice(0, 4).map(t => (
                      <span key={t} style={{ padding: '0.15rem 0.45rem', background: 'var(--bg-overlay)', border: '1px solid var(--border)', borderRadius: 3, fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-faint)' }}>
                        {t}
                      </span>
                    ))}
                    {path.mandatoryTopics.length > 4 && (
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.58rem', color: 'var(--text-faint)', alignSelf: 'center', paddingLeft: '0.25rem' }}>
                        +{path.mandatoryTopics.length - 4}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Begin path <ChevronRight size={11} />
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Footer bar */}
          <Reveal>
            <div style={{ marginTop: '1px', background: 'var(--border)' }}>
              <div style={{ background: '#080b12', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '2.5rem' }}>
                  {['FOUNDATIONS', 'MASTERY', 'EXPERT & AI', 'DSA TRACK'].map(t => (
                    <span key={t} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                      {t}
                    </span>
                  ))}
                </div>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.6rem', color: 'var(--text-faint)', letterSpacing: '0.1em' }}>
                  No login · No data leaves your machine · © 2026 LH STUDIO
                </span>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

    </div>
  );
};