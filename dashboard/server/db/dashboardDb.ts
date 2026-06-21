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
      category TEXT NOT NULL DEFAULT 'General',
      memo_json TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_loan_notes_app_id ON loan_notes(app_id);
  `);

  // Migration: add category column if table exists from LOS schema
  try { db.exec(`ALTER TABLE loan_notes ADD COLUMN category TEXT DEFAULT 'General'`); } catch {}
  try { db.exec(`ALTER TABLE loan_notes ADD COLUMN memo_json TEXT`); } catch {}

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

  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_log_juknis (
      no INTEGER PRIMARY KEY AUTOINCREMENT,
      judul_juknis TEXT NOT NULL,
      before_juknis TEXT,
      after_juknis TEXT,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_sessions (
      app_id TEXT PRIMARY KEY,
      los_data TEXT NOT NULL,
      memo_draft TEXT NOT NULL,
      completed_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS llm_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      component TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER NOT NULL,
      output_tokens INTEGER NOT NULL,
      input_cost REAL NOT NULL,
      output_cost REAL NOT NULL,
      total_cost REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_llm_usage_app_id ON llm_usage(app_id);
    CREATE INDEX IF NOT EXISTS idx_llm_usage_component ON llm_usage(component);
    CREATE INDEX IF NOT EXISTS idx_llm_usage_created_at ON llm_usage(created_at);
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
    'INSERT INTO loan_notes (app_id, author, author_type, content, category, memo_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(appId, author, authorType, content, 'Copilot Analyst', memoJson ?? null, new Date().toISOString());
}

export function getLoanNotes(appId: string): Array<{ id: number; app_id: string; author: string; author_type: string; content: string; memo_json: string | null; created_at: string }> {
  const db = getDashboardDb();
  return db.query('SELECT * FROM loan_notes WHERE app_id = ? ORDER BY created_at ASC').all(appId) as any[];
}

export function addAuditLogJuknis(
  judulJuknis: string,
  beforeJuknis: string | null,
  afterJuknis: string | null,
  user: string,
  action: string,
): void {
  const db = getDashboardDb();
  db.query(
    'INSERT INTO audit_log_juknis (judul_juknis, before_juknis, after_juknis, user, action, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(judulJuknis, beforeJuknis, afterJuknis, user, action, new Date().toISOString());
}

export function getAuditLogJuknis(): Array<{
  no: number;
  judul_juknis: string;
  before_juknis: string | null;
  after_juknis: string | null;
  user: string;
  action: string;
  created_at: string;
}> {
  const db = getDashboardDb();
  return db.query('SELECT * FROM audit_log_juknis ORDER BY created_at DESC LIMIT 500').all() as any[];
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

export function saveAgentSession(appId: string, losData: unknown, memoDraft: unknown, completedAt: string): void {
  const db = getDashboardDb();
  db.query(`
    INSERT OR REPLACE INTO agent_sessions (app_id, los_data, memo_draft, completed_at)
    VALUES (?, ?, ?, ?)
  `).run(appId, JSON.stringify(losData), JSON.stringify(memoDraft), completedAt);
}

export function getAgentSession(appId: string): { losData: unknown; memoDraft: unknown; completedAt: string } | null {
  const db = getDashboardDb();
  const row = db.query('SELECT * FROM agent_sessions WHERE app_id = ?').get(appId) as { los_data: string; memo_draft: string; completed_at: string } | null;
  if (!row) return null;
  return {
    losData: JSON.parse(row.los_data),
    memoDraft: JSON.parse(row.memo_draft),
    completedAt: row.completed_at,
  };
}

export function getAllAgentSessions(): Array<{ appId: string; losData: unknown; memoDraft: unknown; completedAt: string }> {
  const db = getDashboardDb();
  const rows = db.query('SELECT * FROM agent_sessions ORDER BY completed_at DESC').all() as Array<{ app_id: string; los_data: string; memo_draft: string; completed_at: string }>;
  return rows.map(r => ({
    appId: r.app_id,
    losData: JSON.parse(r.los_data),
    memoDraft: JSON.parse(r.memo_draft),
    completedAt: r.completed_at,
  }));
}

export function deleteAgentSession(appId: string): void {
  const db = getDashboardDb();
  db.query('DELETE FROM agent_sessions WHERE app_id = ?').run(appId);
}

// ── LLM Usage Tracking ──────────────────────────────────────────────────────

// Gemini pricing ($/MTok)
const GEMINI_PRICING = {
  'gemini-3.1-pro': { input: 1.25, output: 5.00 },
  'gemini-2.5-pro': { input: 1.25, output: 5.00 },
  'gemini-2.5-flash': { input: 0.15, output: 0.60 },
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-1.5-pro': { input: 1.25, output: 5.00 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
} as Record<string, { input: number; output: number }>;

export function getModelPricing(model: string): { input: number; output: number } {
  // Match partial model names
  const lower = model.toLowerCase();
  for (const [key, pricing] of Object.entries(GEMINI_PRICING)) {
    if (lower.includes(key)) return pricing;
  }
  // Default Gemini Flash pricing
  return { input: 0.10, output: 0.40 };
}

export function recordLlmUsage(
  appId: string,
  component: 'browse' | 'memo' | 'chat',
  model: string,
  inputTokens: number,
  outputTokens: number
): void {
  const pricing = getModelPricing(model);
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  const totalCost = inputCost + outputCost;

  const db = getDashboardDb();
  db.query(
    'INSERT INTO llm_usage (app_id, component, model, input_tokens, output_tokens, input_cost, output_cost, total_cost, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(appId, component, model, inputTokens, outputTokens, inputCost, outputCost, totalCost, new Date().toISOString());
}

export type UsageSummary = {
  component: string;
  model: string;
  total_calls: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_input_cost: number;
  total_output_cost: number;
  total_cost: number;
};

export type DailyUsage = {
  date: string;
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  calls: number;
};

export function getUsageSummary(): UsageSummary[] {
  const db = getDashboardDb();
  return db.query(`
    SELECT 
      component,
      model,
      COUNT(*) as total_calls,
      SUM(input_tokens) as total_input_tokens,
      SUM(output_tokens) as total_output_tokens,
      SUM(input_cost) as total_input_cost,
      SUM(output_cost) as total_output_cost,
      SUM(total_cost) as total_cost
    FROM llm_usage
    GROUP BY component, model
    ORDER BY total_cost DESC
  `).all() as UsageSummary[];
}

export function getUsageByApp(appId: string): UsageSummary[] {
  const db = getDashboardDb();
  return db.query(`
    SELECT 
      component,
      model,
      COUNT(*) as total_calls,
      SUM(input_tokens) as total_input_tokens,
      SUM(output_tokens) as total_output_tokens,
      SUM(input_cost) as total_input_cost,
      SUM(output_cost) as total_output_cost,
      SUM(total_cost) as total_cost
    FROM llm_usage
    WHERE app_id = ?
    GROUP BY component, model
    ORDER BY total_cost DESC
  `).all(appId) as UsageSummary[];
}

export function getDailyUsage(days: number = 30): DailyUsage[] {
  const db = getDashboardDb();
  return db.query(`
    SELECT 
      DATE(created_at) as date,
      SUM(total_cost) as total_cost,
      SUM(input_tokens) as total_input_tokens,
      SUM(output_tokens) as total_output_tokens,
      COUNT(*) as calls
    FROM llm_usage
    WHERE created_at >= DATE('now', ?)
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `).all(`-${days} days`) as DailyUsage[];
}

export function getTotalUsage(): {
  total_cost: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_calls: number;
  by_component: Record<string, number>;
} {
  const db = getDashboardDb();
  const row = db.query(`
    SELECT 
      SUM(total_cost) as total_cost,
      SUM(input_tokens) as total_input_tokens,
      SUM(output_tokens) as total_output_tokens,
      COUNT(*) as total_calls
    FROM llm_usage
  `).get() as any;

  const components = db.query(`
    SELECT 
      component,
      SUM(total_cost) as cost
    FROM llm_usage
    GROUP BY component
  `).all() as Array<{ component: string; cost: number }>;

  const byComponent: Record<string, number> = {};
  for (const c of components) {
    byComponent[c.component] = c.cost;
  }

  return {
    total_cost: row?.total_cost ?? 0,
    total_input_tokens: row?.total_input_tokens ?? 0,
    total_output_tokens: row?.total_output_tokens ?? 0,
    total_calls: row?.total_calls ?? 0,
    by_component: byComponent,
  };
}

export function clearUsageData(): void {
  const db = getDashboardDb();
  db.query('DELETE FROM llm_usage').run();
}
