import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import { getUser } from '../../lib/auth';

type Note = {
  id: number;
  app_id: string;
  author: string;
  author_type: string;
  content: string;
  memo_json: string | null;
  created_at: string;
};

function formatNoteDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function RichContent({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
          {renderInline(line)}
          {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

function NoteCard({ note }: { note: Note }) {
  const [expanded, setExpanded] = useState(false);
  const isAgent = note.author_type === 'agent';

  let memoDraft: Record<string, string> | null = null;
  if (isAgent && note.memo_json) {
    try { memoDraft = JSON.parse(note.memo_json); } catch { /* ignore */ }
  }

  const borderColor = isAgent ? '#1f3b5c' : '#d8d8d8';
  const bg = isAgent ? '#f0f3f8' : '#ffffff';

  return (
    <div style={{ borderLeft: `3px solid ${borderColor}`, background: bg, border: `1px solid ${isAgent ? '#c4d0e0' : '#d8d8d8'}`, borderLeft: `3px solid ${borderColor}`, padding: '14px 16px', marginBottom: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {isAgent ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', background: '#1f3b5c', color: '#fff', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: '"IBM Plex Mono", monospace' }}>
            AI Analysis
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', border: '1px solid #d8d8d8', fontSize: 10, fontWeight: 500, color: '#4a4a4a', letterSpacing: '0.02em' }}>
            Manual · {note.author}
          </span>
        )}
        <span style={{ fontSize: 11, color: '#8a8a8a', fontFamily: '"IBM Plex Mono", monospace' }}>
          {formatNoteDate(note.created_at)}
        </span>
      </div>

      {/* Content */}
      <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6 }}>
        <RichContent text={note.content} />
      </div>

      {/* Expandable full memo for agent notes */}
      {isAgent && memoDraft && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ fontSize: 11, color: '#1f3b5c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', textDecoration: 'underline' }}
          >
            {expanded ? '▲ Hide full memo' : '▼ Show full AI memo'}
          </button>
          {expanded && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {([
                ['section1_profil',     'Profil Debitur'],
                ['section2_permohonan', 'Permohonan Kredit'],
                ['section3_keuangan',   'Keuangan'],
                ['section4_slik',       'SLIK OJK'],
                ['section5_aml',        'AML & Fraud'],
                ['section6_agunan',     'Agunan'],
                ['section7_crde',       'Keputusan CRDE'],
                ['section8_rekomendasi','Catatan & Rekomendasi'],
              ] as [string, string][]).map(([key, label]) => {
                const text = memoDraft![key];
                if (!text) return null;
                return (
                  <div key={key}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a8a', fontWeight: 600, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: '#4a4a4a', lineHeight: 1.6, paddingLeft: 8, borderLeft: '2px solid #e0e6f0' }}><RichContent text={text} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NotesTab({ loanId }: { loanId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const user = getUser();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchNotes() {
    try {
      const data = await apiFetch<{ notes: Note[] }>(`/api/loans/${loanId}/notes`);
      setNotes(data.notes);
    } catch { /* ignore */ } finally { setLoading(false); }
  }

  useEffect(() => { fetchNotes(); }, [loanId]);

  async function saveNote() {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/loans/${loanId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ content: text.trim(), author: user?.username ?? 'analyst01' }),
      });
      setText('');
      await fetchNotes();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveNote(); }
  }

  return (
    <div data-testid="tab-content-notes" style={{ paddingTop: 16 }}>
      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a8a', fontWeight: 600 }}>
          Notes & Memo
        </div>
        {notes.some(n => n.author_type === 'agent') && (
          <span style={{ fontSize: 10, color: '#1f3b5c', fontFamily: '"IBM Plex Mono", monospace' }}>
            ● AI analysis available
          </span>
        )}
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ fontSize: 12, color: '#8a8a8a', padding: '20px 0' }}>Loading notes…</div>
      ) : notes.length === 0 ? (
        <div style={{ fontSize: 12, color: '#8a8a8a', padding: '20px 0', fontStyle: 'italic' }}>
          No notes yet. AI analysis will appear here after agent review. You can also add manual notes below.
        </div>
      ) : (
        <div>
          {notes.map(note => <NoteCard key={note.id} note={note} />)}
        </div>
      )}

      <div ref={bottomRef} />

      {/* Divider */}
      <div style={{ height: 1, background: '#d8d8d8', margin: '20px 0' }} />

      {/* Add note */}
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a8a8a', fontWeight: 600, marginBottom: 8 }}>
        Add Note
      </div>
      <textarea
        data-testid="notes-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write your analysis notes, observations, or override justification…"
        rows={4}
        style={{
          width: '100%',
          border: '1px solid #1a1a1a',
          padding: '10px 12px',
          fontSize: 13,
          color: '#1a1a1a',
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'Inter, system-ui, sans-serif',
          boxSizing: 'border-box',
          lineHeight: 1.5,
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <span style={{ fontSize: 11, color: '#8a8a8a' }}>Ctrl+Enter to save</span>
        <button
          data-testid="notes-save-btn"
          onClick={saveNote}
          disabled={!text.trim() || saving}
          style={{
            height: 32,
            padding: '0 16px',
            background: !text.trim() || saving ? '#ececea' : '#1f3b5c',
            color: !text.trim() || saving ? '#8a8a8a' : '#fff',
            border: 'none',
            fontSize: 12,
            fontWeight: 500,
            cursor: !text.trim() || saving ? 'not-allowed' : 'pointer',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
