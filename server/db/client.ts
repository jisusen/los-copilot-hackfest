import { Database } from 'bun:sqlite';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DB_PATH ?? join(import.meta.dir, '../../data/los.db');

let _db: Database | null = null;

function runMigrations(db: Database) {
  // Add missing columns that were added after initial table creation
  const migrations = [
    "ALTER TABLE loan_applications ADD COLUMN assigned_at TEXT",
    "ALTER TABLE loan_applications ADD COLUMN decided_at TEXT",
  ];
  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists — ignore
    }
  }

  // Rename asset_type → collateral_type in collaterals table (SQLite 3.25+)
  try {
    db.exec(`ALTER TABLE collaterals RENAME COLUMN asset_type TO collateral_type`);
  } catch {
    // Column already renamed or does not exist — ignore
  }

  // Add pep_edd_required to aml_fraud table
  try {
    db.exec(`ALTER TABLE aml_fraud ADD COLUMN pep_edd_required INTEGER DEFAULT 0`);
  } catch {
    // Column already exists — ignore
  }
}

export function getDb(): Database {
  if (!_db) {
    _db = new Database(DB_PATH, { create: true });
    _db.exec('PRAGMA journal_mode=WAL;');
    _db.exec('PRAGMA foreign_keys=ON;');
    const schema = readFileSync(join(import.meta.dir, 'schema.sql'), 'utf-8');
    _db.exec(schema);
    runMigrations(_db);
  }
  return _db;
}
