import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navLinks } from "../../data/navLinks";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

export default function Sidebar({ agentmode }: { agentmode: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(path: string) {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:relative z-50 top-0 left-0 h-full bg-[#272123] flex flex-col transition-all duration-300
        ${collapsed ? "w-28" : "w-64"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Brand */}
        <div className={`flex  ${collapsed ? 'justify-left' : 'gap-3'} px-4 py-5 `} >
          <img src="/img/logo.png" alt="logo" className="w-6 h-6" />
          {!collapsed && (
            <div className="overflow-hidden text-lg font-bold text-white leading-tight">
              JOKI AI
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5" style={{ paddingRight:"40px" }}>
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
             <button
                key={item.label}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative ${
                  active
                    ? "border-r-4 border-solid border-red-600 text-red-600 font-semibold"
                    : "text-white hover:text-red-600"
                }`}
              >

                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-red-600 rounded-full" />
                )}
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={active ? 2.2 : 1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                </svg>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1 ">
          <button
            className="hidden md:flex gap-3 px-3 py-2 rounded-xl text-xs text-white hover:text-gray-600 hover:bg-gray-50 transition-all "
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Me</span>
              </>
            )}
          </button>
          <img src="/img/sidebar-2.webp" alt="logo" className="w-full" />
        </div>
      <div className="hidden lg:block absolute right-0 top-0 h-full w-10 rounded-l-[30px] bg-[#f8f3f3]"></div>


        {/* Simulation Badge */}
        {agentmode === "sim" && !collapsed && (
          <div className="shrink-0 px-2.5 pb-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-2 rounded-xl shadow-sm">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span>Simulation Mode</span>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile toggle */}
      <button
        className="fixed top-3.5 left-3.5 z-30 lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
    </>
  );
}
