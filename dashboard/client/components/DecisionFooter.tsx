import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { Decision } from "../lib/types";

const BTNS: { decision: Decision; label: string; cls: string }[] = [
  { decision: "approve", label: "✓ Approve",             cls: "btn success" },
  { decision: "reject",  label: "⚠ Refer to Committee",  cls: "btn warn" },
  { decision: "cancel",  label: "✗ Reject",               cls: "btn danger" },
];

const CONFIRM_LABEL: Record<Decision, string> = {
  approve: "APPROVING",
  reject:  "REFERRING TO COMMITTEE",
  cancel:  "REJECTING",
};

export function DecisionFooter({ appId, debtorName }: { appId: string; debtorName: string }) {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function confirm() {
    if (!pending || loading) return;
    setLoading(true);
    try {
      await apiFetch(`/api/decisions/${appId}`, {
        method: "POST",
        body: JSON.stringify({ decision: pending, note, analystId: "analyst01" }),
      });
      navigate("/");
    } catch {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Sticky decision bar */}
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
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--ink-3)", fontWeight: 600 }}>
          Final decision
        </span>
        {BTNS.map(b => {
          const isActive = pending === b.decision;
          const testid   = b.decision === "approve" ? "approve" : b.decision === "reject" ? "refer" : "reject";
          return (
            <button
              key={b.decision}
              data-testid={`btn-${testid}`}
              className={isActive ? b.cls : "btn outline"}
              onClick={() => setPending(prev => prev === b.decision ? null : b.decision)}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {b.label}
            </button>
          );
        })}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <input
            data-testid="decision-note-input"
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note…"
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
          data-testid="btn-confirm-decision"
          className="btn primary"
          disabled={!pending || loading}
          onClick={confirm}
          style={{ padding: "8px 18px", whiteSpace: "nowrap" }}
        >
          {loading ? "Processing…" : "Submit decision →"}
        </button>
      </div>

      {/* Confirmation modal */}
      {pending && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,18,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}
          className="fade-in"
          onClick={() => !loading && setPending(null)}
        >
          <div
            style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "28px 28px 24px", maxWidth: 460, width: "90%", boxShadow: "0 20px 60px rgba(15,18,22,0.12)" }}
            className="slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, color: "var(--ink)", marginBottom: 6, letterSpacing: "-0.01em" }}>
              Confirm Decision
            </div>
            <div style={{ fontSize: 14, color: "var(--ink-2)", marginBottom: 16, lineHeight: 1.5 }}>
              You are about to <b style={{ color: "var(--ink)" }}>{CONFIRM_LABEL[pending]}</b> the following application:
            </div>
            <div style={{ padding: "12px 14px", background: "var(--paper-2)", borderRadius: "var(--r)", border: "1px solid var(--line)", marginBottom: 20 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", marginBottom: 2 }}>{appId}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>{debtorName}</div>
              {note && <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", marginTop: 8 }}>Note: {note}</div>}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                className="btn primary"
                onClick={confirm}
                disabled={loading}
                style={{ flex: 1, padding: "10px" }}
              >
                {loading ? "Processing…" : "Confirm"}
              </button>
              <button
                className="btn outline"
                onClick={() => setPending(null)}
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
