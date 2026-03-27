import { useNavigate, useSearchParams } from 'react-router-dom';
import { CAREER_PATHS, type ExperienceLevel } from '../data/paths';
import { curriculum } from '../data/curriculum';
import { ChevronRight, Sliders } from 'lucide-react';
import { apiRequest } from '../lib/api';
import type { ProgressRecord } from '../types/curriculum';

export const PathSuggestion = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pathId = searchParams.get('path');
  const suggestedLevel = searchParams.get('level') as ExperienceLevel;
  
  const careerPath = CAREER_PATHS.find(p => p.id === pathId);
  const pathTopics = careerPath ? curriculum.filter(t => careerPath.topics.includes(t.id)) : [];

  const handleAccept = async () => {
    try {
      await apiRequest('/api/onboarding/complete', {
        method: 'POST',
        body: {
          careerPath: pathId,
          experienceLevel: suggestedLevel
        }
      });
      // Trigger sidebar update
      window.dispatchEvent(new CustomEvent<ProgressRecord>('progress-updated', { 
        detail: { 
          careerPath: pathId || undefined, 
          experienceLevel: suggestedLevel || undefined,
          onboardingCompleted: true
        } 
      }));
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  if (!careerPath) return <div>Invalid path.</div>;

  return (
    <div className="suggestion-screen" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-void)',
      padding: '2rem',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '0.5rem 1rem', 
            background: 'rgba(var(--accent-rgb), 0.1)', 
            color: 'var(--accent)', 
            borderRadius: '99px', 
            fontSize: '0.85rem', 
            fontWeight: 700,
            marginBottom: '1rem',
            border: '1px solid rgba(var(--accent-rgb), 0.2)'
          }}>
            PATH SUGGESTION
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            We've mapped your journey.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Based on your profile, we recommend starting as an <strong>{suggestedLevel}</strong> in the <strong>{careerPath.title}</strong> path.
          </p>
        </div>

        {/* Visual Roadmap */}
        <div className="roadmap-container" style={{ position: 'relative', paddingLeft: '2rem' }}>
          <div style={{ 
            position: 'absolute', 
            left: 'calc(2rem + 6px)', 
            top: 0, 
            bottom: 0, 
            width: '2px', 
            background: 'linear-gradient(to bottom, var(--accent), var(--border))' 
          }} />

          {pathTopics.map((topic, i) => (
            <div key={topic.id} style={{ 
              display: 'flex', 
              gap: '1.5rem', 
              marginBottom: '2rem', 
              position: 'relative' 
            }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                background: i === 0 ? 'var(--accent)' : 'var(--bg-void)', 
                border: i === 0 ? '2px solid var(--accent)' : '2px solid var(--border)',
                zIndex: 2,
                marginTop: '6px',
                flexShrink: 0
              }} />
              
              <div style={{
                flex: 1,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: 'var(--bg-raised)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <topic.icon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {topic.title}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', marginTop: '2px' }}>
                    {topic.level} • Milestone {i + 1}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            position: 'relative',
            opacity: 0.5
          }}>
            <div style={{ 
              width: '14px', 
              height: '14px', 
              borderRadius: '50%', 
              background: 'var(--success)', 
              border: '2px solid var(--success)',
              zIndex: 2,
              marginTop: '6px',
              flexShrink: 0
            }} />
            <div style={{ flex: 1, padding: '1rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>Goal Reached: {suggestedLevel} {careerPath.title} Ready</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ 
          marginTop: '5rem', 
          display: 'flex', 
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => navigate(`/customize?path=${pathId}&level=${suggestedLevel}`)}
            style={{
              padding: '1.1rem 2rem',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)'; }}
          >
            <Sliders size={18} /> Customize
          </button>
          
          <button 
            onClick={handleAccept}
            style={{
              padding: '1.1rem 3rem',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(var(--accent-rgb), 0.3)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Accept this path <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
