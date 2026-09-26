/**
 * Date maths and countdowns, shared by homework, the bag list and the dates page.
 *
 * Everything here is local time. `toISOString()` is UTC, and Dubai is four hours
 * ahead, so a date taken from it between midnight and 04:00 would be the day before.
 */

import type { CountdownEvent } from "./types";

/** "2026-09-26", in local time. */
export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** A "YYYY-MM-DD" string as local midnight. `new Date("2026-09-26")` would be UTC. */
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Midnight, `days` days after `date`. */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Whole days from today to `iso`: 0 is today, 1 tomorrow, -1 yesterday. */
export function daysUntil(iso: string, today: Date): number {
  const midnight = addDays(today, 0);
  return Math.round((fromIsoDate(iso).getTime() - midnight.getTime()) / 86_400_000);
}

/** "Today", "Tomorrow", "in 9 days", "3 days ago". */
export function countdownLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 0) return `in ${days} days`;
  if (days === -1) return "Yesterday";
  return `${-days} days ago`;
}

/** Soonest first, then alphabetically so two things on one day keep a fixed order. */
export function byDate(a: CountdownEvent, b: CountdownEvent): number {
  return a.date.localeCompare(b.date) || a.title.localeCompare(b.title);
}

/** The next thing coming up, or null. Today still counts as coming up. */
export function nextEvent(
  events: CountdownEvent[],
  today: Date,
): CountdownEvent | null {
  return events.filter((e) => daysUntil(e.date, today) >= 0).sort(byDate)[0] ?? null;
}
