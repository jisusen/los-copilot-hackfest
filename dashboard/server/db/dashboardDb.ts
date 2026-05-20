import { Database } from 'bun:sqlite';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH ?? join(import.meta.dir, '../../data/los.db');

let _db: Database | null = null;

export function getDashboardDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.exec('PRAGMA journal_mode=WAL;');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS loan_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      author TEXT NOT NULL,
      author_type TEXT NOT NULL DEFAULT 'manual',
      content TEXT NOT NULL,
      memo_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_loan_notes_app_id ON loan_notes(app_id);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS decisions (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      decision TEXT NOT NULL,
      note TEXT,
      analyst_id TEXT NOT NULL,
      decided_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_decisions_app_id ON decisions(app_id);
    CREATE INDEX IF NOT EXISTS idx_decisions_decided_at ON decisions(decided_at);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_audit_app_id ON audit_logs(app_id);
  `);
}

export function saveDecision(
  id: string,
  appId: string,
  decision: string,
  note: string,
  analystId: string,
  decidedAt: string
): void {
  const db = getDashboardDb();
  // Upsert: delete existing decision for this app first, then insert
  db.query('DELETE FROM decisions WHERE app_id = ?').run(appId);
  db.query(
    'INSERT INTO decisions (id, app_id, decision, note, analyst_id, decided_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, appId, decision, note, analystId, decidedAt);
}

export function getDecision(appId: string): { id: string; app_id: string; decision: string; note: string; analyst_id: string; decided_at: string } | null {
  const db = getDashboardDb();
  const row = db.query('SELECT * FROM decisions WHERE app_id = ?').get(appId) as any;
  return row ?? null;
}

export function getAllDecisions(): Array<{ id: string; app_id: string; decision: string; note: string; analyst_id: string; decided_at: string }> {
  const db = getDashboardDb();
  return db.query('SELECT * FROM decisions ORDER BY decided_at DESC').all() as any[];
}

export function saveLoanNote(
  appId: string,
  author: string,
  authorType: 'agent' | 'manual',
  content: string,
  memoJson?: string
): void {
  const db = getDashboardDb();
  // Replace existing agent note for this app (re-run scenario)
  if (authorType === 'agent') {
    db.query('DELETE FROM loan_notes WHERE app_id = ? AND author_type = ?').run(appId, 'agent');
  }
  db.query(
    'INSERT INTO loan_notes (app_id, author, author_type, content, memo_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(appId, author, authorType, content, memoJson ?? null, new Date().toISOString());
}

export function getLoanNotes(appId: string): Array<{ id: number; app_id: string; author: string; author_type: string; content: string; memo_json: string | null; created_at: string }> {
  const db = getDashboardDb();
  return db.query('SELECT * FROM loan_notes WHERE app_id = ? ORDER BY created_at ASC').all(appId) as any[];
}

export function addAuditLog(appId: string, actor: string, action: string, detail?: string): void {
  const db = getDashboardDb();
  db.query(
    'INSERT INTO audit_logs (app_id, actor, action, detail, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(appId, actor, action, detail ?? null, new Date().toISOString());
}

export function getAuditLogs(appId: string): Array<{ id: number; app_id: string; actor: string; action: string; detail: string | null; created_at: string }> {
  const db = getDashboardDb();
  return db.query('SELECT * FROM audit_logs WHERE app_id = ? ORDER BY created_at ASC').all(appId) as any[];
}
