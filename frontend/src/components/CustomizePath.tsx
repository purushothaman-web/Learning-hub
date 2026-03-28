import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CAREER_PATHS, type ExperienceLevel } from '../data/paths';
import { curriculum } from '../data/curriculum';
import { ChevronRight, ArrowUp, ArrowDown, X, AlertTriangle, Save } from 'lucide-react';
import { apiRequest } from '../lib/api';

export const CustomizePath = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pathId = searchParams.get('path');
  const level = searchParams.get('level') as ExperienceLevel;
  
  const careerPath = CAREER_PATHS.find(p => p.id === pathId);
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(careerPath?.topics || []);
  const [dailyTarget, setDailyTarget] = useState(3);

  const handleToggle = (id: string) => {
    setSelectedTopicIds(prev => 
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...selectedTopicIds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelectedTopicIds(next);
  };

  const moveDown = (index: number) => {
    if (index === selectedTopicIds.length - 1) return;
    const next = [...selectedTopicIds];
    [next[index + 1], next[index]] = [next[index], next[index + 1]];
    setSelectedTopicIds(next);
  };

  const handleSave = async () => {
    try {
      await apiRequest('/api/onboarding/complete', {
        method: 'POST',
        body: {
          careerPath: pathId,
          experienceLevel: level,
          customPath: selectedTopicIds,
          dailyTarget
        }
      });
      window.dispatchEvent(new CustomEvent('progress-updated', { 
        detail: { careerPath: pathId, experienceLevel: level, customPath: selectedTopicIds } 
      }));
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save custom path:', error);
    }
  };

  if (!careerPath) return <div>Invalid path.</div>;

  const availableTopics = curriculum;

  return (
    <div className="customize-screen" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-void)',
      padding: 'clamp(2rem, 8vh, 4rem) clamp(1rem, 5vw, 2.5rem)',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto', paddingTop: '2rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Customize your journey
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '3rem', maxWidth: '600px' }}>
          Drag topics to reorder your priority or toggle them to skip what you already know.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', 
          gap: 'clamp(1.5rem, 4vw, 3rem)' 
        }}>
          {/* Active Flow */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              Your Personal Roadmap
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {selectedTopicIds.map((id, index) => {
                const topic = availableTopics.find(t => t.id === id);
                if (!topic) return null;
                const isFoundational = topic.level === 'Foundations';

                return (
                  <div key={id} style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    transition: 'all 0.2s'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <button onClick={() => moveUp(index)} disabled={index === 0} style={{ padding: '2px', color: 'var(--text-faint)', cursor: index === 0 ? 'default' : 'pointer' }}>
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index === selectedTopicIds.length - 1} style={{ padding: '2px', color: 'var(--text-faint)', cursor: index === selectedTopicIds.length - 1 ? 'default' : 'pointer' }}>
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {topic.title}
                        </h4>
                        {isFoundational && (
                          <div title="Foundational topic. Skipping not recommended." style={{ color: 'var(--warning)', cursor: 'help' }}>
                            <AlertTriangle size={14} />
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-faint)', marginTop: '2px' }}>{topic.level}</div>
                    </div>

                    <button 
                      onClick={() => handleToggle(id)}
                      style={{ 
                        padding: '4px', 
                        color: 'var(--text-faint)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer' 
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Available Library */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
              Add more topics
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {availableTopics.filter(t => !selectedTopicIds.includes(t.id)).map(topic => (
                <div 
                  key={topic.id}
                  onClick={() => handleToggle(topic.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-void)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    opacity: 0.7
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = 'var(--text-faint)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{topic.title}</div>
                  <ChevronRight size={14} style={{ color: 'var(--text-faint)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Momentum Strategy Picker */}
        <div style={{ marginTop: '4rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            Choose your momentum
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { id: 1, label: 'Relaxed', desc: '1 lesson / day', icon: '🌱' },
              { id: 3, label: 'Standard', desc: '3 lessons / day', icon: '⚡' },
              { id: 5, label: 'Intense', desc: '5 lessons / day', icon: '🔥' },
            ].map(strategy => (
              <button
                key={strategy.id}
                onClick={() => setDailyTarget(strategy.id)}
                style={{
                  padding: '1.25rem',
                  background: dailyTarget === strategy.id ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--bg-surface)',
                  border: dailyTarget === strategy.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{strategy.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: dailyTarget === strategy.id ? 'var(--accent)' : 'var(--text-primary)' }}>{strategy.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>{strategy.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '4rem', 
          paddingTop: '2rem', 
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', color: 'var(--text-faint)', fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{
              padding: '0.75rem 2.5rem',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)'
            }}
          >
            <Save size={18} /> Save & Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};
