import { useNavigate } from 'react-router-dom';
import { CAREER_PATHS } from '../data/paths';
import { ChevronRight, Sparkles } from 'lucide-react';

export const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-screen" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-void)',
      padding: '2rem',
      overflowY: 'auto'
    }}>
      <div style={{ maxWidth: '900px', width: '100%', textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          marginBottom: '1rem',
          background: 'linear-gradient(to right, var(--text-primary), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          What do you want to become?
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '3rem' }}>
          Choose your path and start your journey to mastery.
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
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
                padding: '2rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -12px rgba(0,0,0,0.5)';
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
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                {path.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
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
