import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import type { MemoDraft } from "../lib/types";
import { CheckCircle, FileText, Loader2, X } from "lucide-react";

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
      {/* Sticky footer bar */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 px-6 py-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 shrink-0">
            Submit Memo
          </span>
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <input
              data-testid="memo-note-input"
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Tambahkan catatan untuk LOS..."
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-red-300 focus:ring-2 focus:ring-red-100 focus:bg-white"
            />
          </div>
          <button
            data-testid="btn-submit-memo"
            disabled={loading || !memo}
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Submit Memo</>
            )}
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" style={{ marginTop: "0px" }}
          onClick={() => !loading && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl p-7 max-w-md w-[90%] shadow-2xl border border-slate-100 animate-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Konfirmasi Submission</h2>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Memo analisis kredit akan dikirim ke sistem LOS untuk aplikasi:
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-slate-400">ID:</span>
                <span className="text-[11px] font-mono font-semibold text-slate-600">{appId}</span>
              </div>
              <div className="text-base font-bold text-slate-900">{debtorName}</div>
              {note && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">CATATAN:</span>
                  <span className="text-sm text-slate-600">{note}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Memo akan disimpan di LOS Notes &amp; Memo. Persetujuan akhir harus dilakukan di aplikasi LOS.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); submitMemo(); }}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-sm font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                ) : (
                  <><CheckCircle className="w-4 h-4" /> Submit ke LOS</>
                )}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 text-sm font-semibold rounded-xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
