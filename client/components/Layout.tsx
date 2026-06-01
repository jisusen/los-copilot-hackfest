import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout, getUser } from '../lib/auth';

function NavLink({ to, label }: { to: string; label: string }) {
  const loc = useLocation();
  const active = loc.pathname.startsWith(to);
  return (
    <Link
      to={to}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 32,
        padding: '0 10px',
        fontSize: 12,
        fontWeight: active ? 500 : 400,
        color: active ? '#1a1a1a' : '#4a4a4a',
        background: active ? '#fff' : 'transparent',
        border: active ? '1px solid #1a1a1a' : '1px solid transparent',
        textDecoration: 'none',
        boxSizing: 'border-box',
      }}
    >
      {label}
    </Link>
  );
}

function PlaceholderLink({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      height: 32,
      padding: '0 10px',
      fontSize: 12,
      color: '#b8b8b8',
      cursor: 'default',
    }}>
      {label}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const user = getUser();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gridTemplateRows: '56px 1fr',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Topbar */}
      <header style={{
        gridColumn: '1 / -1',
        gridRow: '1',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 12,
        borderBottom: '1px solid #1a1a1a',
        background: '#ffffff',
        zIndex: 10,
      }}>
        {/* BMS box */}
        <div style={{
          width: 32,
          height: 32,
          border: '1.5px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          fontSize: 11,
          color: '#1a1a1a',
        }}>
          BMB
        </div>
        {/* Bank name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a', lineHeight: 1 }}>
            Bank Maju Bersama Gibran
          </span>
          <span style={{ fontSize: 10, color: '#8a8a8a', lineHeight: 1 }}>
            Sistem Informasi Kredit Konsumer
          </span>
        </div>
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Version */}
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 10,
          color: '#8a8a8a',
          marginRight: 12,
        }}>
          v3.1.0
        </span>
        {/* User pill */}
        <div style={{
          height: 28,
          padding: '0 10px',
          background: '#f6f6f4',
          border: '1px solid #d8d8d8',
          display: 'flex',
          alignItems: 'center',
          fontSize: 11,
          color: '#1a1a1a',
        }}>
          {user?.username ?? '—'} · Cabang JKT
        </div>
      </header>

      {/* Sidebar */}
      <aside style={{
        gridColumn: '1',
        gridRow: '2',
        background: '#f6f6f4',
        borderRight: '1px solid #d8d8d8',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Nav section */}
        <nav style={{ flex: 1, padding: '16px 6px 8px' }}>
          {/* Section label */}
          <div style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#8a8a8a',
            fontWeight: 600,
            padding: '4px 10px 12px',
          }}>
            MENU
          </div>

          <PlaceholderLink label="Dashboard" />
          <NavLink to="/loans" label="Task List" />
          <PlaceholderLink label="Reports" />

          {/* Separator */}
          <div style={{ height: 1, background: '#d8d8d8', margin: '8px 6px' }} />

          <PlaceholderLink label="Settings" />
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '8px 10px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            color: '#b8b8b8',
          }}>
            Build 3.1.0 · Internal use only
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: 11,
              color: '#8a8a8a',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        gridColumn: '2',
        gridRow: '2',
        overflow: 'auto',
        background: '#ffffff',
        padding: 24,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
