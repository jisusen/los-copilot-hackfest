import React, { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../lib/api";
import { getUser } from "../../lib/auth";

type Note = {
  id: number;
  app_id: string;
  author: string;
  author_type: string;
  content: string;
  category?: string;
  memo_json: string | null;
  created_at: string;
};

type MemoDraft = {
  executive_summary?: string;
  section1_profil?: string;
  section2_permohonan?: string;
  section3_keuangan?: string;
  section4_slik?: string;
  section5_aml?: string;
  section6_agunan?: string;
  section7_crde?: string;
  section8_rekomendasi?: string;
};

const CATEGORIES = [
  "Observation",
  "Recommendation",
  "Override Justification",
  "General",
] as const;

const CATEGORY_STYLES: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  Observation: { bg: "#e8f0fe", text: "#1a56db", border: "#bbd4fd" },
  Recommendation: { bg: "#e3f0e9", text: "#0d6e3f", border: "#a3d4b9" },
  "Override Justification": {
    bg: "#fff1d8",
    text: "#8a5a08",
    border: "#f5d594",
  },
  General: { bg: "#f0f0f0", text: "#5a5a5a", border: "#d0d0d0" },
};

const MEMO_BODY_SECTIONS: [keyof MemoDraft, string][] = [
  ["section1_profil", "I. Debtor Profile"],
  ["section2_permohonan", "II. Loan Application"],
  ["section3_keuangan", "III. Financial Analysis"],
  ["section4_slik", "IV. SLIK OJK"],
  ["section5_aml", "V. AML & Fraud"],
  ["section6_agunan", "VI. Collateral"],
  ["section7_crde", "VII. CRDE Decision"],
];

function formatNoteDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function parseMemoDraft(raw: string | null): MemoDraft | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as MemoDraft;
  } catch {
    return null;
  }
}

/** Card preview: executive summary when available — not the raw DB content blob. */
function agentPreviewText(memo: MemoDraft | null, content: string): string {
  if (memo?.executive_summary?.trim()) return memo.executive_summary.trim();
  return content.trim();
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

const CONCERN_LABEL_RE =
  /(Key concerns|Kekhawatiran utama|Key deal-breakers|Faktor penentu|committee review due to|review komite karena):\s*/i;

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "bullets"; label: string; items: string[] };

