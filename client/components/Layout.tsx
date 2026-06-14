import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUser, User } from '../lib/auth';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
  },
  {
    label: 'Task List',
    path: '/loans',
    d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
  },
];

function UserDropdown({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const displayName = user?.username ?? 'User';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            onClick={onLogout}
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

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(path: string) {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-50 top-0 left-0 h-full flex flex-col transition-all duration-300 ${collapsed ? 'w-28' : 'w-64'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: 'linear-gradient(188deg, rgba(207, 0, 0, 1) 0%, rgba(74, 0, 6, 1) 62%)' }}
      >
        {/* Brand */}
        <div className={`flex ${collapsed ? 'justify-left' : 'gap-3'} px-4 py-5`}>
          <img src="/img/logo.svg" alt="CIMB Niaga" className="h-7 w-auto" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5" style={{ paddingRight: '40px' }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.label}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all relative ${
                  active
                    ? 'border-l-4 border-white text-white font-bold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={active ? 2.5 : 1.8}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.d} />
                </svg>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col gap-1">
          <button
            className="hidden md:flex gap-3 px-3 py-2 rounded-xl text-xs text-white hover:text-gray-600 hover:bg-gray-50 transition-all"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Collapse</span>
              </>
            )}
          </button>
          {!collapsed && <img src="/img/sidebar-smv.png" alt="logo" className="w-full" />}
        </div>
        <div className="hidden lg:block absolute right-0 top-0 h-full w-10 rounded-l-[30px] bg-[#f8f3f3]"></div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 flex items-center pr-3 gap-3 shrink-0 bg-[#f8f3f3]">
          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition ml-14"
            onClick={() => setMobileOpen(true)}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 text-sm font-semibold">

          </div>

          {/* User dropdown */}
          <UserDropdown user={user} onLogout={handleLogout} />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto bg-[#f8f3f3] p-6">
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
