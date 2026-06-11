import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../App";

type HeaderProps = {
  agentMode: string;
  onAgentMode: (v: string) => void;
  liveOn: boolean;
  onLive: (v: boolean) => void;
  onMenuClick: () => void;
};

export default function Header({
  agentMode,
  onAgentMode,
  liveOn,
  onLive,
  onMenuClick,
}: HeaderProps) {
  return ( 
 <header className="h-14  flex items-center pr-3 gap-3 shrink-0">
  {/* Mobile Menu */}


  <div className="flex-1 font-sm font-semibold" >
    <span className="hidden lg:inline">
  Credit Analyst Copilot
</span>

    </div>
  {/* Controls */}
  <div className="hidden md:flex items-center gap-3">
    {/* Agent Mode */}
    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
      <span className="text-xs font-semibold text-slate-500 px-2">
        Agent :
      </span>

      <button
        onClick={() => onAgentMode("real")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          agentMode === "real"
            ? "bg-white border border-slate-200/60 text-red-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Browser
      </button>

      <button
        onClick={() => onAgentMode("sim")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
          agentMode === "sim"
            ? "bg-white border border-slate-200/60 text-red-600 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        Api
      </button>
    </div>

    {/* Live Toggle */}
    <button
      onClick={() => onLive(!liveOn)}
      className={`flex items-center gap-2 px-2 py-1 rounded-xl border transition-all ${
        liveOn
          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
          : "bg-slate-50 border-slate-200 text-slate-500"
      }`}
    >
      <span
        className={`w-2.5 h-2.5 rounded-full ${
          liveOn
            ? "bg-emerald-500 animate-pulse"
            : "bg-slate-400"
        }`}
      />
      <span className="text-sm font-medium">
        Live {liveOn ? "ON" : "OFF"}
      </span>
    </button>
  </div>

  {/* User */}
  <UserDropdown />
</header>
  )};

function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
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
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">{initial}</span>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-sm font-semibold text-slate-800">{displayName}</div>
          <div className="text-xs text-slate-500">Credit Analyst</div>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 py-2">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-900">{displayName}</div>
            <div className="text-xs text-slate-500">Credit Analyst</div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">{displayName}@bankmajubersama.co.id</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 font-semibold hover:bg-red-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
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