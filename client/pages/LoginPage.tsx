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
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* Background panel — 75% desktop, top on mobile */}
      <div className="relative h-[40vh] md:h-full md:w-[75%] flex flex-col justify-between p-8 md:p-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #590000 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/[0.03]" />

        {/* Logo + Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img src="/img/logo.svg" alt="CIMB Niaga" className="h-8 w-auto" />
          </div>
          <div className="mt-2 text-white/40 text-xs font-mono">v3.1.0</div>
        </div>

        {/* Quote / branding text */}
        <div className="relative z-10 max-w-lg">
          <div className="text-white/90 text-2xl md:text-3xl font-bold leading-tight">
            Loan Origination System
          </div>

          <div className="flex items-center gap-4 mt-6 text-white/30 text-xs">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure Access
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Authorized Personnel Only
            </span>
          </div>
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 text-white/20 text-xs">
          &copy; 2026 Bank CIMB Niaga
        </div>
      </div>

      {/* Form panel — 25% desktop, bottom on mobile */}
      <div className="flex-1 md:w-[25%] flex items-center justify-center p-6 md:p-10 bg-white">
        <div className="w-full max-w-sm">
          <div className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</div>
          <div className="text-sm text-gray-400 mt-1 mb-8">Use your internal credentials</div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
                className="w-full h-10 px-3 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/20 transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
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
                className="w-full h-10 px-3 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-[#8B1A1A] focus:ring-1 focus:ring-[#8B1A1A]/20 transition-all placeholder-gray-400"
              />
            </div>

            {error && (
              <div data-testid="error-message"
                className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-600">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button data-testid="btn-login" type="submit" disabled={loading}
              className="w-full h-10 text-sm font-semibold text-white rounded-lg transition-all hover:opacity-90 disabled:opacity-60 cursor-pointer border-none"
              style={{ background: 'linear-gradient(135deg, #8B1A1A, #590000)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

            <div className="text-center text-xs text-gray-400 mt-2">
              Demo: analyst01 / bms2025
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
