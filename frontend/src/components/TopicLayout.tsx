import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { lessonsData } from '../data/lessons/index';
import { Check, ArrowRight, ArrowLeft, PlayCircle, Clock, ChevronRight, Sparkles, Copy, HelpCircle, BookOpen, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { Lesson, ProgressRecord, Topic } from '../types/curriculum';

type PracticeAttempt = {
  id: string; score: number; verdict: 'pass' | 'needs_improvement';
  createdAt: string; strengths?: string[]; gaps?: string[];
  learnMore?: string[]; feedbackSummary?: string;
};

export const TopicLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isGeneratingLab, setIsGeneratingLab] = useState(false);
  const [progress, setProgress] = useState<ProgressRecord>({});
  const [isSavingProgress, setIsSavingProgress] = useState(false);
  const [latestPractice, setLatestPractice] = useState<PracticeAttempt | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [quiz, setQuiz] = useState<any[] | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const topicMeta = curriculum.find(t => t.id === id);
  const lessons = useMemo(() => (id ? lessonsData[id] || [] : []), [id]);
  const activeLesson = lessons[activeTab] || lessons[0];
  const masteredSet = new Set(id ? (progress[id] as string[]) || [] : []);
  const isActiveLessonMastered = activeLesson ? masteredSet.has(activeLesson.id) : false;

  const topicIdx = curriculum.findIndex(t => t.id === id);
  const currentLessonIdx = lessons.findIndex((l: Lesson) => l.id === activeLesson?.id);
  const prevLesson = currentLessonIdx > 0 ? lessons[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx < lessons.length - 1 ? lessons[currentLessonIdx + 1] : null;
  const prevTopic = topicIdx > 0 && currentLessonIdx === 0 ? curriculum[topicIdx - 1] : null;
  const nextTopic = topicIdx < curriculum.length - 1 && currentLessonIdx === lessons.length - 1 ? curriculum[topicIdx + 1] : null;

  const recommendedNextStep: { type: 'lesson'; lesson: Lesson } | { type: 'topic'; topic: Topic } | { type: 'done' } | null = (() => {
    if (!id || !topicMeta || !isActiveLessonMastered) return null;
    if (nextLesson) return { type: 'lesson', lesson: nextLesson };
    if (nextTopic) return { type: 'topic', topic: nextTopic };
    return { type: 'done' };
  })();

  useEffect(() => {
    if (!id || !lessons.length) return;

    // Only auto-jump if they have no progress in this topic yet
    const hasProgress = (progress[id] as string[] || []).length > 0;
    const isReturning = progress.lastVisited?.topicId === id;

    if (!hasProgress && !isReturning) {
      const level = progress.experienceLevel;
      if (level === 'Intermediate') {
        setActiveTab(Math.min(2, lessons.length - 1));
      } else if (level === 'Advanced') {
        setActiveTab(Math.max(0, lessons.length - 1));
      } else {
        setActiveTab(0);
      }
    } else if (!isReturning) {
      // Default fallback if they have progress but aren't explicitly returning via lastVisited
      setActiveTab(0);
    }
  }, [id, lessons.length, progress.experienceLevel, progress.onboardingCompleted]);

  useEffect(() => {
    if (topicMeta && activeLesson) {
      document.title = `${activeLesson.title} | ${topicMeta.title} — Learning Hub`;
    }
  }, [topicMeta, activeLesson]);

  useEffect(() => {
    if (!id || !lessons.length) return;
    const lessonId = searchParams.get('lesson');
    if (!lessonId) return;
    const idx = lessons.findIndex((l: Lesson) => l.id === lessonId);
    if (idx >= 0) setActiveTab(idx);
  }, [id, lessons, searchParams]);

  useEffect(() => {
    let mounted = true;
    apiRequest<ProgressRecord>('/api/progress').then(d => { if (mounted) setProgress(d || {}); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (id && activeLesson?.id) {
      void apiRequest('/api/progress', { method: 'POST', body: { lastVisited: { topicId: id, lessonId: activeLesson.id, timestamp: Date.now() } } });
    }
  }, [id, activeLesson?.id]);

  // Study Session Logging
  useEffect(() => {
    if (!id || !activeLesson?.id) return;
    
    let startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const duration = Math.floor((now - startTime) / 1000);
      if (duration >= 60) { // Log every minute of active study
        void apiRequest('/api/log', {
          method: 'POST',
          body: { topicId: id, lessonId: activeLesson.id, durationSeconds: duration }
        });
        startTime = now;
      }
    }, 60000);

    return () => {
      clearInterval(interval);
      const now = Date.now();
      const finalDuration = Math.floor((now - startTime) / 1000);
      if (finalDuration > 5) { // Log final chunk if > 5s
        void apiRequest('/api/log', {
          method: 'POST',
          body: { topicId: id, lessonId: activeLesson.id, durationSeconds: finalDuration }
        });
      }
    };
  }, [id, activeLesson?.id]);

  useEffect(() => {
    if (!id || !activeLesson?.id) return;
    let mounted = true;
    apiRequest<{ attempts: PracticeAttempt[] }>(`/api/practice/attempts?topicId=${id}&lessonId=${activeLesson.id}`)
      .then(d => { if (mounted) setLatestPractice(d.attempts?.[0] || null); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [id, activeLesson?.id]);

  if (!topicMeta) return (
    <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Topic not found.</div>
  );

  const persistProgress = async (next: ProgressRecord) => {
    setIsSavingProgress(true);
    setProgress(next);
    window.dispatchEvent(new CustomEvent<ProgressRecord>('progress-updated', { detail: next }));
    try { await apiRequest('/api/progress', { method: 'POST', body: next }); } catch (err) { console.error('Failed to save progress:', err); }
    finally { setIsSavingProgress(false); }
  };

  const toggleMastered = async () => {
    if (!id || !activeLesson) return;
    const currentMastered = (progress[id] as string[]) || [];
    const cur = new Set(currentMastered);
    if (cur.has(activeLesson.id)) {
      cur.delete(activeLesson.id);
    } else {
      cur.add(activeLesson.id);
    }
    await persistProgress({ ...progress, [id]: Array.from(cur) });
  };

  const generateLabAndOpenPlayground = async () => {
    if (!id || !activeLesson?.id) return;
    setIsGeneratingLab(true);
    try {
      const data = await apiRequest<unknown>('/api/practice/generate', {
        method: 'POST',
        body: { topicId: id, lessonId: activeLesson.id, lessonTitle: activeLesson.title, lessonContent: activeLesson.content, lessonSummary: activeLesson.content?.join('\n') || '' }
      });
      // Verification check: ensure lesson matches current selection after async delay
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.get('lesson') === activeLesson.id || (!currentParams.get('lesson') && lessons[0]?.id === activeLesson.id)) {
        navigate(`/playground?topic=${id}&lesson=${activeLesson.id}`, { state: { challenge: data } });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error generating practice lab.');
    } finally { setIsGeneratingLab(false); }
  };

  const handleExplain = async (style: string) => {
    if (!activeLesson?.content) return;
    setIsExplaining(true);
    setExplanation(null);
    try {
      const data = await apiRequest<{ explanation: string }>('/api/explain', {
        method: 'POST',
        body: { topicId: id, lessonId: activeLesson.id, content: activeLesson.content.join('\n'), style }
      });
      setExplanation(data.explanation);
    } catch (err) {
      alert('Failed to generate explanation.');
    } finally { setIsExplaining(false); }
  };

  const handleGenerateQuiz = async () => {
    if (!activeLesson?.content) return;
    setIsGeneratingQuiz(true);
    setQuiz(null);
    try {
      const data = await apiRequest<{ quiz: any[] }>('/api/quiz/generate', {
        method: 'POST',
        body: { topicId: id, lessonId: activeLesson.id, lessonTitle: activeLesson.title, lessonContent: activeLesson.content.join('\n') }
      });
      setQuiz(data.quiz);
      setShowQuizModal(true);
    } catch (err) {
      alert('Failed to generate quiz.');
    } finally { setIsGeneratingQuiz(false); }
  };

  const handleQuizComplete = async (score: number, total: number) => {
    try {
      await apiRequest('/api/quiz/score', {
        method: 'POST',
        body: { topicId: id, lessonId: activeLesson.id, score, total }
      });
    } catch (err) {
      console.error('Failed to save quiz score:', err);
    }
  };

  const handleNavigate = (type: 'lesson' | 'topic', target: Lesson | Topic | null | undefined) => {
    if (!target) return;
    if (type === 'lesson') { setActiveTab(lessons.indexOf(target as Lesson)); window.scrollTo(0, 0); }
    else { navigate(`/topic/${(target as Topic).id}`); window.scrollTo(0, 0); }
  };

  const levelColor = (level: string) =>
    level === 'Foundations' ? 'var(--info)' : level === 'Mastery' ? 'var(--accent)' : 'var(--success)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── Top Header Bar ── */}
      <header style={{
        minHeight: 'var(--header-h)',
        height: 'auto',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-surface)',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        padding: '0.75rem 1.5rem',
        gap: '1rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: levelColor(topicMeta.level) }}>
            {topicMeta.level}
          </span>
          <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{topicMeta.title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronRight size={12} style={{ color: 'var(--text-faint)' }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{activeLesson?.title}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isActiveLessonMastered && (
            <span className="badge badge-success">
              <Check size={9} style={{ marginRight: 3 }} /> Mastered
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
            {currentLessonIdx + 1} / {lessons.length}
          </span>
        </div>
      </header>

      {/* ── Lesson Tabs ── */}
      {lessons.length > 1 && (
        <div style={{
          display: 'flex', alignItems: 'flex-end',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          overflowX: 'auto',
          flexShrink: 0,
        }}>
          {lessons.map((lesson: Lesson, i: number) => {
            const done = masteredSet.has(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => { setActiveTab(i); }}
                className={`ide-tab ${i === activeTab ? 'active' : ''}`}
              >
                {done && <Check size={10} style={{ color: 'var(--success)', opacity: 0.8 }} />}
                {lesson.title}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', width: '100%' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(2rem, 8vw, 4rem) clamp(1rem, 5vw, 2.5rem) 6rem' }} className="fade-up">

          {/* Lesson Title */}
          <div style={{ marginBottom: '2.5rem' }}>
            {activeLesson?.badge && (
              <span className="badge badge-amber" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
                {activeLesson.badge}
              </span>
            )}
            <h1 style={{
              fontFamily: 'Sora, sans-serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginTop: '0.75rem',
            }}>
              {activeLesson?.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-faint)', fontSize: '0.75rem' }}>
                <Clock size={12} />
                <span>~{Math.ceil((activeLesson?.content?.length || 3) * 1.5)} min read</span>
              </div>
              {activeLesson?.complexity && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-faint)' }}>· {activeLesson.complexity}</span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'linear-gradient(90deg, var(--border), transparent)', marginBottom: '2rem' }} />

          {/* Lesson Body */}
          <article className="lesson-prose" style={{ marginBottom: '2.5rem' }}>
            {activeLesson?.content?.map((p: string, i: number) => (
              <p
                key={i}
                style={{ marginBottom: '1.4rem' }}
                dangerouslySetInnerHTML={{
                  __html: p
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                }}
              />
            ))}
          </article>
          
          {/* Practice Instructions & Technical Notes */}
          {(activeLesson?.instructions || (activeLesson?.notes && activeLesson.notes.length > 0)) && (
            <div style={{ 
              marginBottom: '3rem', padding: '1.5rem', 
              background: 'var(--bg-raised)', borderRadius: 12, 
              border: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column', gap: '1.5rem'
            }}>
              {activeLesson.instructions && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <PlayCircle size={14} style={{ color: 'var(--accent)' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                      Practice Instructions
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {activeLesson.instructions}
                  </p>
                </div>
              )}
              
              {activeLesson.notes && activeLesson.notes.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <Sparkles size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--success)' }}>
                      Technical Deep-Dive
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeLesson.notes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--success)', fontWeight: 800 }}>•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Code Block */}
          {activeLesson?.code && (
            <div className="code-block" style={{ marginBottom: '3rem' }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 1.25rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-surface)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    TypeScript
                  </span>
                  <button
                    onClick={() => copyCode(activeLesson.code!)}
                    title="Copy code"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.65rem', fontWeight: 600,
                      color: codeCopied ? 'var(--success)' : 'var(--text-faint)',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      transition: 'color 0.15s',
                      padding: '0.1rem 0.25rem', borderRadius: 4,
                    }}
                    onMouseEnter={e => { if (!codeCopied) e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    onMouseLeave={e => { if (!codeCopied) e.currentTarget.style.color = 'var(--text-faint)'; }}
                  >
                    {codeCopied
                      ? <><Check size={11} /> Copied!</>
                      : <><Copy size={11} /> Copy</>}
                  </button>
                </div>
              </div>
              <pre style={{ margin: 0, padding: '1.5rem', overflowX: 'auto', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7 }}>
                <code style={{ fontFamily: 'JetBrains Mono, monospace' }}>{activeLesson.code}</code>
              </pre>
            </div>
          )}

          {/* Action Row */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem',
            padding: '1.5rem',
            background: 'var(--bg-surface)',
            borderRadius: 12,
            border: '1px solid var(--border)',
            marginBottom: '3rem',
          }}>
            <button
              className="btn-primary"
              onClick={generateLabAndOpenPlayground}
              disabled={isGeneratingLab}
              style={{ flex: '0 0 auto' }}
            >
              {isGeneratingLab ? (
                <><Sparkles size={15} style={{ animation: 'spin 1s linear infinite' }} /> Synthesizing Lab...</>
              ) : (
                <><PlayCircle size={15} /> Launch Practice Lab</>
              )}
            </button>

            <button
              onClick={() => void toggleMastered()}
              className="btn-ghost"
              style={{
                color: isActiveLessonMastered ? 'var(--success)' : 'var(--text-muted)',
                borderColor: isActiveLessonMastered ? 'rgba(16,185,129,0.3)' : 'var(--border)',
                background: isActiveLessonMastered ? 'var(--success-dim)' : 'var(--bg-raised)',
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `2px solid ${isActiveLessonMastered ? 'var(--success)' : 'var(--text-faint)'}`,
                background: isActiveLessonMastered ? 'var(--success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isActiveLessonMastered && <Check size={10} strokeWidth={3} style={{ color: '#fff' }} />}
              </div>
              {isSavingProgress ? 'Saving...' : isActiveLessonMastered ? 'Mastered' : 'Mark as Mastered'}
            </button>
          </div>

          {/* Learning Tools */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                Learning Tools
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem' }}>
              <div style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                padding: '1.5rem',
                minWidth: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <HelpCircle size={16} style={{ color: 'var(--info)' }} />
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Explain differently</h4>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['ELI5', 'Analogies', 'Deep Dive'].map(style => (
                    <button
                      key={style}
                      disabled={isExplaining}
                      onClick={() => handleExplain(style)}
                      className="btn-ghost"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                {isExplaining && (
                  <div style={{ marginTop: '1rem', color: 'var(--text-faint)', fontSize: '0.75rem' }}>
                    Gemini is thinking...
                  </div>
                )}
                {explanation && (
                  <div style={{ 
                    marginTop: '1.25rem', 
                    padding: '1.25rem', 
                    background: 'var(--bg-raised)', 
                    borderRadius: 10,
                    fontSize: '0.82rem',
                    lineHeight: 1.7,
                    color: 'var(--text-secondary)',
                    borderLeft: '4px solid var(--info)',
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    <button 
                      onClick={() => setExplanation(null)}
                      style={{ 
                        position: 'absolute', top: 10, right: 10, 
                        color: 'var(--text-faint)', background: 'transparent', 
                        border: 'none', cursor: 'pointer', padding: '0.2rem',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; }}
                    >
                      <X size={14} />
                    </button>
                    <div style={{ fontFamily: 'inherit' }}>
                      {explanation.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        
                        // Horizontal Rule
                        if (trimmed === '---') {
                          return <hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1.5rem 0', opacity: 0.5 }} />;
                        }
                        
                        // Header (H3)
                        if (trimmed.startsWith('### ')) {
                          return <h3 key={i} style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
                            {trimmed.replace('### ', '')}
                          </h3>;
                        }
                        
                        // List Item
                        if (trimmed.startsWith('* ')) {
                          return (
                            <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.4rem', paddingLeft: '0.5rem' }}>
                              <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: '0.6rem', flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                {trimmed.replace('* ', '').split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith('*') && part.endsWith('*')) {
                                    return <em key={j} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.9 }}>{part.slice(1, -1)}</em>;
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          );
                        }

                        // Normal Paragraph
                        return (
                          <div key={i} style={{ marginBottom: trimmed ? '0.75rem' : '1.25rem', minHeight: trimmed ? 0 : '1rem' }}>
                            {line.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, j) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
                              }
                              if (part.startsWith('*') && part.endsWith('*')) {
                                return <em key={j} style={{ color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.9 }}>{part.slice(1, -1)}</em>;
                              }
                              return part;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ 
                background: 'var(--bg-surface)', 
                border: '1px solid var(--border)', 
                borderRadius: 12, 
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minWidth: 0
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    <BookOpen size={16} style={{ color: 'var(--success)' }} />
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Quick Quiz</h4>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', lineHeight: 1.4 }}>
                    Test your knowledge with 5 flashcard questions.
                  </p>
                </div>
                <button
                  disabled={isGeneratingQuiz}
                  onClick={handleGenerateQuiz}
                  className="btn-ghost"
                  style={{ width: '100%', marginTop: '1.25rem', fontSize: '0.75rem', borderColor: 'var(--success-dim)', color: 'var(--success)' }}
                >
                   {isGeneratingQuiz ? 'Generating...' : 'Start Quiz'}
                </button>
              </div>
            </div>
          </div>

          {/* Practice Feedback */}
          {latestPractice && (
            <div className="card scale-in" style={{ padding: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Latest Lab Result
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: latestPractice.score >= 80 ? 'var(--success)' : 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {latestPractice.score}%
                  </span>
                  <span className={`badge ${latestPractice.verdict === 'pass' ? 'badge-success' : 'badge-danger'}`}>
                    {latestPractice.verdict === 'pass' ? 'Pass' : 'Review'}
                  </span>
                </div>
              </div>

              {latestPractice.feedbackSummary && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {latestPractice.feedbackSummary}
                </p>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.6rem' }}>
                    Strengths
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {latestPractice.strengths?.map((s, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', marginTop: 6, flexShrink: 0 }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '0.6rem' }}>
                    Areas to Improve
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {latestPractice.gaps?.map((g, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--danger)', marginTop: 6, flexShrink: 0 }} />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {latestPractice.learnMore?.[0] && (
                <div style={{
                  marginTop: '1rem', padding: '0.75rem 1rem',
                  background: 'var(--accent-dim)', borderRadius: 8,
                  border: '1px solid var(--border-accent)',
                  fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', marginRight: '0.4rem' }}>Recommended:</span>
                  {latestPractice.learnMore[0]}
                </div>
              )}
            </div>
          )}

          {/* Next Step */}
          {recommendedNextStep && recommendedNextStep.type !== 'done' && (
            <div
              onClick={() => {
                if (recommendedNextStep.type === 'lesson') handleNavigate('lesson', recommendedNextStep.lesson);
                else if (recommendedNextStep.type === 'topic') handleNavigate('topic', recommendedNextStep.topic);
              }}
              style={{
                padding: '1.5rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.15s',
                marginBottom: '3rem',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)'; }}
            >
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.4rem' }}>
                  Up Next
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {recommendedNextStep.type === 'lesson' ? recommendedNextStep.lesson.title : recommendedNextStep.type === 'topic' ? recommendedNextStep.topic.title : ''}
                </div>
              </div>
              <ArrowRight size={18} style={{ color: 'var(--accent)' }} />
            </div>
          )}

          {recommendedNextStep?.type === 'done' && (
            <div style={{ textAlign: 'center', padding: '2rem', marginBottom: '3rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--success)' }}>Curriculum Complete!</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)', marginTop: '0.5rem' }}>You've mastered the full curriculum.</p>
            </div>
          )}

          {/* Footer Navigation - Responsive Row */}
          <footer style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ minWidth: 0 }}>
              {(prevLesson || prevTopic) && (
                <button
                  onClick={() => prevLesson ? handleNavigate('lesson', prevLesson) : handleNavigate('topic', prevTopic)}
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', height: 'auto', padding: '1rem', gap: '0.4rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
                    <ArrowLeft size={10} /> Previous
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>
                    {prevLesson?.title || prevTopic?.title}
                  </span>
                </button>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              {(nextLesson || nextTopic) && (
                <button
                  onClick={() => nextLesson ? handleNavigate('lesson', nextLesson) : handleNavigate('topic', nextTopic)}
                  className="btn-ghost"
                  style={{ width: '100%', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end', height: 'auto', padding: '1rem', gap: '0.4rem' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Next <ArrowRight size={10} />
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'right' }}>
                    {nextLesson?.title || nextTopic?.title}
                  </span>
                </button>
              )}
            </div>
          </footer>

        </div>
      </div>

      {showQuizModal && quiz && (
        <QuizModal 
          quiz={quiz} 
          onClose={() => setShowQuizModal(false)} 
          onComplete={handleQuizComplete} 
        />
      )}
    </div>
  );
};

const QuizModal = ({ quiz, onClose, onComplete }: { quiz: any[], onClose: () => void, onComplete: (score: number, total: number) => void }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);
    if (idx === quiz[currentIdx].correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx === quiz.length - 1) {
      setIsFinished(true);
      onComplete(score, quiz.length);
    } else {
      setCurrentIdx(c => c + 1);
      setSelectedIdx(null);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', inset: 0, zIndex: 1100, 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
    }} className="fade-in">
      <div style={{ 
        width: '100%', maxWidth: 500, background: 'var(--bg-surface)', 
        borderRadius: 20, border: '1px solid var(--border)',
        overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        maxHeight: 'calc(100vh - 4rem)', // Leave space at top and bottom
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Pinned Header */}
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexShrink: 0,
          background: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => {
                if (!isFinished) {
                  if (window.confirm("Are you sure you want to quit? Your progress in this quiz will be lost.")) {
                    onClose();
                  }
                } else {
                  onClose();
                }
              }}
              title="Quit Quiz"
              style={{ 
                background: 'transparent', border: 'none', 
                color: 'var(--text-faint)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0.25rem', borderRadius: '4px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quick Quiz</h3>
          </div>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 700,
            color: 'var(--accent)',
            background: 'var(--accent-dim)',
            padding: '0.2rem 0.6rem',
            borderRadius: '99px',
            border: '1px solid var(--border-accent)'
          }}>
            {currentIdx + 1} / {quiz.length}
          </span>
        </div>

        {/* Scrollable Content */}
        <div style={{ 
          padding: '2rem', 
          overflowY: 'auto', 
          flex: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--bg-overlay) transparent'
        }}>
          {!isFinished ? (
            <>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '2rem', lineHeight: 1.4, color: 'var(--text-primary)' }}>
                {quiz[currentIdx].question}
              </p>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {quiz[currentIdx].options.map((opt: string, i: number) => {
                  const isCorrect = i === quiz[currentIdx].correctAnswerIndex;
                  const isSelected = i === selectedIdx;
                  
                  let borderColor = 'var(--border)';
                  let bgColor = 'var(--bg-raised)';
                  if (selectedIdx !== null) {
                    if (isCorrect) {
                      borderColor = 'var(--success)';
                      bgColor = 'var(--success-dim)';
                    } else if (isSelected) {
                      borderColor = 'var(--danger)';
                      bgColor = 'var(--danger-dim)';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      style={{ 
                        padding: '1.1rem 1.25rem', borderRadius: 12, border: `2px solid ${borderColor}`,
                        background: bgColor, textAlign: 'left', fontSize: '0.95rem',
                        fontWeight: 500,
                        transition: 'all 0.2s', cursor: selectedIdx === null ? 'pointer' : 'default',
                        color: selectedIdx !== null && isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selectedIdx !== null && (
                <div style={{ marginTop: '2rem' }}>
                  {quiz[currentIdx].explanation && (
                    <div style={{
                      marginBottom: '1.5rem',
                      padding: '1rem 1.25rem',
                      background: selectedIdx === quiz[currentIdx].correctAnswerIndex
                        ? 'var(--success-dim)' : 'var(--danger-dim)',
                      border: `1px solid ${selectedIdx === quiz[currentIdx].correctAnswerIndex
                        ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
                      borderRadius: 12,
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                    }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: selectedIdx === quiz[currentIdx].correctAnswerIndex
                          ? 'var(--success)' : 'var(--danger)',
                        marginBottom: '0.5rem',
                      }}>
                        {selectedIdx === quiz[currentIdx].correctAnswerIndex ? '✓ Correct Result' : '✗ Better Luck Next Time'}
                      </div>
                      {quiz[currentIdx].explanation}
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    {currentIdx === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{score === quiz.length ? '👑' : '🎯'}</div>
              <h4 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Quiz Complete!</h4>
              <p style={{ color: 'var(--text-faint)', fontSize: '1rem', marginBottom: '2.5rem' }}>You mastered <strong>{score}</strong> out of {quiz.length} questions.</p>
              <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '1.1rem' }}>Return to Lesson</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};