import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { MemoDraft } from "../lib/types";

export function DecisionFooter({ appId, debtorName, memo }: { appId: string; debtorName: string; memo: MemoDraft | null }) {
  const navigate = useNavigate();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function submitMemo() {
    if (loading || !memo) return;
    setLoading(true);
    try {
      await apiFetch(`/api/decisions/${appId}`, {
        method: "POST",
        body: JSON.stringify({ memo, note, analystId: "analyst01" }),
      });
      navigate("/");
    } catch {
      setLoading(false);
    }
  }

  const handleSubmit = useCallback(() => { setShowConfirm(true); }, []);

  return (
    <>
      {/* Sticky memo submission bar */}
      <div style={{
        position: "sticky", bottom: 0, left: 0, right: 0,
        padding: "14px 24px",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid var(--line)",
        boxShadow: "0 -4px 16px rgba(15,18,22,0.04)",
        zIndex: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--ink-3)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-3)", fontWeight: 600 }}>
          Submit memo to LOS
        </span>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <input
            data-testid="memo-note-input"
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note for LOS…"
            style={{
              flex: 1, padding: "8px 12px",
              border: "1px solid var(--line)", borderRadius: "var(--r)",
              fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--ink)",
              outline: "none",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--line)"; }}
          />
        </div>
        <button
          data-testid="btn-submit-memo"
          className="btn primary"
          disabled={loading || !memo}
          onClick={handleSubmit}
          style={{ padding: "8px 18px", whiteSpace: "nowrap" }}
        >
          {loading ? "Submitting…" : "Submit Memo →"}
        </button>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,18,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          className="fade-in"
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "28px 28px 24px", maxWidth: 460, width: "90%", boxShadow: "0 20px 60px rgba(15,18,22,0.12)" }}
            className="slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 6, letterSpacing: "-0.01em" }}>
              Confirm Submission
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.5 }}>
              Submit the credit analysis memo for:
            </div>
            <div style={{ padding: "12px 14px", background: "var(--paper-2)", borderRadius: "var(--r)", border: "1px solid var(--line)", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>{appId}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{debtorName}</div>
              {note && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>Note: {note}</div>}
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 16, lineHeight: 1.5 }}>
              The memo will be saved in LOS Notes & Memo. Final approval/rejection must be done in the LOS application.
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn primary"
                onClick={() => { setShowConfirm(false); submitMemo(); }}
                disabled={loading}
                style={{ flex: 1, padding: "10px" }}
              >
                {loading ? "Processing…" : "Submit to LOS"}
              </button>
              <button
                className="btn outline"
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, padding: "10px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}