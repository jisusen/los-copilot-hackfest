import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { LoanQueuePage } from './pages/LoanQueuePage';
import { LoanDetailPage } from './pages/LoanDetailPage';
import { checkSession, getUser } from './lib/auth';

export function App() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    checkSession().then(user => {
      setAuthed(!!user);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' }}>
        <div className="text-white text-lg font-display">Memuat sistem...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={authed ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={() => setAuthed(true)} />} />
        <Route path="/dashboard" element={authed ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/loans" element={authed ? <LoanQueuePage /> : <Navigate to="/login" replace />} />
        <Route path="/loans/:id" element={authed ? <LoanDetailPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={authed ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
