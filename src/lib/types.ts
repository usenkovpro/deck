/** The shape of a timetable. Everything in Deck is built on these three types. */

export const DAY_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

/** School days, in the order they appear in the week view. */
export const SCHOOL_DAYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export type SlotKind = "lesson" | "break" | "lunch";

/**
 * A period in the school day. Slots are shared across every day — the times are the
 * same on Monday and Friday, only the lessons inside them change.
 */
export interface Slot {
  /** Period number as printed on the school timetable. */
  n: number;
  /** "HH:MM", 24-hour. */
  start: string;
  /** "HH:MM", 24-hour. */
  end: string;
  /** Defaults to "lesson". */
  type?: SlotKind;
  /** Shown instead of a subject for breaks and lunch. */
  label?: string;
}

export interface Lesson {
  /** Which slot this lesson sits in. */
  n: number;
  subject: string;
  teacher?: string | null;
  room?: string | null;
}

export interface Timetable {
  version: 1;
  meta?: {
    label?: string;
    asAt?: string;
  };
  slots: Slot[];
  /** Days may be omitted entirely — a missing day is a day with no lessons. */
  days: Partial<Record<DayKey, Lesson[]>>;
}

/**
 * One row on screen: a slot, plus whatever is happening in it. `kind` is "free" when
 * a lesson slot has nothing scheduled in it.
 */
export interface Entry {
  slot: Slot;
  kind: SlotKind | "free";
  lesson?: Lesson;
  /** Minutes from midnight, precomputed so sorting and comparing stay cheap. */
  startMin: number;
  endMin: number;
}
