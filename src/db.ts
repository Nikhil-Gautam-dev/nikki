import Database from "better-sqlite3";
import { DB_PATH } from "./utils/paths.js";

const db: Database.Database = new Database(DB_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    note_id INTEGER NOT NULL,

    remind_at TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'pending',

    notified_at TEXT,

    created_at TEXT NOT NULL,

    FOREIGN KEY (note_id)
      REFERENCES notes(id)
      ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_notes_created_at
    ON notes(created_at);

  CREATE INDEX IF NOT EXISTS idx_reminders_remind_at
    ON reminders(remind_at);

  CREATE INDEX IF NOT EXISTS idx_reminders_status
    ON reminders(status);
`);

// Migration: add optional title column to existing databases.
// ALTER TABLE ADD COLUMN errors if the column already exists in SQLite,
// so we swallow that specific error.
try {
  db.exec(`ALTER TABLE notes ADD COLUMN title TEXT`);
} catch {
  // Column already exists — safe to ignore.
}

try {
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_notes_title ON notes(title)`,
  );
} catch {
  // Index already exists — safe to ignore.
}

export default db;
