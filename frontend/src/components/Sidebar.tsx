import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import { TerminalSquare, BookOpen, BarChart2, ChevronRight, FileText, CheckCircle2, Search, X, GraduationCap, Lock, AlertCircle, RefreshCw, Download, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import { lessonsData } from '../data/lessons/index';
import { apiRequest } from '../lib/api';
import logo from '../assets/logo.png';
import { CAREER_PATHS } from '../data/paths';
import type { Lesson, ProgressRecord } from '../types/curriculum';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isExpanded, onToggle }: SidebarProps) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPlayground = location.pathname === '/playground';
  const isDashboard = location.pathname === '/dashboard';
  const currentTopicId = location.pathname.split('/').pop() || '';
  const currentLessonId = searchParams.get('lesson');
  const [progress, setProgress] = useState<ProgressRecord>({});
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const lessonMap = lessonsData;

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await apiRequest<ProgressRecord>('/api/progress');
        if (mounted) setProgress(data || {});
      } catch { if (mounted) setProgress({}); }
    };
    const onUpdate = (e: Event) => setProgress((e as CustomEvent<ProgressRecord>).detail || {});
    window.addEventListener('progress-updated', onUpdate);
    void load();
    return () => { mounted = false; window.removeEventListener('progress-updated', onUpdate); };
  }, []);

  // Automatically expand the current topic when it changes
  useEffect(() => {
    if (currentTopicId) {
      setExpandedTopics(prev => {
        const next = new Set(prev);
        next.add(currentTopicId);
        return next;
      });
    }
  }, [currentTopicId]);

  const activeCurriculum = useMemo(() => {
    if (progress.customPath) {
      return curriculum.filter(t => progress.customPath!.includes(t.id));
    }
    if (progress.careerPath) {
      const path = CAREER_PATHS.find(p => p.id === progress.careerPath);
      if (path) {
        return curriculum.filter(t => path.topics.includes(t.id));
      }
    }
    return curriculum;
  }, [progress.careerPath, progress.customPath]);

  const isBeginner = progress.experienceLevel === 'Beginner';
  const currentPathMandatory = useMemo(() => {
    if (!isBeginner || !progress.careerPath) return new Set<string>();
    const path = CAREER_PATHS.find(p => p.id === progress.careerPath);
    return new Set(path?.mandatoryTopics || []);
  }, [isBeginner, progress.careerPath]);

  const hasIncompleteMandatory = useMemo(() => {
    if (!isBeginner) return false;
    for (const topicId of currentPathMandatory) {
      const lessons = lessonMap[topicId] || [];
      const masteredSet = new Set((progress[topicId] as string[]) || []);
      if (lessons.length > 0 && !lessons.every((l: Lesson) => masteredSet.has(l.id))) return true;
    }
    return false;
  }, [isBeginner, currentPathMandatory, progress, lessonMap]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const results: (Lesson & { topicId: string, topicTitle: string })[] = [];
    activeCurriculum.forEach(topic => {
      (lessonMap[topic.id] || []).forEach((lesson: Lesson) => {
        if (lesson.title.toLowerCase().includes(q) || lesson.content?.some((c: string) => c.toLowerCase().includes(q))) {
          results.push({ topicId: topic.id, topicTitle: topic.title, ...lesson });
        }
      });
    });
    return results;
  }, [searchQuery, lessonMap, activeCurriculum]);

  const { percent, mastered, total } = useMemo(() => {
    const total = activeCurriculum.reduce((s, t) => s + (lessonMap[t.id]?.length || 0), 0);
    const mastered = activeCurriculum.reduce((s, t) => {
      const valid = new Set((lessonMap[t.id] || []).map((l: Lesson) => l.id));
      return s + ((progress[t.id] as string[]) || []).filter(id => valid.has(id)).length;
    }, 0);
    return { percent: total > 0 ? Math.round((mastered / total) * 100) : 0, mastered, total };
  }, [lessonMap, progress, activeCurriculum]);

  const learnPath = useMemo(() => {
    if (progress.onboardingCompleted && progress.lastVisited?.topicId) {
      const { topicId, lessonId } = progress.lastVisited;
      return `/topic/${topicId}${lessonId ? `?lesson=${lessonId}` : ''}`;
    }
    if (progress.onboardingCompleted) return '/dashboard';
    return '/welcome';
  }, [progress]);


  const toggleExpand = (id: string) => {
    const next = new Set(expandedTopics);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedTopics(next);
  };

  const highlight = (text: string, q: string) => {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return <span>{parts.map((p, i) => p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : p)}</span>;
  };

  const handleReset = async () => {
    if (!confirm('This will reset your career path and onboarding status. Your practice progress will be preserved. Continue?')) return;
    try {
      await apiRequest('/api/progress', {
        method: 'PATCH',
        body: { onboardingCompleted: false, careerPath: null, experienceLevel: null }
      });
      window.dispatchEvent(new CustomEvent<ProgressRecord>('progress-updated', { detail: { onboardingCompleted: false, careerPath: undefined, experienceLevel: undefined } }));
      navigate('/welcome');
    } catch (err) {
      alert('Failed to reset path.');
    }
  };

  const handleExport = async () => {
    try {
      const data = await apiRequest('/api/progress/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learning-hub-progress-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export progress.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm('This will OVERWRITE your current progress with the imported data. Continue?')) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const progressData = JSON.parse(event.target?.result as string);
        await apiRequest('/api/progress/import', {
          method: 'POST',
          body: { progressData }
        });
        alert('Progress imported successfully! The app will reload.');
        window.location.reload();
      } catch (err) {
        alert('Invalid progress file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      {/* Icon Nav Rail */}
      <nav
        style={{
          width: 'var(--nav-width)',
          background: 'var(--bg-void)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1rem 0',
          gap: '0.5rem',
          zIndex: 20,
        }}
      >
        {/* Toggle Button */}
        <button 
          onClick={onToggle}
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          style={{ marginBottom: '1rem' }}
          className={`nav-btn ${isExpanded ? 'active' : ''}`}
        >
          <ChevronRight 
            size={18} 
            strokeWidth={2} 
            style={{ 
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' 
            }} 
          />
        </button>

        {/* Logo */}
        <div style={{ marginBottom: '1rem', padding: '0.25rem' }}>
          <img src={logo} alt="LHS" style={{ width: 28, height: 28, filter: 'brightness(1.1) saturate(0.8)' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
          <NavLink to={learnPath} title="Learn">
            {({ isActive }) => {
              // Special isActive logic: if we are in any topic, the 'Learn' button should be active
              const isLearnActive = isActive || location.pathname.startsWith('/topic/');
              return (
                <div className={`nav-btn ${isLearnActive && !isPlayground && !isDashboard ? 'active' : ''}`}>
                  <BookOpen size={18} strokeWidth={1.75} />
                </div>
              );
            }}
          </NavLink>
          <NavLink to="/dashboard" title="Dashboard">
            {({ isActive }) => (
              <div className={`nav-btn ${isActive ? 'active' : ''}`}>
                <BarChart2 size={18} strokeWidth={1.75} />
              </div>
            )}
          </NavLink>
          <NavLink to="/playground" title="Playground">
            {({ isActive }) => (
              <div className={`nav-btn ${isActive ? 'active' : ''}`}>
                <TerminalSquare size={18} strokeWidth={1.75} />
              </div>
            )}
          </NavLink>
        </div>

        {/* Progress ring stub */}
        <div title={`${percent}% complete`} style={{ marginTop: 'auto', position: 'relative', width: 32, height: 32 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="16" cy="16" r="12" fill="none" stroke="var(--bg-overlay)" strokeWidth="2.5" />
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke="var(--accent)" strokeWidth="2.5"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - percent / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.16,1,.3,1)' }}
            />
          </svg>
          <span style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.52rem', fontWeight: 700, color: 'var(--accent)',
          }}>
            {percent}
          </span>
        </div>
      </nav>

      {/* Explorer Panel */}
      <aside
        style={{
          width: '100%', // Take up the full grid column width
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', 
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          visibility: isExpanded ? 'visible' : 'hidden', // Hide content visually
          opacity: isExpanded ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{
          height: 'var(--header-h)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={14} style={{ color: 'var(--accent)' }} />
            <span className="sidebar-label" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>Curriculum</span>
          </div>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700,
            color: 'var(--text-faint)',
            background: 'var(--bg-raised)',
            padding: '0.15rem 0.5rem',
            borderRadius: '99px',
            border: '1px solid var(--border)',
          }}>
            {mastered}/{total}
          </span>
        </div>

        {/* Search */}
        <div style={{ padding: '0.75rem', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{
              position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-faint)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.45rem 2rem 0.45rem 2rem',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{
                position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-faint)', padding: '2px',
              }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 0.5rem 0.5rem' }}>
          {searchResults ? (
            <div>
              <div className="sidebar-label" style={{ padding: '0.5rem 0.5rem', display: 'block', marginBottom: '0.25rem' }}>
                {searchResults.length} results
              </div>
              {searchResults.length > 0 ? searchResults.map(r => (
                <NavLink
                  key={`${r.topicId}-${r.id}`}
                  to={`/topic/${r.topicId}?lesson=${r.id}`}
                  onClick={() => setSearchQuery('')}
                  style={{ display: 'block', padding: '0.5rem 0.6rem', borderRadius: '7px', marginBottom: '2px', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-raised)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    <FileText size={11} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    {highlight(r.title, searchQuery)}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: '2px', paddingLeft: '1.2rem' }}>
                    {r.topicTitle}
                  </div>
                </NavLink>
              )) : (
                <div style={{ textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.78rem', padding: '2rem 1rem' }}>
                  No results for "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            <>
              {(['Foundations', 'Mastery', 'Expert & AI'] as const).map(level => {
                const topics = activeCurriculum.filter(t => t.level === level);
                if (!topics.length) return null;
                return (
                  <div key={level} style={{ marginBottom: '1rem' }}>
                    <div className="sidebar-label" style={{
                      display: 'block', padding: '0.5rem 0.6rem 0.35rem',
                      color: level === 'Foundations' ? 'var(--info)' : level === 'Mastery' ? 'var(--accent)' : 'var(--success)',
                    }}>
                      {level}
                    </div>
                    {topics.map(topic => {
                      const isActive = currentTopicId === topic.id;
                      const isExpanded = expandedTopics.has(topic.id);
                      const lessons = lessonMap[topic.id] || [];
                      const masteredSet = new Set((progress[topic.id] as string[]) || []);
                      const topicPercent = lessons.length > 0
                        ? Math.round(lessons.filter((l: Lesson) => masteredSet.has(l.id)).length / lessons.length * 100)
                        : 0;

                      return (
                        <div key={topic.id}>
                          <div
                            className={`topic-row ${isActive ? 'active' : ''}`}
                            onClick={() => toggleExpand(topic.id)}
                          >
                            <ChevronRight
                              size={13}
                              style={{
                                flexShrink: 0,
                                color: 'var(--text-faint)',
                                transition: 'transform 0.2s',
                                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                              }}
                            />
                            <topic.icon size={13} style={{ flexShrink: 0, opacity: 0.8 }} strokeWidth={1.75} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {topic.title}
                            </span>
                            {currentPathMandatory.has(topic.id) && isBeginner && topicPercent < 100 && (
                              <span style={{
                                fontSize: '0.55rem', fontWeight: 800,
                                color: 'var(--bg-base)',
                                background: 'var(--info)',
                                padding: '0.1rem 0.35rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                flexShrink: 0,
                                marginRight: '0.4rem',
                                boxShadow: '0 2px 8px rgba(var(--info-rgb), 0.3)'
                              }}>
                                Start Here
                              </span>
                            )}
                            {!currentPathMandatory.has(topic.id) && topic.required && (
                              <span style={{
                                fontSize: '0.55rem', fontWeight: 800,
                                color: 'var(--accent)',
                                background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)',
                                padding: '0.05rem 0.3rem',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                flexShrink: 0,
                                marginRight: '0.4rem'
                              }}>
                                Required
                              </span>
                            )}
                            {topicPercent > 0 && (
                              <span style={{
                                fontSize: '0.6rem', fontWeight: 700,
                                color: topicPercent === 100 ? 'var(--success)' : 'var(--text-faint)',
                                flexShrink: 0,
                              }}>
                                {topicPercent}%
                              </span>
                            )}
                          </div>

                          {isBeginner && hasIncompleteMandatory && !topic.required && !currentPathMandatory.has(topic.id) && isExpanded && !dismissedWarnings.has(topic.id) && (
                            <div style={{ 
                              margin: '0 0.6rem 0.5rem 1.6rem', padding: '0.5rem', 
                              background: 'rgba(245, 158, 11, 0.1)', 
                              border: '1px solid rgba(245, 158, 11, 0.2)', 
                              borderRadius: '6px',
                              display: 'flex', gap: '0.4rem', alignItems: 'start'
                            }}>
                              <AlertCircle size={10} style={{ color: 'var(--warning)', marginTop: '2px', flexShrink: 0 }} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--warning)', fontWeight: 600, lineHeight: 1.3 }}>
                                  Tip: Complete mandatory topics first to build a solid foundation.
                                </div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDismissedWarnings(s => new Set([...s, topic.id])); }}
                                  style={{ fontSize: '0.6rem', color: 'var(--text-faint)', marginTop: '2px', textDecoration: 'underline' }}
                                >
                                  Dismiss
                                </button>
                              </div>
                            </div>
                          )}

                          {isExpanded && (
                            <div style={{ marginBottom: '0.25rem' }}>
                              {lessons.map((lesson: Lesson, idx: number) => {
                                const isLessonActive = isActive && (
                                  (currentLessonId && currentLessonId === lesson.id) ||
                                  (!currentLessonId && idx === 0)
                                );
                                const done = masteredSet.has(lesson.id);
                                return (
                                  <NavLink
                                    key={lesson.id}
                                    to={`/topic/${topic.id}?lesson=${lesson.id}`}
                                    className={`lesson-row ${isLessonActive ? 'active' : ''}`}
                                    style={{ display: 'flex' }}
                                  >
                                    {done
                                      ? <CheckCircle2 size={11} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                      : <div style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                                    }
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {lesson.title}
                                    </span>
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* DSA Track */}
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <div className="sidebar-label" style={{
                  display: 'block', padding: '0.5rem 0.6rem 0.35rem',
                  color: 'var(--accent)', opacity: 0.8
                }}>
                  DSA TRACK
                </div>
                {curriculum.filter(t => t.level === 'DSA').map(topic => {
                  const isActive = currentTopicId === topic.id;
                  const lessons = lessonMap[topic.id] || [];
                  const masteredSet = new Set((progress[topic.id] as string[]) || []);
                  const topicPercent = lessons.length > 0
                    ? Math.round(lessons.filter((l: Lesson) => masteredSet.has(l.id)).length / lessons.length * 100)
                    : 0;

                  // Derive lock status
                  let isLocked = false;
                  let lockReason = "";
                  if (topic.id === 'dsa-mastery') {
                    const foundLessons = lessonMap['dsa-foundations'] || [];
                    const foundMastered = new Set((progress['dsa-foundations'] as string[]) || []);
                    isLocked = !foundLessons.every((l: Lesson) => foundMastered.has(l.id));
                    lockReason = "Complete Foundations first";
                  } else if (topic.id === 'dsa-expert') {
                    const masteryLessons = lessonMap['dsa-mastery'] || [];
                    const masteryMastered = new Set((progress['dsa-mastery'] as string[]) || []);
                    isLocked = !masteryLessons.every((l: Lesson) => masteryMastered.has(l.id));
                    lockReason = "Complete Mastery first";
                  }

                   const isExpanded = expandedTopics.has(topic.id) && !isLocked;

                  return (
                    <div key={topic.id} style={{ 
                      position: 'relative',
                      margin: '0 0.5rem 2px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.2s',
                      background: isLocked ? 'rgba(0,0,0,0.02)' : 'transparent',
                      border: isLocked ? '1px dashed var(--border)' : '1px solid transparent'
                    }}>
                      <div
                        className={`topic-row ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}`}
                        onClick={() => !isLocked && toggleExpand(topic.id)}
                        style={{ 
                          cursor: isLocked ? 'not-allowed' : 'pointer',
                          padding: '0.5rem 0.6rem',
                          borderRadius: '8px',
                          display: 'flex', alignItems: 'center', gap: '0.6rem',
                        }}
                        title={isLocked ? lockReason : ""}
                      >
                        <ChevronRight
                          size={13}
                          style={{
                            flexShrink: 0,
                            color: 'var(--text-faint)',
                            transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)',
                            opacity: isLocked ? 0 : 1
                          }}
                        />
                        {isLocked ? <Lock size={13} style={{ flexShrink: 0 }} /> : <topic.icon size={13} style={{ flexShrink: 0, opacity: 0.8 }} strokeWidth={1.75} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {topic.title}
                        </span>
                        {topicPercent > 0 && (
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 700,
                            color: topicPercent === 100 ? 'var(--success)' : 'var(--text-faint)',
                            flexShrink: 0,
                          }}>
                            {topicPercent}%
                          </span>
                        )}
                      </div>

                      {isExpanded && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          {lessons.map((lesson: Lesson, idx: number) => {
                            const isLessonActive = isActive && (
                              (currentLessonId && currentLessonId === lesson.id) ||
                              (!currentLessonId && idx === 0)
                            );
                            const done = masteredSet.has(lesson.id);
                            return (
                              <NavLink
                                key={lesson.id}
                                to={`/topic/${topic.id}?lesson=${lesson.id}`}
                                className={`lesson-row ${isLessonActive ? 'active' : ''}`}
                                style={{ display: 'flex' }}
                              >
                                {done
                                  ? <CheckCircle2 size={11} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                  : <div style={{ width: 11, height: 11, borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }} />
                                }
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {lesson.title}
                                </span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick links */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <NavLink
                  to="/playground"
                  className={({ isActive }) => `topic-row ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex' }}
                >
                  <TerminalSquare size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  <span>Interactive Playground</span>
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => `topic-row ${isActive ? 'active' : ''}`}
                  style={{ display: 'flex', marginTop: '2px' }}
                >
                  <BarChart2 size={13} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  <span>Mastery Analytics</span>
                </NavLink>
              </div>
            </>
          )}
        </div>

        {/* Footer Progress */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-void)',
          flexShrink: 0,
        }}>
          {/* Last Studied / Streak */}
          {(() => {
            const ts = (progress.lastVisited as { topicId?: string; lessonId?: string; timestamp?: number } | undefined)?.timestamp;
            if (!ts) return null;
            const daysDiff = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
            const label = daysDiff === 0 ? '🔥 Studied today' : daysDiff === 1 ? 'Last studied yesterday' : `Last studied ${daysDiff}d ago`;
            return (
              <div style={{ fontSize: '0.62rem', fontWeight: 600, color: daysDiff === 0 ? 'var(--success)' : 'var(--text-faint)', marginBottom: '0.5rem' }}>
                {label}
              </div>
            );
          })()}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span className="sidebar-label" style={{ color: 'var(--text-faint)' }}>Overall Progress</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)' }}>{percent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <button 
            onClick={handleReset}
            style={{ 
              width: '100%', marginTop: '1rem', padding: '0.4rem', 
              fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-faint)',
              background: 'transparent', border: '1px solid var(--border)', 
              borderRadius: '6px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', gap: '0.4rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-faint)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <RefreshCw size={10} /> Reset Career Path
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button 
              onClick={handleExport}
              style={{ 
                padding: '0.35rem', fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-faint)',
                background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer'
              }}
            >
              <Download size={10} /> Export
            </button>
            <label style={{ 
              padding: '0.35rem', fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-faint)',
              background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', cursor: 'pointer'
            }}>
              <Upload size={10} /> Import
              <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};
