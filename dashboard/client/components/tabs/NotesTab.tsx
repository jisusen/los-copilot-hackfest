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

const MEMO_SECTIONS: [string, string][] = [
  ['section1_profil',      'Profil Debitur'],
  ['section2_permohonan',  'Permohonan Kredit'],
  ['section3_keuangan',    'Keuangan'],
  ['section4_slik',        'SLIK OJK'],
  ['section5_aml',         'AML & Fraud'],
  ['section6_agunan',      'Agunan'],
  ['section7_crde',        'Keputusan CRDE'],
  ['section8_rekomendasi', 'Catatan & Rekomendasi'],
];

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

function NoteCard({ note, onDelete }: { note: Note; onDelete?: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isAgent = note.author_type === 'agent';

  let memoDraft: Record<string, string> | null = null;
  if (isAgent && note.memo_json) {
    try { memoDraft = JSON.parse(note.memo_json); } catch { /* ignore */ }
  }

  return (
    <div className="rounded-lg mb-3" style={{
      background: isAgent ? '#f8fafc' : '#ffffff',
      border: `1px solid ${isAgent ? '#c4d0e0' : '#e2e8f0'}`,
      borderLeft: `3px solid ${isAgent ? '#1f3b5c' : '#d1d9e0'}`,
      overflow: 'hidden',
    }}>
      <div className="px-4 py-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isAgent ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#1f3b5c', color: '#fff', letterSpacing: '0.04em' }}>
                AI Analysis
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded border" style={{ borderColor: '#d1d9e0', color: '#64748b' }}>
                Manual · {note.author}
              </span>
            )}
            <span className="text-[11px]" style={{ color: '#94a3b8', fontFamily: '"IBM Plex Mono", monospace' }}>
              {formatNoteDate(note.created_at)}
            </span>
          </div>
          {!isAgent && onDelete && (
            <button
              onClick={() => onDelete(note.id)}
              className="text-[11px] hover:text-red-500 transition-colors"
              style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Hapus
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-[13px] leading-relaxed" style={{ color: '#1e293b' }}>
          <RichContent text={note.content} />
        </div>
      </div>

      {/* Expandable full memo for agent notes */}
      {isAgent && memoDraft && (
        <div style={{ borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full text-left px-4 py-2 text-[11px] font-medium flex items-center justify-between"
            style={{ color: '#1f3b5c', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
          >
            <span>{expanded ? 'Sembunyikan memo lengkap' : 'Tampilkan memo lengkap'}</span>
            <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
          </button>
          {expanded && (
            <div className="px-4 py-4 space-y-4" style={{ background: '#fafbfc' }}>
              {MEMO_SECTIONS.map(([key, label]) => {
                const text = memoDraft![key];
                if (!text) return null;
                return (
                  <div key={key}>
                    <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>
                      {label}
                    </div>
                    <div className="text-[12px] leading-relaxed pl-3" style={{ color: '#475569', borderLeft: '2px solid #cbd5e1' }}>
                      <RichContent text={text} />
                    </div>
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

  async function deleteNote(id: number) {
    try {
      await apiFetch(`/api/loans/${loanId}/notes/${id}`, { method: 'DELETE' });
      await fetchNotes();
    } catch { /* ignore */ }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); saveNote(); }
  }

  const hasAgentNote = notes.some(n => n.author_type === 'agent');

  return (
    <div data-testid="tab-content-notes" className="pt-4">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>Notes & Memo</h3>
        {hasAgentNote && (
          <span className="text-[10px] font-medium" style={{ color: '#1f3b5c', fontFamily: '"IBM Plex Mono", monospace' }}>
            ● AI analysis available
          </span>
        )}
      </div>

      {/* Notes list */}
      {loading ? (
        <div className="text-xs py-6 text-center" style={{ color: '#94a3b8' }}>Loading notes…</div>
      ) : notes.length === 0 ? (
        <div className="text-xs py-6 text-center italic border border-dashed rounded-lg" style={{ color: '#94a3b8', borderColor: '#e2e8f0' }}>
          No notes yet. AI analysis will appear here after agent review. You can also add manual notes below.
        </div>
      ) : (
        <div>
          {notes.map(note => (
            <NoteCard key={note.id} note={note} onDelete={note.author_type !== 'agent' ? deleteNote : undefined} />
          ))}
        </div>
      )}

      <div ref={bottomRef} />

      {/* Divider */}
      <div className="h-px my-5" style={{ background: '#e2e8f0' }} />

      {/* Add note */}
      <div className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#94a3b8' }}>
        Add Note
      </div>
      <textarea
        data-testid="notes-input"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Write your analysis notes, observations, or override justification…"
        rows={4}
        className="w-full rounded-lg border px-3 py-2.5 text-[13px] resize-vertical outline-none focus:border-slate-400 transition-colors"
        style={{ borderColor: '#d1d9e0', color: '#0f172a', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box' }}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px]" style={{ color: '#94a3b8' }}>Ctrl+Enter to save</span>
        <button
          data-testid="notes-save-btn"
          onClick={saveNote}
          disabled={!text.trim() || saving}
          className="h-8 px-4 text-[12px] font-medium rounded transition-colors"
          style={{
            background: !text.trim() || saving ? '#f1f5f9' : '#1f3b5c',
            color: !text.trim() || saving ? '#94a3b8' : '#fff',
            border: 'none',
            cursor: !text.trim() || saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save Note'}
        </button>
      </div>
    </div>
  );
}
