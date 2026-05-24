import React, { useEffect, useState, useCallback, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; type: ToastType };

const ToastCtx = createContext<{(msg: string, type?: ToastType): void}>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  const colors: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: { bg: '#e6f7ee', border: '#b7dfc6', icon: '#1a7f4b' },
    error:   { bg: '#fde8e8', border: '#f5baba', icon: '#b91c1c' },
    info:    { bg: '#e8f0fe', border: '#b8cff5', icon: '#1a3a5c' },
  };

  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => {
          const c = colors[t.type];
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8,
              padding: '10px 16px', fontFamily: 'var(--font-sans)', fontSize: 13,
              color: '#1f2d3d', boxShadow: '0 4px 12px rgba(0,0,0,.08)',
              display: 'flex', alignItems: 'center', gap: 8,
              pointerEvents: 'auto', maxWidth: 360,
              animation: 'toastIn .2s ease-out',
            }}>
              <span style={{ fontSize: 16 }}>{t.type === 'success' ? '✓' : t.type === 'error' ? '✗' : 'ℹ'}</span>
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toastIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </ToastCtx.Provider>
  );
}
