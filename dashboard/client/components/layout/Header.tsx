import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../App";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  agentMode: string;
  onAgentMode: (v: string) => void;
  onMenuClick: () => void;
};

export default function Header({
  agentMode,
  onAgentMode,
  onMenuClick,
}: HeaderProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 gap-5 shrink-0 border-b  backdrop-blur-sm">
      {/* Left — Brand */}
      <div className="flex items-center gap-3 min-w-0">
        
        <div className="hidden lg:block min-w-0">
          <span className="text-base font-bold text-slate-800 tracking-tight">
            Credit Analyst Copilot
          </span>
          <span className="text-[11px] font-mono text-slate-400 ml-2 uppercase tracking-widest">
            JOKI AI
          </span>
        </div>
      </div>

      {/* Center — Controls */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Agent Mode */}
        <div className="flex items-center bg-red-600 rounded-lg p-0.5">
          <button
            onClick={() => onAgentMode("real")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              agentMode === "real"
                ? "bg-white text-red-600 shadow-sm border border-slate-200/50"
                : "text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="21.17" y1="8" x2="12" y2="8" />
                <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
                <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
              </svg>
              Browser
            </span>
          </button>
          <button
            onClick={() => onAgentMode("sim")}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${
              agentMode === "sim"
                ? "bg-white text-red-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17l6-6-6-6" />
                <path d="M12 19h8" />
              </svg>
              API
            </span>
          </button>
        </div>
      </div>

      {/* Right — User */}
      <UserDropdown />
    </header>
  );
}
function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user ?? "analyst01";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-2.5 pr-3 py-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white text-sm font-bold">{initial}</span>
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-slate-800 leading-tight">{displayName}</div>
          <div className="text-[11px] text-slate-400 font-medium">Credit Analyst</div>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-50 py-1.5 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-900">{displayName}</div>
            <div className="text-xs text-slate-500">Credit Analyst</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">{displayName}@bankmajubersama.co.id</div>
          </div>
          <button
            onClick={() => { navigate("/settings"); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Settings
          </button>
          <div className="border-t border-slate-100 my-1" />
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}