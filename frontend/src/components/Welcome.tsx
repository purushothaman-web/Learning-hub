import { useNavigate } from 'react-router-dom';
import { CAREER_PATHS } from '../data/paths';
import { ChevronRight, Sparkles } from 'lucide-react';

export const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen" style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--bg-void)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: 'clamp(2rem, 8vw, 3.5rem)', 
          fontWeight: 800, 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, var(--text-primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em',
          lineHeight: 1.1
        }}>
          What do you want to become?
        </h1>
        <p style={{ 
          color: 'var(--text-muted)', 
          fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
          marginBottom: 'clamp(2rem, 5vh, 4rem)',
          maxWidth: '600px',
          marginInline: 'auto'
        }}>
          Choose your path and start your journey to mastery.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', 
          gap: '1.5rem',
          width: '100%'
        }}>
          {CAREER_PATHS.map(path => (
            <div 
              key={path.id}
              className="career-card"
              onClick={() => navigate(`/onboarding?path=${path.id}`)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: 'clamp(1.5rem, 4vw, 2.5rem)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -12px rgba(245, 158, 11, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px', 
                width: '80px', 
                height: '80px', 
                background: 'var(--accent)', 
                opacity: 0.05, 
                borderRadius: '50%' 
              }} />
              
              <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                {path.title}
              </h3>
              <p style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2rem', flex: 1 }}>
                {path.description}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>
                Explore Path <ChevronRight size={14} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-faint)', fontSize: '0.9rem' }}>
          <Sparkles size={16} />
          <span>No login required. Just pick and explore.</span>
        </div>
      </div>
    </div>
  );
};
