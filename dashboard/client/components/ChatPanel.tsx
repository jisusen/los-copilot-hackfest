import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const SUGGESTED = [
  'Why did CRDE recommend this decision?',
  'What is the applicant\'s DBR and how does it compare to the RAC limit?',
  'What are the applicant\'s existing credit obligations?',
  'Are there any AML flags or fraud indicators?',
  'How is the applicant\'s payment history in SLIK OJK?',
];

export function ChatPanel({ appId, debtorName }: { appId: string; debtorName: string }) {
  const { messages, streaming, streamingText, sendMessage } = useChat(appId);
  const [input, setInput] = useState('');
  const [showSuggested, setShowSuggested] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  function submit() {
    if (!input.trim()) return;
    setShowSuggested(false);
    sendMessage(input);
    setInput('');
  }

  function submitSuggested(q: string) {
    setShowSuggested(false);
    sendMessage(q);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div
      data-testid="chat-panel"
      style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        borderLeft: '1px solid #2a3a52', background: '#192033',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a3a52' }}>
        <div className="font-display text-base font-bold uppercase text-text tracking-wide">COPILOT CHAT</div>
        <div className="font-mono text-xs text-muted mt-0.5">{appId} · {debtorName}</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {messages.length === 0 && showSuggested && (
          <div>
            <div className="font-mono text-xs text-muted mb-3">Suggested questions:</div>
            <div className="space-y-2">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  data-testid={`suggested-question-${i}`}
                  onClick={() => submitSuggested(q)}
                  className="w-full text-left font-mono text-xs"
                  style={{
                    padding: '8px 12px', border: '1px solid #2a3a52',
                    background: 'transparent', color: '#8892a4',
                    cursor: 'pointer', display: 'block',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#e8ff47')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a3a52')}
                >
                  › {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} data-testid={`chat-message-${i}`} style={{ marginBottom: 16 }}>
            <div className="font-display text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: msg.role === 'user' ? '#e8ff47' : '#60a5fa' }}>
              {msg.role === 'user' ? 'ANALYST' : 'COPILOT'}
            </div>
            <div className="font-mono text-sm text-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {msg.content}
            </div>
          </div>
        ))}

        {streaming && streamingText && (
          <div style={{ marginBottom: 16 }}>
            <div className="font-display text-xs font-bold uppercase tracking-wide mb-1 text-blue">COPILOT</div>
            <div className="font-mono text-sm text-text" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {streamingText}<span className="blink">▌</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: 16, borderTop: '1px solid #2a3a52' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            data-testid="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about this application..."
            disabled={streaming}
            rows={2}
            className="font-mono text-sm text-text flex-1"
            style={{
              background: '#1e2840', border: '1px solid #2a3a52',
              padding: '8px 12px', resize: 'none', outline: 'none',
              color: '#f0f0f0',
            }}
          />
          <button
            data-testid="chat-submit"
            onClick={submit}
            disabled={streaming || !input.trim()}
            className="font-ui font-semibold text-sm uppercase"
            style={{
              padding: '0 16px',
              background: streaming || !input.trim() ? '#2a3a52' : '#e8ff47',
              color: streaming || !input.trim() ? '#8892a4' : '#0f1623',
              border: 'none', cursor: streaming || !input.trim() ? 'default' : 'pointer',
              alignSelf: 'stretch',
            }}
          >
            SEND
          </button>
        </div>
        <div className="font-mono text-xs text-muted mt-1">Enter = send · Shift+Enter = new line</div>
      </div>
    </div>
  );
}

