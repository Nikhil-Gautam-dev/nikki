import db from "../db.js";

export interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export function createNote(content: string): Note {
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
      INSERT INTO notes (
        content,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?)
    `,
    )
    .run(content, now, now);

  return db
    .prepare(
      `
      SELECT *
      FROM notes
      WHERE id = ?
    `,
    )
    .get(result.lastInsertRowid) as Note;
}

export function getNotes(limit = 20): Note[] {
  return db
    .prepare(
      `
      SELECT *
      FROM notes
      ORDER BY created_at DESC
      LIMIT ?
    `,
    )
    .all(limit) as Note[];
}

export function searchNotes(query: string): Note[] {
  return db
    .prepare(
      `
      SELECT *
      FROM notes
      WHERE content LIKE ?
      ORDER BY created_at DESC
    `,
    )
    .all(`%${query}%`) as Note[];
}

export function getNoteById(id: number): Note | undefined {
  return db
    .prepare(
      `
      SELECT *
      FROM notes
      WHERE id = ?
    `,
    )
    .get(id) as Note | undefined;
}

export function updateNote(id: number, content: string): Note | undefined {
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `
      UPDATE notes
      SET
        content = ?,
        updated_at = ?
      WHERE id = ?
    `,
    )
    .run(content, now, id);

  if (result.changes === 0) {
    return undefined;
  }

  return getNoteById(id);
}

export function deleteNote(id: number): boolean {
  const result = db
    .prepare(
      `
      DELETE FROM notes
      WHERE id = ?
    `,
    )
    .run(id);

  return result.changes > 0;
}

export function getTodayNotes(): Note[] {
  const start = new Date();

  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db
    .prepare(
      `
      SELECT *
      FROM notes
      WHERE created_at >= ?
        AND created_at < ?
      ORDER BY created_at ASC
    `,
    )
    .all(start.toISOString(), end.toISOString()) as Note[];
}
