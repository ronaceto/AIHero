#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const migrationDir = new URL('../db/migrations/', import.meta.url);
const args = process.argv.slice(2);
const toIndex = args.indexOf('--to');
const target = toIndex >= 0 ? args[toIndex + 1] : null;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required to run migrations.');
  process.exit(1);
}

const allMigrations = ['001_init.sql', '002_learning_features.sql', '003_safety_reporting.sql'];
const migrations = target ? allMigrations.slice(0, allMigrations.indexOf(target) + 1) : allMigrations;

if (migrations.length === 0) {
  console.error(`Unknown migration target: ${target}`);
  process.exit(1);
}

const tempDir = mkdtempSync(join(tmpdir(), 'studysidekickai-migrations-'));

try {
  for (const migration of migrations) {
    const sql = readFileSync(new URL(migration, migrationDir), 'utf8');
    const checksum = createHash('sha256').update(sql).digest('hex');
    const wrappedSql = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  checksum TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
\echo Applying ${migration}
BEGIN;
${sql}
INSERT INTO schema_migrations (filename, checksum)
VALUES ('${migration}', '${checksum}')
ON CONFLICT (filename) DO UPDATE SET checksum = EXCLUDED.checksum, applied_at = now();
COMMIT;
`;
    const tempFile = join(tempDir, migration);
    writeFileSync(tempFile, wrappedSql);
    const result = spawnSync('psql', [databaseUrl, '-v', 'ON_ERROR_STOP=1', '-f', tempFile], { stdio: 'inherit' });

    if (result.error?.code === 'ENOENT') {
      console.error('psql is required to run migrations but was not found on PATH.');
      process.exit(1);
    }

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
