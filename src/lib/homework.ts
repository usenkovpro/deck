/**
 * Homework: what is due, and when.
 *
 * Pure functions of (homework, timetable, date), like schedule.ts. Nothing here
 * touches the DOM or storage.
 */

import { shortDate } from "./format";
import { dayKeyOf, entriesFor } from "./schedule";
import type { Homework, Timetable } from "./types";

/**
 * "2026-09-12", in local time. Never `toISOString()`: that is UTC, and Dubai is
 * four hours ahead, so homework added between midnight and 04:00 would land on the
 * day before.
 */
export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** A "YYYY-MM-DD" string as local midnight. `new Date("2026-09-12")` would be UTC. */
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Midnight, `days` days after `date`. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Whole days from today to `due`: 0 is today, 1 tomorrow, -1 yesterday. */
export function daysUntil(due: string, today: Date): number {
  const midnight = addDays(today, 0);
  return Math.round((fromIsoDate(due).getTime() - midnight.getTime()) / 86_400_000);
}

export type Group = "overdue" | "today" | "tomorrow" | "soon" | "later" | "done";

/** The order groups appear in on screen: most urgent first, finished last. */
export const GROUP_ORDER: Group[] = ["overdue", "today", "tomorrow", "soon", "later", "done"];

export const GROUP_LABELS: Record<Group, string> = {
  overdue: "Overdue",
  today: "Due today",
  tomorrow: "Due tomorrow",
  soon: "Coming up",
  later: "Later",
  done: "Done",
};

export function groupOf(item: Homework, today: Date): Group {
  if (item.done) return "done";
  const days = daysUntil(item.due, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return days <= 7 ? "soon" : "later";
}

/** Soonest first. Items due the same day stay in the order they were added. */
export function byDue(a: Homework, b: Homework): number {
  return a.due.localeCompare(b.due) || a.created - b.created;
}

/** "Due tomorrow", "Due Thursday", "3 days overdue". */
export function dueLabel(item: Homework, today: Date): string {
  const days = daysUntil(item.due, today);
  const date = fromIsoDate(item.due);
  if (item.done) return `Due ${shortDate(date)}`;
  if (days < -1) return `${-days} days overdue`;
  if (days === -1) return "Was due yesterday";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due ${date.toLocaleDateString("en-GB", { weekday: "long" })}`;
  return `Due ${shortDate(date)}`;
}

/** What the Today screen needs to know: how much is urgent. */
export function homeworkSummary(
  items: Homework[],
  today: Date,
): { overdue: number; today: number; tomorrow: number } {
  const counts = { overdue: 0, today: 0, tomorrow: 0 };
  for (const item of items) {
    const group = groupOf(item, today);
    if (group === "overdue" || group === "today" || group === "tomorrow") counts[group]++;
  }
  return counts;
}

/**
 * The next lesson of `subject` after today, looking up to a fortnight ahead.
 *
 * This is the default due date. Homework is nearly always due next lesson, and
 * that is exactly the thing that is annoying to work out from a paper timetable.
 * It starts from tomorrow: homework set this morning is not due this afternoon.
 */
export function nextLessonOf(
  tt: Timetable,
  subject: string,
  from: Date,
): { date: Date; start: string } | null {
  for (let ahead = 1; ahead <= 14; ahead++) {
    const date = addDays(from, ahead);
    const entry = entriesFor(tt, dayKeyOf(date)).find(
      (e) => e.lesson?.subject === subject,
    );
    if (entry) return { date, start: entry.slot.start };
  }
  return null;
}

export function newId(): string {
  // randomUUID only exists on https and localhost. Deck is served from both, but a
  // fallback costs one line.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
