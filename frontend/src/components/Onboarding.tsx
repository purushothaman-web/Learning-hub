import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CAREER_PATHS, getSuggestedLevel } from '../data/paths';
import { ChevronLeft, Check } from 'lucide-react';

const QUESTIONS = [
  {
    id: 'code',
    text: 'Have you written code before?',
    options: [
      { id: 'Yes', label: 'Yes' },
      { id: 'ALittle', label: 'A little' },
      { id: 'Never', label: 'Never' }
    ]
  },
  {
    id: 'built',
    text: 'Have you built and shipped something?',
    options: [
      { id: 'Yes', label: 'Yes' },
      { id: 'No', label: 'No' }
    ]
  },
  {
    id: 'tech',
    text: 'Are you currently working in tech?',
    options: [
      { id: 'Yes', label: 'Yes' },
      { id: 'No', label: 'No' }
    ]
  }
];

export const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pathId = searchParams.get('path');
  const careerPath = CAREER_PATHS.find(p => p.id === pathId);

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: optionId };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      // Last question answered, calculate and redirect
      const level = getSuggestedLevel(newAnswers as { code: string; built: string; tech: string });
      setTimeout(() => {
        navigate(`/suggestion?path=${pathId}&level=${level}`);
      }, 500);
    }
  };

  if (!careerPath) return <div>Invalid path selected.</div>;

  return (
    <div className="onboarding-flow" style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'var(--bg-void)',
      padding: '4rem 2rem'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '4rem' }}>
          {QUESTIONS.map((_, i) => (
            <div key={i} style={{ 
              flex: 1, 
              height: '4px', 
              background: i <= currentStep ? 'var(--accent)' : 'var(--bg-raised)',
              borderRadius: '2px',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        <button 
          onClick={() => currentStep > 0 ? setCurrentStep(prev => prev - 1) : navigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-faint)', 
            marginBottom: '2rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.25rem)', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {QUESTIONS[currentStep].text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {QUESTIONS[currentStep].options.map(option => {
            const isSelected = answers[QUESTIONS[currentStep].id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                style={{
                  padding: 'clamp(1rem, 3vw, 1.25rem) clamp(1.25rem, 4vw, 1.5rem)',
                  background: isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-surface)',
                  border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
                  fontWeight: 600,
                  color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s'
                }}
              >
                {option.label}
                {isSelected && <Check size={18} />}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>
          Step {currentStep + 1} of {QUESTIONS.length}
        </div>
      </div>
    </div>
  );
};
