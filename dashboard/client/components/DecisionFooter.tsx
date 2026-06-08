import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { Decision } from "../lib/types";

const BTNS: { decision: Decision; label: string; tailwind: string }[] = [
  { decision: "approve", label: "✓ Approve",             tailwind: "bg-emerald-600 hover:bg-emerald-700 text-white" },
  { decision: "reject",  label: "⚠ Refer to Committee",  tailwind: "bg-amber-500 hover:bg-amber-600 text-white" },
  { decision: "cancel",  label: "✗ Reject",               tailwind: "bg-red-600 hover:bg-red-700 text-white" },
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
      <div className="flex items-center gap-2.5">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400 shrink-0">Final decision</span>
        {BTNS.map(b => {
          const isActive = pending === b.decision;
          const testid   = b.decision === "approve" ? "approve" : b.decision === "reject" ? "refer" : "reject";
          return (
            <button
              key={b.decision}
              data-testid={`btn-${testid}`}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isActive ? b.tailwind : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => setPending(prev => prev === b.decision ? null : b.decision)}
            >
              {b.label}
            </button>
          );
        })}
        <div className="flex-1 min-w-0">
          <input
            data-testid="decision-note-input"
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Optional note…"
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-900 bg-white outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          />
        </div>
        <button
          data-testid="btn-confirm-decision"
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors disabled:opacity-40 whitespace-nowrap"
          disabled={!pending || loading}
          onClick={confirm}
        >
          {loading ? "Processing…" : "Submit →"}
        </button>
      </div>

      {pending && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => !loading && setPending(null)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-slate-900 mb-1">Confirm Decision</h2>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              You are about to <strong className="text-slate-900">{CONFIRM_LABEL[pending]}</strong> the following application:
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5">
              <div className="text-[11px] font-mono text-slate-500 mb-0.5">{appId}</div>
              <div className="text-base font-bold text-slate-900">{debtorName}</div>
              {note && <div className="text-[11px] font-mono text-slate-500 mt-2">Note: {note}</div>}
            </div>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-40"
                onClick={confirm}
                disabled={loading}
              >
                {loading ? "Processing…" : "Confirm"}
              </button>
              <button
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl border border-red-200 text-red-700 hover:bg-red-50 transition-colors"
                onClick={() => setPending(null)}
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
