import db from "../db.js";

export interface Reminder {
  id: number;
  note_id: number;
  remind_at: string;
  status: "pending" | "notified" | "completed";
  notified_at: string | null;
  created_at: string;
  content: string;
}

export function createReminder(noteId: number, remindAt: Date): Reminder {
  const noteExists = db
    .prepare(
      `
      SELECT id
      FROM notes
      WHERE id = ?
    `,
    )
    .get(noteId);

  if (!noteExists) {
    throw new Error(`Note #${noteId} does not exist.`);
  }

  const result = db
    .prepare(
      `
      INSERT INTO reminders (
        note_id,
        remind_at,
        status,
        created_at
      )
      VALUES (?, ?, 'pending', ?)
    `,
    )
    .run(noteId, remindAt.toISOString(), new Date().toISOString());

  return getReminderById(Number(result.lastInsertRowid))!;
}

export function getReminderById(id: number): Reminder | undefined {
  return db
    .prepare(
      `
      SELECT
        reminders.*,
        notes.content
      FROM reminders
      JOIN notes
        ON notes.id = reminders.note_id
      WHERE reminders.id = ?
    `,
    )
    .get(id) as Reminder | undefined;
}

export function getUpcomingReminders(): Reminder[] {
  return db
    .prepare(
      `
      SELECT
        reminders.*,
        notes.content
      FROM reminders
      JOIN notes
        ON notes.id = reminders.note_id
      WHERE reminders.status = 'pending'
      ORDER BY reminders.remind_at ASC
    `,
    )
    .all() as Reminder[];
}

export function getDueReminders(): Reminder[] {
  return db
    .prepare(
      `
      SELECT
        reminders.*,
        notes.content
      FROM reminders
      JOIN notes
        ON notes.id = reminders.note_id
      WHERE reminders.status = 'pending'
        AND reminders.remind_at <= ?
      ORDER BY reminders.remind_at ASC
    `,
    )
    .all(new Date().toISOString()) as Reminder[];
}

export function markReminderNotified(id: number): void {
  db.prepare(
    `
    UPDATE reminders
    SET
      status = 'notified',
      notified_at = ?
    WHERE id = ?
      AND status = 'pending'
  `,
  ).run(new Date().toISOString(), id);
}

export function completeReminder(id: number): boolean {
  const result = db
    .prepare(
      `
      UPDATE reminders
      SET status = 'completed'
      WHERE id = ?
        AND status != 'completed'
    `,
    )
    .run(id);

  return result.changes > 0;
}

export function getTodayReminders(): Reminder[] {
  return getRemindersForDay(new Date());
}

/**
 * Return all reminders scheduled on the calendar day that contains `date`.
 */
export function getRemindersForDay(date: Date): Reminder[] {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db
    .prepare(
      `
      SELECT
        reminders.*,
        notes.content
      FROM reminders
      JOIN notes
        ON notes.id = reminders.note_id
      WHERE reminders.remind_at >= ?
        AND reminders.remind_at < ?
      ORDER BY reminders.remind_at ASC
    `,
    )
    .all(start.toISOString(), end.toISOString()) as Reminder[];
}
