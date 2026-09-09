/**
 * Changing a timetable.
 *
 * Every function here takes a timetable and returns a new one rather than editing
 * the old one in place. That means a change can never half-apply: either the caller
 * gets a complete new timetable to save, or it still has the old one untouched.
 */

import type { DayKey, Lesson, Slot, Timetable } from "./types";

/**
 * A generic school day to start from, not any real school's. The whole point is
 * that you edit these — they exist so the Lessons tab has rows to tap on the very
 * first run, instead of an empty screen that can't be filled in.
 */
export function createStarterTimetable(): Timetable {
  return {
    version: 1,
    slots: [
      { n: 1, start: "09:00", end: "10:00", type: "lesson" },
      { n: 2, start: "10:00", end: "11:00", type: "lesson" },
      { n: 3, start: "11:00", end: "11:15", type: "break", label: "Break" },
      { n: 4, start: "11:15", end: "12:15", type: "lesson" },
      { n: 5, start: "12:15", end: "13:15", type: "lesson" },
      { n: 6, start: "13:15", end: "14:00", type: "lunch", label: "Lunch" },
      { n: 7, start: "14:00", end: "15:00", type: "lesson" },
      { n: 8, start: "15:00", end: "16:00", type: "lesson" },
    ],
    days: {},
  };
}

/** The lowest period number not already in use. */
export function nextSlotNumber(tt: Timetable): number {
  const used = new Set(tt.slots.map((s) => s.n));
  let n = 1;
  while (used.has(n)) n++;
  return n;
}

/** Add or replace a lesson in one period of one day. */
export function setLesson(tt: Timetable, day: DayKey, lesson: Lesson): Timetable {
  const existing = tt.days[day] ?? [];
  const others = existing.filter((l) => l.n !== lesson.n);
  return {
    ...tt,
    days: { ...tt.days, [day]: [...others, lesson].sort((a, b) => a.n - b.n) },
  };
}

export function removeLesson(tt: Timetable, day: DayKey, n: number): Timetable {
  const existing = tt.days[day] ?? [];
  return {
    ...tt,
    days: { ...tt.days, [day]: existing.filter((l) => l.n !== n) },
  };
}

/** Add or replace a period. Slots stay sorted by start time. */
export function setSlot(tt: Timetable, slot: Slot): Timetable {
  const others = tt.slots.filter((s) => s.n !== slot.n);
  return {
    ...tt,
    slots: [...others, slot].sort((a, b) => a.start.localeCompare(b.start)),
  };
}

/**
 * Delete a period — and every lesson taught in it. A lesson whose slot is gone has
 * no time attached to it, so leaving it behind would be an invisible orphan.
 */
export function removeSlot(tt: Timetable, n: number): Timetable {
  const days: Timetable["days"] = {};
  for (const [day, lessons] of Object.entries(tt.days)) {
    days[day as DayKey] = (lessons ?? []).filter((l) => l.n !== n);
  }
  return { ...tt, slots: tt.slots.filter((s) => s.n !== n), days };
}

/**
 * The first period that would clash with `slot`, or null. Overlapping periods would
 * make "what's on now" ambiguous, so the editor refuses to create them.
 */
export function findOverlap(tt: Timetable, slot: Slot): Slot | null {
  return (
    tt.slots.find(
      (other) =>
        other.n !== slot.n && slot.start < other.end && other.start < slot.end,
    ) ?? null
  );
}

/** How many lessons would be lost if this period were deleted. */
export function lessonsInSlot(tt: Timetable, n: number): number {
  return Object.values(tt.days).reduce(
    (total, lessons) => total + (lessons ?? []).filter((l) => l.n === n).length,
    0,
  );
}
