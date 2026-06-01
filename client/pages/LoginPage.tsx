import React, { useState } from 'react';
import { login } from '../lib/auth';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.ok) {
      onLogin();
    } else {
      setError(res.error ?? 'Invalid username or password');
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel — navy */}
      <div style={{
        flex: '0 0 50%',
        background: '#1f3b5c',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 40,
      }}>
        {/* Top: BMS box */}
        <div style={{
          width: 36,
          height: 36,
          border: '1.5px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"IBM Plex Mono", monospace',
          fontWeight: 700,
          fontSize: 11,
          color: '#ffffff',
        }}>
          BMB
        </div>

        {/* Bottom: text block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#ffffff', lineHeight: 1.2 }}>
            Bank Maju Bersama Gibran
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4 }}>
            Credit Origination System · Personal Loans Division
          </div>
          <div style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 4,
          }}>
            v3.1.0
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            Authorized personnel only.
          </div>
        </div>
      </div>

      {/* Right panel — white */}
      <div style={{
        flex: '0 0 50%',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 60,
      }}>
        <div style={{ maxWidth: 320, width: '100%' }}>
          {/* Title */}
          <div style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: '#1a1a1a',
            marginBottom: 6,
          }}>
            Sign in
          </div>
          <div style={{
            fontSize: 12,
            color: '#8a8a8a',
            marginBottom: 24,
          }}>
            Use your BMS internal credentials
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Username */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: '#4a4a4a',
                fontWeight: 500,
              }}>
                Username
              </label>
              <input
                data-testid="input-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                placeholder="Enter username"
                style={{
                  border: '1px solid #1a1a1a',
                  height: 36,
                  padding: '0 10px',
                  fontSize: 13,
                  color: '#1a1a1a',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  width: '100%',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                color: '#4a4a4a',
                fontWeight: 500,
              }}>
                Password
              </label>
              <input
                data-testid="input-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                placeholder="Enter password"
                style={{
                  border: '1px solid #1a1a1a',
                  height: 36,
                  padding: '0 10px',
                  fontSize: 13,
                  color: '#1a1a1a',
                  background: '#ffffff',
                  outline: 'none',
                  boxSizing: 'border-box',
                  width: '100%',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                data-testid="error-message"
                style={{
                  border: '1px solid #a83232',
                  background: '#fbe6e6',
                  padding: '8px 10px',
                  fontSize: 12,
                  color: '#a83232',
                }}
              >
                {error}
              </div>
            )}

            {/* Login button */}
            <button
              data-testid="btn-login"
              type="submit"
              disabled={loading}
              style={{
                background: '#1f3b5c',
                color: '#ffffff',
                height: 36,
                width: '100%',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            {/* Demo hint */}
            <div style={{
              fontSize: 11,
              color: '#8a8a8a',
              textAlign: 'center',
              marginTop: 12,
            }}>
              Demo: analyst01 / bms2025
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
