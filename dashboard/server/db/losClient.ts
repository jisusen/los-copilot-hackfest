import { Database } from 'bun:sqlite';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH ?? join(import.meta.dir, '../../data/los.db');

let _db: Database | null = null;

export function getLosDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
    _db.exec('PRAGMA journal_mode=WAL;');
  }
  return _db;
}
