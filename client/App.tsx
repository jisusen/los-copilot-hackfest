import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
      <div className="flex items-center justify-center min-h-screen bg-primary">
        <div className="text-white text-lg font-display">Memuat sistem...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={authed ? <Navigate to="/loans" replace /> : <LoginPage onLogin={() => setAuthed(true)} />} />
        <Route path="/loans" element={authed ? <LoanQueuePage /> : <Navigate to="/login" replace />} />
        <Route path="/loans/:id" element={authed ? <LoanDetailPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={authed ? '/loans' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
