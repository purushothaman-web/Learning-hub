import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Trophy, Target, Zap, TrendingUp, ArrowUpRight, Activity, BarChart2, Lock, CheckCircle2, ChevronRight, Cpu, RefreshCw, Calendar, RotateCcw, BookOpen, Clock, ArrowRight, Flame } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { curriculum } from '../data/curriculum';
import { CAREER_PATHS, type CareerPath } from '../data/paths';
import { useNavigate } from 'react-router-dom';
import { lessonsData } from '../data/lessons';
import type { ProgressRecord, Lesson, Topic } from '../types/curriculum';

// ── Today's Focus logic ───────────────────────────────────────────────────────
// Returns the single most relevant lesson for the user to work on right now.
// Priority: (1) lastVisited if not yet mastered, (2) first unmastered lesson
// in their active curriculum order.
function getTodaysFocus(
  progress: ProgressRecord,
  activeCurriculum: Topic[]
): { topic: Topic; lesson: Lesson; resuming: boolean } | null {
  // Helper: is this lesson mastered?
  const isMastered = (topicId: string, lessonId: string) =>
    ((progress[topicId] as string[]) || []).includes(lessonId);

  // Priority 1 — resume lastVisited if not yet mastered
  if (progress.lastVisited?.topicId && progress.lastVisited?.lessonId) {
    const { topicId, lessonId } = progress.lastVisited;
    const topic = activeCurriculum.find(t => t.id === topicId);
    const lesson = (lessonsData[topicId] || []).find((l: Lesson) => l.id === lessonId);
    if (topic && lesson && !isMastered(topicId, lessonId)) {
      return { topic, lesson, resuming: true };
    }
  }

  // Priority 2 — first unmastered lesson across the active curriculum in order
  for (const topic of activeCurriculum) {
    const lessons: Lesson[] = lessonsData[topic.id] || [];
    for (const lesson of lessons) {
      if (!isMastered(topic.id, lesson.id)) {
        return { topic, lesson, resuming: false };
      }
    }
  }

  // All mastered — nothing to suggest
  return null;
}

// ── TodaysFocus card component ────────────────────────────────────────────────
interface TodaysFocusProps {
  focus: { topic: Topic; lesson: Lesson; resuming: boolean };
  onGo: () => void;
}

const TodaysFocusCard = ({ focus, onGo }: TodaysFocusProps) => {
  const readMins = Math.ceil((focus.lesson.content?.length || 3) * 1.5);
  const levelColor =
    focus.topic.level === 'Foundations' ? 'var(--info)'
    : focus.topic.level === 'Mastery'   ? 'var(--accent)'
    : focus.topic.level === 'DSA'       ? '#8b5cf6'
    : 'var(--success)';

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1.5rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-accent)',
      borderRadius: 16,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
    }}>
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, var(--accent), transparent)',
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: 200, height: 120,
        background: 'radial-gradient(ellipse at top right, rgba(245,158,11,0.07), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        width: 52, height: 52, flexShrink: 0, borderRadius: 14,
        background: 'var(--accent-dim)',
        border: '1px solid var(--border-accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {focus.resuming
          ? <Flame size={22} style={{ color: 'var(--accent)' }} />
          : <BookOpen size={22} style={{ color: 'var(--accent)' }} />
        }
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--accent)',
          }}>
            {focus.resuming ? 'Resume where you left off' : "Today's focus"}
          </span>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: levelColor,
            background: `${levelColor}18`,
            padding: '0.15rem 0.5rem', borderRadius: 99,
          }}>
            {focus.topic.level}
          </span>
        </div>

        <div style={{
          fontSize: '1rem', fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          marginBottom: '0.25rem',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {focus.lesson.title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-faint)' }}>
            {focus.topic.title}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-faint)' }}>
            <Clock size={11} /> ~{readMins} min read
          </span>
          {focus.lesson.badge && (
            <span style={{
              fontSize: '0.62rem', fontWeight: 700,
              color: 'var(--text-faint)',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              padding: '0.15rem 0.5rem', borderRadius: 6,
            }}>
              {focus.lesson.badge}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onGo}
        className="btn-primary"
        style={{ flexShrink: 0, padding: '0.65rem 1.25rem', gap: '0.5rem' }}
      >
        {focus.resuming ? 'Continue' : 'Start lesson'}
        <ArrowRight size={14} />
      </button>
    </div>
  );
};

