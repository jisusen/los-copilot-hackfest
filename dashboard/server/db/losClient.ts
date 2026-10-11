import { Database } from 'bun:sqlite';
import { join } from 'path';

// Default resolves to the repo-root data/ dir (absolute, cwd-independent).
// dashboard/.env can override with DB_PATH=../data/los.db when run from dashboard/.
const DB_PATH = process.env.DB_PATH ?? join(import.meta.dir, '../../../data/los.db');

let _db: Database | null = null;

export function getLosDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.exec('PRAGMA journal_mode=WAL;');
  }
  return _db;
}
