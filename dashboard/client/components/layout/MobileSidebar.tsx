import { navLinks } from "../../data/navLinks";
import { X } from "lucide-react";

type MobileSidebarProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MobileSidebar({
  sidebarOpen,
  setSidebarOpen,
}: MobileSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      <aside className="absolute left-0 top-0 h-full w-56 bg-white flex flex-col z-50" style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}>
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-sm shadow-red-200">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 leading-tight">Bank Maju Bersama</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Credit Analyst Copilot</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <nav className="flex-1 px-2.5 py-4 space-y-0.5">
          {navLinks.map((item) => (
            <button key={item.label} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={item.d} /></svg>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}