function splitSemicolonItems(raw: string): string[] {
  return raw
    .replace(/\.\s*$/, "")
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseContentBlocks(text: string): ContentBlock[] {
  if (!text?.trim()) return [];

  const blocks: ContentBlock[] = [];
  const lines = text.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    const bulletMatch = trimmed.match(/^[•\-\*]\s+(.+)$/);
    if (bulletMatch) {
      const items: string[] = [bulletMatch[1]];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        const m = next.match(/^[•\-\*]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      blocks.push({ type: "bullets", label: "", items });
      continue;
    }

    const labelOnly = trimmed.match(
      /^(Key concerns|Kekhawatiran utama|Key deal-breakers|Faktor penentu|committee review due to|review komite karena):$/i,
    );
    if (labelOnly) {
      const label = labelOnly[1];
      const items: string[] = [];
      i++;
      while (i < lines.length) {
        const next = lines[i].trim();
        const m = next.match(/^[•\-\*]\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      if (items.length > 0) blocks.push({ type: "bullets", label, items });
      continue;
    }

    const inline = trimmed.match(CONCERN_LABEL_RE);
    if (inline) {
      const label = inline[1];
      const rest = trimmed.slice(inline.index! + inline[0].length);
      const endMatch = rest.match(
        /^(.+?)(\.\s+(?:CRDE|Rekomendasi|Recommended|Risk profile|Aplikasi|The analyst|Analis|While some|Suggest).*)$/i,
      );
      if (endMatch) {
        const before = trimmed.slice(0, inline.index!).trim();
        if (before) blocks.push({ type: "text", text: before });
        const items = splitSemicolonItems(endMatch[1]);
        if (items.length > 0) blocks.push({ type: "bullets", label, items });
        blocks.push({ type: "text", text: endMatch[2].trim() });
        i++;
        continue;
      }
      const items = splitSemicolonItems(rest);
      if (items.length > 0) {
        const before = trimmed.slice(0, inline.index!).trim();
        if (before) blocks.push({ type: "text", text: before });
        blocks.push({ type: "bullets", label, items });
        i++;
        continue;
      }
    }

    const para: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().match(/^[•\-\*]\s/)
    ) {
      para.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "text", text: para.join("\n") });
  }

  return blocks;
}

function BulletList({
  label,
  items,
  testId,
}: {
  label: string;
  items: string[];
  testId?: string;
}) {
  return (
    <div data-testid={testId} className="my-2">
      {label && (
        <div
          className="text-xs font-semibold uppercase tracking-wide mb-1"
          style={{ color: "#64748b" }}
        >
          {label}
        </div>
      )}
      <ul
        className="list-disc pl-5 space-y-1 text-sm"
        style={{ color: "#334155" }}
      >
        {items.map((item, i) => (
          <li key={i} className="leading-relaxed">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function RichContent({ text }: { text: string }) {
  if (!text?.trim()) return <span style={{ color: "#94a3b8" }}>—</span>;

  const blocks = parseContentBlocks(text);
  if (blocks.length === 0) return <span style={{ color: "#94a3b8" }}>—</span>;

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        if (block.type === "bullets") {
          return (
            <BulletList
              key={i}
              label={block.label}
              items={block.items}
              testId={block.label ? "key-concerns-list" : undefined}
            />
          );
        }
        return (
          <div
            key={i}
            className="text-sm leading-relaxed"
            style={{ color: "#334155" }}
          >
            {block.text.split("\n").map((line, j, arr) => (
              <React.Fragment key={j}>
                {renderInline(line)}
                {j < arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function PrintedMemo({ note, memo }: { note: Note; memo: MemoDraft }) {
  const bodySections = MEMO_BODY_SECTIONS.filter(([key]) => memo[key]?.trim());
  const hasExec = !!memo.executive_summary?.trim();
  const hasRec = !!memo.section8_rekomendasi?.trim();

  return (
    <div
      className="mt-3 border rounded-lg"
      style={{ background: "#fff", borderColor: "#c8c8c8" }}
    >
      <div
        className="text-center px-6 pt-6 pb-4"
        style={{ borderBottom: "2px solid #8B1A1A" }}
      >
        <div className="text-xs uppercase tracking-[0.15em] text-muted mb-1">
          Bank CIMB Niaga
        </div>
        <div
          className="text-sm font-bold uppercase tracking-[0.08em]"
          style={{ color: "#8B1A1A" }}
        >
          Credit Analysis Memorandum
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-x-8 gap-y-1 px-6 py-4 text-xs font-mono"
        style={{ borderBottom: "1px solid #d0d0d0", background: "#fafafa" }}
      >
        <div>
          <span className="text-muted">Memo No:</span>{" "}
          <span className="font-semibold">
            CAM-{note.app_id}-{String(note.id).padStart(3, "0")}
          </span>
        </div>
        <div className="text-right">
          <span className="text-muted">Date:</span>{" "}
          {formatNoteDate(note.created_at)}
        </div>
        <div>
          <span className="text-muted">Classification:</span>{" "}
          <span className="font-bold" style={{ color: "#9b1c2c" }}>
            CONFIDENTIAL
          </span>
        </div>
        <div className="text-right">
          <span className="text-muted">Prepared by:</span> Copilot Analyst
        </div>
      </div>

      <div
        className="px-6 py-3 text-sm"
        style={{ borderBottom: "1px solid #d0d0d0" }}
      >
        <span className="text-muted font-medium">Subject:</span>{" "}
        <span className="font-semibold">
          Credit Analysis & Recommendation — {note.app_id}
        </span>
      </div>

      <div className="px-6 py-5 space-y-5">
        {hasExec && (
          <div data-testid="memo-executive-summary">
            <div
              className="font-semibold text-xs uppercase tracking-wide mb-1.5"
              style={{ color: "#8B1A1A" }}
            >
              Executive Summary
            </div>
            <div
              className="text-xs leading-relaxed"
              style={{
                color: "#1f2d3d",
                paddingLeft: 12,
                borderLeft: "2px solid #d1d9e0",
              }}
            >
              <RichContent text={memo.executive_summary!} />
            </div>
          </div>
        )}

        {bodySections.map(([key, label], idx) => (
          <div key={key} data-testid={`memo-section-${idx + 1}`}>
            <div
              className="font-semibold text-xs uppercase tracking-wide mb-1.5"
              style={{ color: "#8B1A1A" }}
            >
              {label}
            </div>
            <div
              className="text-xs leading-relaxed"
              style={{
                color: "#1f2d3d",
                paddingLeft: 12,
                borderLeft: "2px solid #d1d9e0",
              }}
            >
              <RichContent text={memo[key] as string} />
            </div>
          </div>
        ))}
      </div>

      {hasRec && (
        <div
          data-testid="memo-section-8"
          className="mx-6 mb-5 p-4 rounded-lg border"
          style={{ background: "#f0f7ff", borderColor: "#bbd4fd" }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wide mb-1"
            style={{ color: "#1a56db" }}
          >
            VIII. Recommendation
          </div>
          <div className="text-xs leading-relaxed" style={{ color: "#1f2d3d" }}>
            <RichContent text={memo.section8_rekomendasi!} />
          </div>
        </div>
      )}

      <div
        className="px-6 py-3 text-[9px] text-muted uppercase tracking-[0.1em] text-center"
        style={{ borderTop: "1px solid #d0d0d0", background: "#fafafa" }}
      >
        Bank CIMB Niaga — Consumer Credit Information System · Internal Use Only
      </div>
    </div>
  );
}

function AgentNoteCard({ note }: { note: Note }) {
  const [expanded, setExpanded] = useState(false);
  const memo = parseMemoDraft(note.memo_json);
  const preview = agentPreviewText(memo, note.content);
  const hasPrintedMemo =
    memo &&
    (MEMO_BODY_SECTIONS.some(([k]) => memo[k]?.trim()) ||
      memo.executive_summary?.trim() ||
      memo.section8_rekomendasi?.trim());

  return (
    <div
      data-testid="ai-memo-panel"
      className="border rounded-lg px-5 py-4 mb-4"
      style={{
        background: "#f9fafb",
        borderColor: "#d1d9e0",
        borderLeft: "3px solid #8B1A1A",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
            style={{
              background: "#9b1c2c",
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            Copilot Analyst
          </span>
          <span className="text-xs text-muted font-mono">
            {formatNoteDate(note.created_at)}
          </span>
        </div>
      </div>

      <div
        data-testid="value-memo-summary"
        className="text-sm text-text leading-relaxed"
      >
        <RichContent text={preview} />
      </div>

      {hasPrintedMemo && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-xs font-medium"
            style={{
              color: "#8B1A1A",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            {expanded ? "▲ Hide printed memo" : "▼ Show printed memo"}
          </button>
          {expanded && memo && <PrintedMemo note={note} memo={memo} />}
        </div>
      )}
    </div>
  );
}

function ManualNoteCard({
  note,
  onDelete,
}: {
  note: Note;
  onDelete: (id: number) => void;
}) {
  const cat = note.category ?? "General";
  const cs = CATEGORY_STYLES[cat] ?? CATEGORY_STYLES["General"];

  return (
    <div
      data-testid={`note-card-${note.id}`}
      className="border rounded-lg px-5 py-4 mb-4"
      style={{
        background: "#ffffff",
        borderColor: "#e5e7eb",
        borderLeft: `3px solid ${cs.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: cs.bg, color: cs.text }}
          >
            {cat}
          </span>
          <span
            className="font-mono text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: "#e8e8e8", color: "#4a4a4a" }}
          >
            {note.author}
          </span>
          <span className="text-xs text-muted font-mono">
            {formatNoteDate(note.created_at)}
          </span>
        </div>
        <button
          data-testid={`note-delete-${note.id}`}
          type="button"
          onClick={() => onDelete(note.id)}
          className="text-xs text-muted hover:text-danger transition-colors"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
          }}
        >
          Delete
        </button>
      </div>
      <div
        data-testid={`value-note-content-${note.id}`}
        className="text-sm text-text leading-relaxed"
      >
        <RichContent text={note.content} />
      </div>
    </div>
  );
}

export function NotesTab({ loanId }: { loanId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("General");
  const [saving, setSaving] = useState(false);
  const user = getUser();
  const bottomRef = useRef<HTMLDivElement>(null);

  async function fetchNotes() {
    try {
      const data = await apiFetch<{ notes: Note[] }>(
        `/api/loans/${loanId}/notes`,
      );
      setNotes(data.notes);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, [loanId]);

  async function saveNote() {
    if (!text.trim() || saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/loans/${loanId}/notes`, {
        method: "POST",
        body: JSON.stringify({
          content: text.trim(),
          category,
          author: user?.username ?? "analyst01",
        }),
      });
      setText("");
      setCategory("General");
      await fetchNotes();
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: number) {
    try {
      await apiFetch(`/api/loans/${loanId}/notes/${id}`, { method: "DELETE" });
      await fetchNotes();
    } catch {
      /* ignore */
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveNote();
    }
  }

  const agentNotes = notes.filter((n) => n.author_type === "agent");
  const manualNotes = notes.filter((n) => n.author_type !== "agent");

  return (
    <div data-testid="tab-content-notes">
      <div className="flex items-center justify-between mb-5">
        <h3
          className="font-display font-semibold text-sm uppercase tracking-wide"
          style={{ color: "#64748b" }}
        >
          Notes & Memo
        </h3>
        <div className="text-xs text-muted font-mono">
          {notes.length} note{notes.length !== 1 ? "s" : ""}
          {agentNotes.length > 0 && ` · ${agentNotes.length} Copilot`}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted py-8 text-center">
          Loading notes...
        </div>
      ) : notes.length === 0 ? (
        <div
          data-testid="memo-empty-state"
          className="text-sm text-muted py-8 text-center italic border border-dashed border-border rounded-lg mb-6"
        >
          No notes yet. Copilot Analyst review will appear after agent processes
          the loan. Add manual notes below.
        </div>
      ) : (
        <>
          {agentNotes.length > 0 && (
            <div className="mb-2">
              <div
                className="text-[10px] font-semibold uppercase tracking-wider mb-3"
                style={{ color: "#94a3b8" }}
              >
                Copilot Analysis
              </div>
              {agentNotes.map((note) => (
                <AgentNoteCard key={note.id} note={note} />
              ))}
            </div>
          )}

          {manualNotes.length > 0 && (
            <div>
              {agentNotes.length > 0 && (
                <div className="flex items-center gap-2 my-4">
                  <div
                    className="flex-1 h-px"
                    style={{ background: "#d1d9e0" }}
                  />
                  <span className="text-xs text-muted font-medium uppercase tracking-wide">
                    Manual Notes
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "#d1d9e0" }}
                  />
                </div>
              )}
              <div data-testid="analyst-notes-list">
                {manualNotes.map((note) => (
                  <ManualNoteCard
                    key={note.id}
                    note={note}
                    onDelete={deleteNote}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div ref={bottomRef} />

      <div className="mt-8">
        <div className="h-px mb-5" style={{ background: "#d1d9e0" }} />
        <div className="flex items-center gap-4 mb-3">
          <span
            className="font-display font-semibold text-sm uppercase tracking-wide"
            style={{ color: "#64748b" }}
          >
            Add Note
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            data-testid="notes-category-select"
            className="text-xs font-medium px-3 py-1.5 rounded border"
            style={{
              borderColor: "#d1d9e0",
              background: "#fff",
              color: "#1f2d3d",
              outline: "none",
              fontFamily: "inherit",
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <textarea
          data-testid="notes-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Write your analysis notes, observations, or override justification..."
          rows={4}
          className="w-full rounded-lg border px-4 py-3 text-sm resize-vertical outline-none"
          style={{
            borderColor: "#d1d9e0",
            color: "#1f2d3d",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted">Ctrl+Enter to save</span>
          <button
            data-testid="notes-save-btn"
            onClick={saveNote}
            disabled={!text.trim() || saving}
            className="text-sm font-medium px-4 py-2 rounded border transition-colors"
            style={{
              background: !text.trim() || saving ? "#f0f0f0" : "#8B1A1A",
              color: !text.trim() || saving ? "#999" : "#fff",
              borderColor: !text.trim() || saving ? "#d0d0d0" : "#8B1A1A",
              cursor: !text.trim() || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