interface Stats {
  totalAttempts: number;
  averageScore: number;
  topicStats: Array<{ topicId: string; avgScore: number; attempts: number }>;
  scoreHistory: Array<{ date: string; score: number }>;
}

interface Progress {
  careerPath?: string;
  customPath?: string[];
  experienceLevel?: string;
  [key: string]: any;
}

const tooltipStyle: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 11,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  color: 'var(--text-secondary)',
};

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [heatmap, setHeatmap] = useState<Record<string, number>>({});
  const [reviewQueue, setReviewQueue] = useState<Array<{ topicId: string; lessonId: string; reason: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiRequest<Stats>('/api/practice/stats'),
      apiRequest<Progress>('/api/progress'),
      apiRequest<{ heatmap: Record<string, number> }>('/api/log/heatmap'),
      apiRequest<{ queue: any[] }>('/api/review/queue')
    ]).then(([s, p, h, r]) => {
      setStats(s);
      setProgress(p);
      setHeatmap(h.heatmap);
      setReviewQueue(r.queue);
    }).catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleReset = async () => {
    if (!confirm('This will reset your career path and onboarding status. Your practice progress will be preserved. Continue?')) return;
    try {
      await apiRequest('/api/progress', {
        method: 'PATCH',
        body: { onboardingCompleted: false, careerPath: null, experienceLevel: null }
      });
      window.dispatchEvent(new CustomEvent<ProgressRecord>('progress-updated', { detail: { onboardingCompleted: false, careerPath: undefined, experienceLevel: undefined } }));
      navigate('/onboarding');
    } catch (err) {
      alert('Failed to reset path.');
    }
  };

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>
    </div>
  );

  const activeCurriculum = progress?.customPath
    ? curriculum.filter(t => progress.customPath!.includes(t.id))
    : progress?.careerPath
      ? curriculum.filter(t => CAREER_PATHS.find((p: CareerPath) => p.id === progress.careerPath)?.topics.includes(t.id))
      : curriculum;

  if (!stats || stats.totalAttempts === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: 'var(--text-faint)' }}>
      <Zap size={40} style={{ opacity: 0.35 }} />
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>No data yet</h2>
        <p style={{ fontSize: '0.82rem', marginBottom: '1.5rem' }}>Complete your first playground challenge to see stats for your path.</p>
        <button 
          onClick={() => navigate('/welcome')}
          style={{ padding: '0.6rem 1.2rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Change Career Path
        </button>
      </div>
    </div>
  );

  const topicMap = activeCurriculum.reduce((a, t) => ({ ...a, [t.id]: t.title }), {} as Record<string, string>);
  const chartData = stats.topicStats
    .filter(t => topicMap[t.topicId])
    .map(t => ({ name: topicMap[t.topicId], score: t.avgScore, attempts: t.attempts }))
    .sort((a, b) => b.score - a.score);

  const metrics = [
    { icon: Trophy, label: 'Avg Score', value: `${stats.averageScore}%`, color: 'var(--accent)', trend: '+4% this week' },
    { icon: Activity, label: 'Attempts', value: stats.totalAttempts.toString(), color: 'var(--success)' },
    { icon: Target, label: 'Topics ≥80%', value: stats.topicStats.filter(t => topicMap[t.topicId] && t.avgScore >= 80).length.toString(), color: 'var(--info)' },
    { icon: TrendingUp, label: 'Best Topic', value: chartData[0]?.name || '—', sub: chartData[0] ? `${chartData[0].score}%` : '', color: '#8b5cf6' },
  ];

  const careerTitle = CAREER_PATHS.find((p: CareerPath) => p.id === progress?.careerPath)?.title || 'All Topics';
  const isBeginner = progress?.experienceLevel === 'Beginner';
  
  const mandatoryTopicsList = progress?.careerPath 
    ? curriculum.filter(t => CAREER_PATHS.find(p => p.id === progress.careerPath)?.mandatoryTopics.includes(t.id))
    : [];

  const getTopicProgress = (topicId: string) => {
    const lessons = lessonsData[topicId] || [];
    if (lessons.length === 0) return 0;
    const mastered = ((progress?.[topicId] as string[]) || []).length;
    return Math.round((mastered / lessons.length) * 100);
  };

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg-base)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem 4rem' }} className="fade-up">

        {/* Header */}
        <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <BarChart2 size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                Personalized Analytics
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {careerTitle} Mastery
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>
              Track your progress across your chosen engineering curriculum.
            </p>
          </div>
          
          <button 
            onClick={handleReset}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <RefreshCw size={14} /> Change Path
          </button>
        </header>

        {/* Today's Focus */}
        {(() => {
          const focus = getTodaysFocus(progress as ProgressRecord, activeCurriculum);
          if (!focus) return null;
          return (
            <TodaysFocusCard
              focus={focus}
              onGo={() => navigate(`/topic/${focus.topic.id}?lesson=${focus.lesson.id}`)}
            />
          );
        })()}

        {/* Mandatory Mission Section */}
        {isBeginner && mandatoryTopicsList.length > 0 && (
          <div style={{ marginBottom: '3rem', position: 'relative' }}>
            <div style={{ 
              position: 'absolute', top: '-1rem', left: '-1rem', right: '-1rem', bottom: '-1rem',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)',
              borderRadius: '24px', zIndex: -1, border: '1px solid rgba(59, 130, 246, 0.05)'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(var(--info-rgb), 0.2)' }}>
                  <Target size={16} style={{ color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Foundational Mission</h2>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 500 }}>Complete these required modules to unlock your full potential.</p>
                </div>
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--info)', background: 'rgba(59, 130, 246, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                {mandatoryTopicsList.filter(t => getTopicProgress(t.id) === 100).length} / {mandatoryTopicsList.length} Completed
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {mandatoryTopicsList.map(topic => {
                const percent = getTopicProgress(topic.id);
                const isDone = percent === 100;
                return (
                  <div 
                    key={topic.id} 
                    className="card fade-up" 
                    onClick={() => navigate(`/topic/${topic.id}`)} 
                    style={{ 
                      padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', 
                      cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isDone ? '1px solid var(--success-dim)' : '1px solid var(--border)',
                      background: isDone ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-surface)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.borderColor = isDone ? 'var(--success)' : 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor = isDone ? 'var(--success-dim)' : 'var(--border)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ 
                        width: 44, height: 44, borderRadius: '12px', 
                        background: isDone ? 'var(--success-dim)' : 'var(--bg-raised)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <topic.icon size={20} style={{ color: isDone ? 'var(--success)' : 'var(--text-secondary)' }} />
                        {isDone && (
                          <div style={{ 
                            position: 'absolute', top: -4, right: -4, 
                            width: 16, height: 16, borderRadius: '50%', 
                            background: 'var(--success)', display: 'flex', 
                            alignItems: 'center', justifyContent: 'center',
                            border: '2px solid var(--bg-surface)'
                          }}>
                            <CheckCircle2 size={10} style={{ color: 'white' }} />
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{topic.title}</div>
                        <div style={{ fontSize: '0.65rem', color: isDone ? 'var(--success)' : 'var(--text-faint)', fontWeight: 600 }}>{isDone ? 'MASTERED' : `${percent}% COMPLETE`}</div>
                      </div>
                    </div>
                    <div style={{ height: 6, background: 'var(--bg-raised)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percent}%`, height: '100%', 
                        background: isDone ? 'var(--success)' : 'linear-gradient(90deg, var(--info), var(--accent))', 
                        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' 
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {metrics.map(({ icon: Icon, label, value, color, trend, sub }: { icon: LucideIcon, label: string, value: string | number, color: string, trend?: string, sub?: string }) => (
            <div key={label} className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -16, right: -16, width: 60, height: 60, borderRadius: '50%', background: color, opacity: 0.08 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-faint)', marginBottom: '0.75rem' }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1, fontFamily: 'Sora, sans-serif' }}>
                  {value}
                </span>
                {sub && <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{sub}</span>}
              </div>
              {trend && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--success)' }}>
                  <ArrowUpRight size={11} /> {trend}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Activity Heatmap & SRS Review */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.25rem', marginBottom: '2rem' }}>
          
          {/* Heatmap */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Calendar size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Activity Intensity</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {Array.from({ length: 91 }).map((_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - (90 - i));
                const dateStr = date.toISOString().split('T')[0];
                const intensity = heatmap[dateStr] || 0;
                
                let bgColor = 'var(--bg-raised)';
                if (intensity > 3600) bgColor = 'var(--accent)'; // 1hr+
                else if (intensity > 1800) bgColor = 'rgba(139, 92, 246, 0.6)'; // 30min+
                else if (intensity > 0) bgColor = 'rgba(139, 92, 246, 0.2)'; // studied
                
                return (
                  <div 
                    key={dateStr}
                    title={`${dateStr}: ${Math.round(intensity / 60)}m`}
                    style={{ 
                      width: 10, height: 10, borderRadius: 2, background: bgColor,
                      border: intensity > 0 ? 'none' : '1px solid var(--border)' 
                    }} 
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.65rem', color: 'var(--text-faint)' }}>
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* SRS Quote/Queue */}
          <div className="card" style={{ padding: '1.25rem', background: reviewQueue.length > 0 ? 'var(--bg-surface)' : 'rgba(var(--accent-rgb), 0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <RotateCcw size={14} style={{ color: reviewQueue.length > 0 ? 'var(--accent)' : 'var(--text-faint)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Review Queue</span>
            </div>
            {reviewQueue.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {reviewQueue.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => navigate(`/topic/${item.topicId}?lesson=${item.lessonId}`)}
                    style={{ 
                      padding: '0.6rem 0.8rem', borderRadius: 8, background: 'var(--bg-raised)',
                      border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.lessonId}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 600 }}>{item.reason}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--text-faint)' }}>
                 <p style={{ fontSize: '0.78rem' }}>No lessons due for review today. Keep it up! 🔥</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>

          {/* Growth Chart */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Score History</span>
            </div>
            <div style={{ padding: '1rem', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <ResponsiveContainer width="100%" height={220} debounce={1}>
                <AreaChart data={stats.scoreHistory} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-faint)', fontSize: 10 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={2.5} fill="url(#scoreGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--accent)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Topic Breakdown */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <Target size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Topic Proficiency</span>
            </div>
            <div style={{ padding: '1rem', width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <ResponsiveContainer width="100%" height={220} debounce={1}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis
                    dataKey="name" type="category" axisLine={false} tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={110}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="score" radius={[0, 5, 5, 0]} barSize={10}>
                    {chartData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`}
                        fill={entry.score >= 80 ? 'var(--success)' : entry.score >= 60 ? 'var(--accent)' : 'var(--danger)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* DSA Progress Card & All Topics Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1.25rem', marginTop: '1.25rem' }}>
          {/* DSA Progress Card */}
          <div className="card" style={{ height: 'fit-content', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>DSA Track Status</span>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {curriculum.filter(t => t.level === 'DSA').map(topic => {
                const percent = getTopicProgress(topic.id);
                
                // Derive lock status
                let isLocked = false;
                if (topic.id === 'dsa-mastery') {
                  isLocked = getTopicProgress('dsa-foundations') < 100;
                } else if (topic.id === 'dsa-expert') {
                  isLocked = getTopicProgress('dsa-mastery') < 100;
                }

                return (
                  <div 
                    key={topic.id} 
                    onClick={() => !isLocked && navigate(`/topic/${topic.id}`)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', 
                      opacity: isLocked ? 0.5 : 1,
                      cursor: isLocked ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <div style={{ 
                      width: 32, height: 32, borderRadius: '8px', 
                      background: isLocked ? 'var(--bg-raised)' : 'var(--bg-surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid var(--border)', flexShrink: 0
                    }}>
                      {isLocked ? <Lock size={14} style={{ color: 'var(--text-faint)' }} /> : <topic.icon size={14} style={{ color: 'var(--accent)' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{topic.title}</span>
                        {percent === 100 ? (
                          <CheckCircle2 size={12} style={{ color: 'var(--success)' }} />
                        ) : (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>{isLocked ? 'Locked' : `${percent}%`}</span>
                        )}
                      </div>
                      <div style={{ height: 4, background: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: 'var(--text-faint)', opacity: isLocked ? 0 : 1 }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Score Table */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>All Topics Proficiency</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Topic', 'Avg Score', 'Attempts', 'Status'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 1.25rem', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, i) => (
                    <tr key={row.name} style={{ borderBottom: i < chartData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{row.name}</td>
                      <td style={{ padding: '0.75rem 1.25rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.82rem', fontWeight: 600, color: row.score >= 80 ? 'var(--success)' : row.score >= 60 ? 'var(--accent)' : 'var(--danger)' }}>
                        {row.score}%
                      </td>
                      <td style={{ padding: '0.75rem 1.25rem', fontSize: '0.82rem', color: 'var(--text-faint)' }}>{row.attempts}</td>
                      <td style={{ padding: '0.75rem 1.25rem' }}>
                        <span className={`badge ${row.score >= 80 ? 'badge-success' : row.score >= 60 ? 'badge-amber' : 'badge-danger'}`}>
                          {row.score >= 80 ? 'Mastered' : row.score >= 60 ? 'In Progress' : 'Needs Work'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};