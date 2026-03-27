import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Sparkles, ChevronDown, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { apiRequest } from '../lib/api';
import { curriculum } from '../data/curriculum';

type ChatMessage = { role: 'bot' | 'user'; content: string; error?: boolean };

const CHAT_STORAGE_KEY = 'lhs_chat_history';
const MAX_STORED = 40;

export const ChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Restore chat history from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as ChatMessage[];
    } catch {}
    return [{ role: 'bot', content: 'Hi! I\'m your AI tutor powered by Gemini. Ask me anything about the curriculum — concepts, code, best practices.' }];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Derive topic context from URL
  const topicContext = (() => {
    const match = location.pathname.match(/\/topic\/([^/]+)/);
    if (!match) return 'Learning Hub Studio';
    const topicId = match[1];
    const topic = curriculum.find(t => t.id === topicId);
    const params = new URLSearchParams(location.search);
    const lessonId = params.get('lesson');
    return topic ? `${topic.title}${lessonId ? ` – lesson: ${lessonId}` : ''}` : 'Learning Hub Studio';
  })();

  // Persist messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {}
  }, [messages]);

  const clearHistory = () => {
    const fresh = [{ role: 'bot' as const, content: 'Hi! I\'m your AI tutor powered by Gemini. Ask me anything about the curriculum — concepts, code, best practices.' }];
    setMessages(fresh);
    localStorage.removeItem(CHAT_STORAGE_KEY);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    try {
      const data = await apiRequest<{ reply?: string; error?: string }>('/api/chat', {
        method: 'POST', body: { prompt: text, context: topicContext }
      });
      setMessages(prev => [...prev, { role: 'bot', content: data.reply || 'No response.' }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error.';
      setMessages(prev => [...prev, { role: 'bot', error: true, content: msg }]);
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const parse = (text: string) => ({ __html: DOMPurify.sanitize(marked.parse(text) as string) });

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="scale-in"
          style={{
            width: 360,
            height: 520,
            display: 'flex', flexDirection: 'column',
            marginBottom: '0.75rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '0.875rem 1rem',
            background: 'var(--bg-raised)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--accent-dim)',
                border: '1px solid var(--border-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Bot size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Gemini Tutor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', color: 'var(--success)' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                  {topicContext !== 'Learning Hub Studio' ? topicContext : 'Online'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                onClick={clearHistory}
                title="Clear chat history"
                style={{ color: 'var(--text-faint)', padding: '0.25rem', borderRadius: 6, transition: 'all 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; }}
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--text-faint)', padding: '0.25rem', borderRadius: 6, transition: 'all 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-overlay)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-faint)'; }}
              >
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            background: 'var(--bg-void)',
          }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === 'bot' ? 'slide-in' : 'fade-up'}
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                {m.role === 'bot' ? (
                  <div className="bubble-bot" style={{ color: m.error ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {m.error
                      ? <span style={{ fontSize: '0.875rem' }}>{m.content}</span>
                      : <div className="markdown-body" dangerouslySetInnerHTML={parse(m.content)} />
                    }
                  </div>
                ) : (
                  <div className="bubble-user">
                    <span style={{ fontSize: '0.875rem' }}>{m.content}</span>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="bubble-bot slide-in">
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '0.1rem 0' }}>
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem',
            background: 'var(--bg-raised)',
            borderTop: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Enter to send)"
                rows={1}
                style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '0.6rem 0.875rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'Sora, sans-serif',
                  lineHeight: 1.5,
                  maxHeight: 100,
                  overflow: 'auto',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--bg-overlay)',
                  color: input.trim() && !isLoading ? '#000' : 'var(--text-faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                }}
              >
                <Send size={14} />
              </button>
            </form>
            <div style={{ fontSize: '0.62rem', color: 'var(--text-faint)', marginTop: '0.4rem', textAlign: 'center' }}>
              Shift+Enter for new line
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 48, height: 48,
          borderRadius: 14,
          background: isOpen ? 'var(--bg-raised)' : 'var(--accent)',
          color: isOpen ? 'var(--text-muted)' : '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isOpen ? '0 4px 16px rgba(0,0,0,0.3)' : `0 4px 20px var(--accent-glow)`,
          transition: 'all 0.2s cubic-bezier(.16,1,.3,1)',
          border: isOpen ? '1px solid var(--border)' : 'none',
        }}
        onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
      >
        {isOpen ? <X size={18} /> : <Sparkles size={18} />}
      </button>
    </div>
  );
};
