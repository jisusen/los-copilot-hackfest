import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../../lib/api';
import { getUser } from '../../lib/auth';

type Note = {
  id: number;
  app_id: string;
  author: string;
  author_type: string;
  content: string;
  category: string;
  memo_json: string | null;
  created_at: string;
};

const CATEGORIES = ['Observation', 'Recommendation', 'Override Justification', 'General'] as const;

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Observation':           { bg: '#e8f0fe', text: '#1a56db', border: '#bbd4fd' },
  'Recommendation':        { bg: '#e3f0e9', text: '#0d6e3f', border: '#a3d4b9' },
  'Override Justification':{ bg: '#fff1d8', text: '#8a5a08', border: '#f5d594' },
  'General':               { bg: '#f0f0f0', text: '#5a5a5a', border: '#d0d0d0' },
};

const MEMO_SECTIONS: [string, string, string][] = [
  ['section1_profil',      'I. Debtor Profile',         ''],
  ['section2_permohonan',  'II. Loan Application',      ''],
  ['section3_keuangan',    'III. Financial Analysis',   ''],
  ['section4_slik',        'IV. SLIK OJK',              ''],
  ['section5_aml',         'V. AML & Fraud',            ''],
  ['section6_agunan',      'VI. Collateral',            ''],
  ['section7_crde',        'VII. CRDE Decision',        ''],
];

function formatNoteDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

  const cs = CATEGORY_STYLES[note.category] ?? CATEGORY_STYLES['General'];

  return (
    <div className="border rounded-lg px-5 py-4 mb-4" style={{
      background: isAgent ? '#f9fafb' : '#ffffff',
      borderColor: isAgent ? '#d1d9e0' : '#e5e7eb',
      borderLeft: `3px solid ${isAgent ? '#1a3a5c' : cs.border}`,
    }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {isAgent ? (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#9b1c2c', color: '#fff', letterSpacing: '0.04em' }}>
              Copilot Analyst
            </span>
          ) : (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: cs.bg, color: cs.text }}>
              {note.category}
            </span>
          )}
          {!isAgent && (
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: '#e8e8e8', color: '#4a4a4a', letterSpacing: '0.02em' }}>
              {note.author}
            </span>
          )}
          <span className="text-xs text-muted font-mono">{formatNoteDate(note.created_at)}</span>
        </div>
        {!isAgent && onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-xs text-muted hover:text-danger transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            title="Delete note"
          >
            Delete
          </button>
        )}
      </div>

      <div className="text-sm text-text leading-relaxed">
        <RichContent text={note.content} />
      </div>

      {/* Expandable full memo */}
      {isAgent && memoDraft && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs font-medium"
            style={{ color: '#1a3a5c', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
          >
            {expanded ? '▲ Hide printed memo' : '▼ Show printed memo'}
          </button>
          {expanded && (
            <div className="mt-3 border rounded-lg" style={{ background: '#fff', borderColor: '#c8c8c8' }}>
              {/* Letterhead */}
              <div className="text-center px-6 pt-6 pb-4" style={{ borderBottom: '2px solid #1a3a5c' }}>
                <div className="text-xs uppercase tracking-[0.15em] text-muted mb-1">Bank Maju Bersama — JOKI AI</div>
                <div className="text-sm font-bold uppercase tracking-[0.08em]" style={{ color: '#1a3a5c' }}>Credit Analysis Memorandum</div>
              </div>

              {/* Memo header metadata */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 px-6 py-4 text-xs font-mono" style={{ borderBottom: '1px solid #d0d0d0', background: '#fafafa' }}>
                <div><span className="text-muted">Memo No:</span> <span className="font-semibold">CAM-{note.app_id}-{String(note.id).padStart(3, '0')}</span></div>
                <div className="text-right"><span className="text-muted">Date:</span> {formatNoteDate(note.created_at)}</div>
                <div><span className="text-muted">Classification:</span> <span className="font-bold" style={{ color: '#9b1c2c' }}>CONFIDENTIAL</span></div>
                <div className="text-right"><span className="text-muted">Prepared by:</span> Copilot Analyst v3.1</div>
              </div>

              {/* Subject line */}
              <div className="px-6 py-3 text-sm" style={{ borderBottom: '1px solid #d0d0d0' }}>
                <span className="text-muted font-medium">Subject:</span>{' '}
                <span className="font-semibold">Credit Analysis & Recommendation — {note.app_id}</span>
              </div>

              {/* Analysis sections */}
              <div className="px-6 py-5 space-y-5">
                {MEMO_SECTIONS.map(([key, label]) => {
                  const text = memoDraft![key];
                  if (!text) return null;
                  return (
                    <div key={key}>
                      <div className="font-semibold text-xs uppercase tracking-wide mb-1.5" style={{ color: '#1a3a5c' }}>{label}</div>
                      <div className="text-xs leading-relaxed" style={{ color: '#1f2d3d', paddingLeft: 12, borderLeft: '2px solid #d1d9e0' }}>
                        <RichContent text={text} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Recommendation footer */}
              {memoDraft.section8_rekomendasi && (
                <div className="mx-6 mb-5 p-4 rounded-lg border" style={{ background: '#f0f7ff', borderColor: '#bbd4fd' }}>
                  <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: '#1a56db' }}>Recommendation Summary</div>
                  <div className="text-xs leading-relaxed" style={{ color: '#1f2d3d' }}>
                    <RichContent text={memoDraft.section8_rekomendasi} />
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-6 py-3 text-[9px] text-muted uppercase tracking-[0.1em] text-center" style={{ borderTop: '1px solid #d0d0d0', background: '#fafafa' }}>
                This document is generated by Copilot Analyst — Bank Maju Bersama Internal Use Only
              </div>
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
  const [category, setCategory] = useState<string>('General');
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
        body: JSON.stringify({ content: text.trim(), category, author: user?.username ?? 'analyst01' }),
      });
      setText('');
      setCategory('General');
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

  const agentNotes = notes.filter(n => n.author_type === 'agent');
  const manualNotes = notes.filter(n => n.author_type !== 'agent');

  return (
    <div data-testid="tab-content-notes">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display font-semibold text-text text-sm uppercase tracking-wide text-muted">Notes & Memo</h3>
        <div className="text-xs text-muted font-mono">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
          {agentNotes.length > 0 && ` (${agentNotes.length} Copilot)`}
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="text-sm text-muted py-8 text-center">Loading notes...</div>
      ) : notes.length === 0 ? (
        <div className="text-sm text-muted py-8 text-center italic border border-dashed border-border rounded-lg mb-6">
          No notes yet. Copilot Analyst review will appear after agent processes the loan. Add manual notes below.
        </div>
      ) : (
        <div>
          {/* Copilot Analyst section */}
          {agentNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}

          {/* Manual notes section */}
          {manualNotes.length > 0 && (
            <>
              {agentNotes.length > 0 && (
                <div className="flex items-center gap-2 my-4">
                  <div className="flex-1 h-px" style={{ background: '#d1d9e0' }} />
                  <span className="text-xs text-muted font-medium uppercase tracking-wide">Manual Notes</span>
                  <div className="flex-1 h-px" style={{ background: '#d1d9e0' }} />
                </div>
              )}
              {manualNotes.map(note => (
                <NoteCard key={note.id} note={note} onDelete={deleteNote} />
              ))}
            </>
          )}
        </div>
      )}

      <div ref={bottomRef} />

      {/* Add note */}
      <div className="mt-8">
        <div className="h-px mb-5" style={{ background: '#d1d9e0' }} />

        <div className="flex items-center gap-4 mb-3">
          <span className="font-display font-semibold text-text text-sm uppercase tracking-wide text-muted">Add Note</span>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            data-testid="notes-category-select"
            className="text-xs font-medium px-3 py-1.5 rounded border rounded"
            style={{ borderColor: '#d1d9e0', background: '#fff', color: '#1f2d3d', outline: 'none', fontFamily: 'inherit' }}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <textarea
          data-testid="notes-input"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write your analysis notes, observations, or override justification..."
          rows={4}
          className="w-full rounded-lg border px-4 py-3 text-sm resize-vertical outline-none"
          style={{ borderColor: '#d1d9e0', color: '#1f2d3d', fontFamily: 'inherit', lineHeight: 1.6 }}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted">Ctrl+Enter to save</span>
          <button
            data-testid="notes-save-btn"
            onClick={saveNote}
            disabled={!text.trim() || saving}
            className="text-sm font-medium px-4 py-2 rounded border transition-colors"
            style={{
              background: !text.trim() || saving ? '#f0f0f0' : '#1a3a5c',
              color: !text.trim() || saving ? '#999' : '#fff',
              borderColor: !text.trim() || saving ? '#d0d0d0' : '#1a3a5c',
              cursor: !text.trim() || saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}