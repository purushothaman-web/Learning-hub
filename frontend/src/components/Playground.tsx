import { useEffect, useState, type KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Send, ChevronLeft, Terminal, FileCode, Info, Activity, ShieldCheck, Maximize2, Minimize2, CheckCircle2, XCircle, Sparkles, X } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { useDSAProgress } from '../hooks/useDSAProgress';
import { dsaProblems } from '../data/dsa-problems';
import { lessonsData } from '../data/lessons';
import type { ProgressRecord, Lesson } from '../types/curriculum';

type ChallengeData = {
  id: string; topicId: string; lessonId: string;
  instructions: string; starterCode: string;
  constraints?: string[]; complexity?: string;
  exampleCases?: {
    input: string;
    output: string;
    explanation?: string;
  }[];
};

type EvaluationResult = {
  score: number; verdict: 'pass' | 'needs_improvement';
  feedbackSummary: string; strengths: string[]; gaps: string[]; learnMore: string[];
};

export const Playground = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const topic = searchParams.get('topic');
  const lesson = searchParams.get('lesson');

  const [code, setCode] = useState('// Your code here\n');
  const storageKey = `lhs_code_${topic || 'sandbox'}_${lesson || 'default'}`;
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [activePanel, setActivePanel] = useState<'output' | 'eval'>('output');
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeData | null>(location.state?.challenge || null);
  const [progress, setProgress] = useState<ProgressRecord>({});
  const { clearPracticePrompt } = useDSAProgress(progress, setProgress);

  const activeLesson: Lesson | undefined = (topic && lesson) 
    ? lessonsData[topic]?.find(l => l.id === lesson)
    : undefined;

  useEffect(() => {
    apiRequest<ProgressRecord>('/api/progress').then(p => setProgress(p || {}));
  }, []);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (currentChallenge && !evaluation && !isSubmitting) {
      iv = setInterval(() => setElapsedTime(p => p + 1), 1000);
    }
    return () => clearInterval(iv);
  }, [currentChallenge, evaluation, isSubmitting]);

  useEffect(() => { 
    if (currentChallenge) {
      setCode(currentChallenge.starterCode); 
    } else if (activeLesson) {
      const commentHeader = [
        `/**`,
        ` * ${activeLesson.title}`,
        ` * `,
        ` * INSTRUCTIONS:`,
        ` * ${activeLesson.instructions}`,
        ` * `,
        ` * TECHNICAL NOTES:`,
        ...(activeLesson.notes?.map(n => ` * - ${n}`) || []),
        ` */`,
        ``,
        activeLesson.code
      ].join('\n');
      setCode(commentHeader);
    }
  }, [currentChallenge, activeLesson]);

  // Restore code from localStorage on mount (only for free-form, not challenges)
  useEffect(() => {
    if (!location.state?.challenge) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCode(saved);
    }
  }, [storageKey]);

  // Persist code to localStorage on change (only for free-form)
  useEffect(() => {
    if (!currentChallenge) {
      localStorage.setItem(storageKey, code);
    }
  }, [code, currentChallenge, storageKey]);

  const loadPracticeProblem = (problemId: string) => {
    const problem = dsaProblems.find(p => p.id === problemId);
    if (problem) {
      setCurrentChallenge({
        id: problem.id,
        topicId: 'dsa',
        lessonId: 'practice',
        instructions: problem.description,
        starterCode: problem.starterCode,
        exampleCases: problem.exampleCases
      });
      setOutput(`Loaded DSA Practice: ${problem.title}\n`);
      setTerminalCollapsed(false);
      setActivePanel('output');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      setCode(c => c.substring(0, s) + '  ' + c.substring(end));
      setTimeout(() => { if (e.currentTarget) e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2; }, 0);
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void executeCode();
    }
  };

  const executeCode = async () => {
    setIsExecuting(true);
    setTerminalCollapsed(false);
    setActivePanel('output');
    setOutput('Executing...\n');
    try {
      const data = await apiRequest<{ output?: string; error?: string }>('/api/execute', {
        method: 'POST', body: { code, topicId: topic || currentChallenge?.topicId }
      });
      setOutput(data.output || data.error || 'Execution complete.');
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally { setIsExecuting(false); }
  };

  const submitAttempt = async () => {
    const tId = topic || currentChallenge?.topicId;
    const lId = lesson || currentChallenge?.lessonId;
    if (!tId || !lId) return;
    setIsSubmitting(true);
    try {
      const result = await apiRequest<EvaluationResult>('/api/practice/evaluate', {
        method: 'POST',
        body: { topicId: tId, lessonId: lId, code, executionOutput: output, timeTakenSeconds: elapsedTime }
      });
      setEvaluation(result);
      setActivePanel('eval');
      setTerminalCollapsed(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submission failed');
    } finally { setIsSubmitting(false); }
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-void)', overflow: 'hidden' }}>

      {/* Top Bar */}
      <header style={{
        height: 'var(--header-h)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ color: 'var(--text-faint)', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FileCode size={14} style={{ color: 'var(--accent)' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {topic || 'sandbox'}/{lesson || 'solution'}
              <span style={{ opacity: 0.5 }}>.ts</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentChallenge && !evaluation && (
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: 'var(--text-faint)', marginRight: '0.5rem' }}>
              {fmt(elapsedTime)}
            </span>
          )}
          <button
            className="btn-ghost"
            onClick={executeCode}
            disabled={isExecuting}
            style={{ padding: '0.45rem 1rem', fontSize: '0.76rem' }}
          >
            <Play size={13} fill={isExecuting ? 'none' : 'currentColor'} />
            {isExecuting ? 'Running...' : 'Run'}
          </button>
          <button
            className="btn-primary"
            onClick={submitAttempt}
            disabled={isSubmitting || (!topic && !currentChallenge) || (!lesson && !currentChallenge)}
            style={{ padding: '0.45rem 1rem', fontSize: '0.76rem' }}
          >
            <Send size={13} />
            {isSubmitting ? 'Evaluating...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Instructions Panel */}
        <aside style={{
          width: 300,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <div style={{
            height: 35, display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0 1rem',
            background: 'var(--bg-raised)',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <Info size={11} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-faint)' }}>
              Instructions
            </span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
            {currentChallenge ? (
              <>
                <p style={{ fontSize: '0.84rem', lineHeight: 1.65, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {currentChallenge.instructions}
                </p>
                {currentChallenge.exampleCases && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                      <FileCode size={11} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        Examples
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {currentChallenge.exampleCases.map((exc, i) => (
                        <div key={i} style={{ 
                          background: 'var(--bg-raised)', padding: '0.75rem', borderRadius: '8px',
                          border: '1px solid var(--border)', fontSize: '0.75rem'
                        }}>
                          <div style={{ color: 'var(--text-faint)', marginBottom: '0.25rem', fontWeight: 600 }}>Input:</div>
                          <code style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>{exc.input}</code>
                          <div style={{ color: 'var(--text-faint)', marginBottom: '0.25rem', fontWeight: 600 }}>Output:</div>
                          <code style={{ color: 'var(--accent)' }}>{exc.output}</code>
                          {exc.explanation && (
                            <div style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.7rem', fontStyle: 'italic' }}>
                              Note: {exc.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {currentChallenge.constraints && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <ShieldCheck size={11} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        Constraints
                      </span>
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {currentChallenge.constraints.map((c, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginTop: 7, flexShrink: 0 }} />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : activeLesson ? (
              <>
                {activeLesson.instructions && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                      <Activity size={11} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        Lesson Instructions
                      </span>
                    </div>
                    <p style={{ fontSize: '0.84rem', lineHeight: 1.65, color: 'var(--text-secondary)' }}>
                      {activeLesson.instructions}
                    </p>
                  </div>
                )}
                {activeLesson.notes && activeLesson.notes.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem' }}>
                      <FileCode size={11} style={{ color: 'var(--accent)' }} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                        Technical Notes
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeLesson.notes.map((note, i) => (
                        <div key={i} style={{ 
                          background: 'var(--bg-raised)', padding: '0.75rem', borderRadius: '8px',
                          border: '1px solid var(--border)', fontSize: '0.74rem', color: 'var(--text-muted)',
                          lineHeight: 1.5
                        }}>
                          {note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!activeLesson.instructions && !activeLesson.notes && (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-faint)', fontSize: '0.82rem' }}>
                    <p>Select a challenge to begin practice.</p>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-faint)', fontSize: '0.82rem' }}>
                <Terminal size={28} style={{ opacity: 0.4, margin: '0 auto 1rem' }} />
                <p>No active challenge.</p>
                <p style={{ marginTop: '0.4rem', opacity: 0.6 }}>Generate one from a lesson.</p>
              </div>
            )}
          </div>
        </aside>

        {/* Editor + Terminal */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Practice Prompt Banner */}
      {progress.pendingPracticePrompt && !currentChallenge && (
        <div style={{
          position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, width: '90%', maxWidth: '600px',
          background: 'var(--bg-surface)', border: '1px solid var(--accent)',
          borderRadius: '12px', padding: '1rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', gap: '1rem'
        }} className="fade-up">
          <div style={{
            width: 40, height: 40, borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Time for a Practice Drill!
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              You've made great progress in DSA. Ready for a quick {dsaProblems.find(p => p.id === progress.pendingPracticePrompt?.problemId)?.difficulty} challenge?
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => {
                if (progress.pendingPracticePrompt) {
                  loadPracticeProblem(progress.pendingPracticePrompt.problemId);
                  clearPracticePrompt();
                }
              }}
              style={{
                padding: '0.5rem 1rem', background: 'var(--accent)', color: 'white',
                border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Start Practice
            </button>
            <button 
              onClick={() => clearPracticePrompt()}
              style={{
                padding: '0.5rem', background: 'var(--bg-raised)', border: '1px solid var(--border)',
                borderRadius: '6px', color: 'var(--text-faint)', cursor: 'pointer'
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
          <section style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              height: 35, display: 'flex', alignItems: 'flex-end',
              background: 'var(--bg-raised)',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <div className="ide-tab active">
                <FileCode size={11} /> editor.ts
              </div>
            </div>
            <textarea
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              style={{
                flex: 1,
                width: '100%',
                background: 'var(--bg-void)',
                color: '#e2e8f0',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13.5px',
                lineHeight: 1.7,
                padding: '1.25rem 1.5rem',
                border: 'none',
                outline: 'none',
                resize: 'none',
                tabSize: 2,
              }}
            />
          </section>

          {/* Terminal */}
          <section style={{
            height: terminalCollapsed ? 35 : '36%',
            minHeight: terminalCollapsed ? 35 : 140,
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-void)',
            display: 'flex', flexDirection: 'column',
            transition: 'height 0.2s ease',
            flexShrink: 0,
          }}>
            <div style={{
              height: 35,
              background: 'var(--bg-surface)',
              borderBottom: terminalCollapsed ? 'none' : '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 0.75rem',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <button
                  onClick={() => { setActivePanel('output'); setTerminalCollapsed(false); }}
                  className={`ide-tab ${activePanel === 'output' ? 'active' : ''}`}
                  style={{ height: 35 }}
                >
                  <Terminal size={11} /> Output
                </button>
                {evaluation && (
                  <button
                    onClick={() => { setActivePanel('eval'); setTerminalCollapsed(false); }}
                    className={`ide-tab ${activePanel === 'eval' ? 'active' : ''}`}
                    style={{ height: 35 }}
                  >
                    <Activity size={11} /> Evaluation
                  </button>
                )}
              </div>
              <button
                onClick={() => setTerminalCollapsed(!terminalCollapsed)}
                style={{ color: 'var(--text-faint)', padding: '0.25rem' }}
              >
                {terminalCollapsed ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
            </div>

            {!terminalCollapsed && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
                {activePanel === 'output' ? (
                  <pre style={{
                    margin: 0,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12.5px',
                    color: output.toLowerCase().includes('error') ? 'var(--danger)' : '#98c7a8',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}>
                    {output || '> Ready. Press Run to execute your code.'}
                  </pre>
                ) : evaluation ? (
                  <div className="fade-up">
                    {/* Score Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 700, color: evaluation.score >= 80 ? 'var(--success)' : evaluation.score >= 60 ? 'var(--accent)' : 'var(--danger)' }}>
                          {evaluation.score}%
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '2px' }}>Lab Score</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {evaluation.verdict === 'pass'
                          ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                          : <XCircle size={18} style={{ color: 'var(--danger)' }} />
                        }
                        <span className={`badge ${evaluation.verdict === 'pass' ? 'badge-success' : 'badge-danger'}`}>
                          {evaluation.verdict === 'pass' ? 'Passed' : 'Needs Work'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {evaluation.feedbackSummary}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--success)', marginBottom: '0.5rem' }}>Strengths</div>
                        {evaluation.strengths.map((s, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--success)', flexShrink: 0 }}>+</span> {s}
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: '0.5rem' }}>Gaps</div>
                        {evaluation.gaps.map((g, i) => (
                          <div key={i} style={{ display: 'flex', gap: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                            <span style={{ color: 'var(--danger)', flexShrink: 0 }}>–</span> {g}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button className="btn-ghost" onClick={() => navigate(-1)} style={{ fontSize: '0.76rem', padding: '0.45rem 1rem' }}>
                      <ChevronLeft size={13} /> Back to Lesson
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Status Bar */}
      <footer style={{
        height: 22,
        background: 'var(--bg-void)',
        borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1rem',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '10px', color: 'var(--success)' }}>
            <Activity size={9} /> {topic === 'postgresql' ? 'SQL Engine' : 'Node.js / V8'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono, monospace' }}>
          <span>TypeScript</span>
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </footer>
    </div>
  );
};
