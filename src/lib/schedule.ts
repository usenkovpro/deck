/**
 * Turning a timetable plus "what time is it" into what goes on screen.
 *
 * This is the brain of the app. Everything here is a pure function of (timetable,
 * date) so it can be reasoned about, and later tested, without a browser.
 */

import {
  SCHOOL_DAYS,
  DAY_KEYS,
  type DayKey,
  type Entry,
  type Timetable,
} from "./types";

/** "09:55" -> 595 minutes past midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

export function dayKeyOf(date: Date): DayKey {
  // Date.getDay() is 0 = Sunday; DAY_KEYS starts at Monday.
  return DAY_KEYS[(date.getDay() + 6) % 7];
}

export function minutesInto(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/** Seconds since midnight — the countdown needs finer resolution than minutes. */
export function secondsInto(date: Date): number {
  return minutesInto(date) * 60 + date.getSeconds();
}

/**
 * Every row for one day, in time order.
 *
 * Trailing breaks and lunches are dropped: Friday's lessons stop at 11:45, so
 * showing "Lunch 12:40" after them would be wrong — that lunch belongs to a school
 * day that has already ended.
 *
 * Leading ones are kept, though. Registration happens before the first lesson and is
 * still very much part of being at school on time.
 */
export function entriesFor(tt: Timetable, day: DayKey): Entry[] {
  const lessons = tt.days[day] ?? [];
  const byPeriod = new Map(lessons.map((l) => [l.n, l]));

  const entries: Entry[] = tt.slots.map((slot) => {
    const kind = slot.type ?? "lesson";
    const lesson = byPeriod.get(slot.n);
    return {
      slot,
      kind: kind === "lesson" && !lesson ? "free" : kind,
      lesson,
      startMin: toMinutes(slot.start),
      endMin: toMinutes(slot.end),
    };
  });

  entries.sort((a, b) => a.startMin - b.startMin);

  const lastLesson = entries.findLastIndex((e) => e.kind === "lesson");
  if (lastLesson === -1) return [];

  // Keep named periods that run straight on from the last lesson — an end-of-day
  // form time at 15:10 is part of the day. Drop ones separated by a gap: Friday's
  // lessons stop at 11:45, so the 12:40 lunch belongs to a day that isn't happening.
  let end = lastLesson;
  for (let i = lastLesson + 1; i < entries.length; i++) {
    const named = entries[i].kind === "break" || entries[i].kind === "lunch";
    if (!named || entries[i].startMin !== entries[i - 1].endMin) break;
    end = i;
  }
  return entries.slice(0, end + 1);
}

export interface NextUp {
  entry: Entry;
  day: DayKey;
  /** 0 = later today, 1 = tomorrow, and so on. */
  daysAhead: number;
}

export type NowState =
  | "lesson"
  | "break"
  | "lunch"
  | "free"
  | "before-school"
  | "after-school"
  | "no-school";

export interface Snapshot {
  day: DayKey;
  state: NowState;
  /** The period happening right now, if any. */
  current: Entry | null;
  /** Minutes until `current` ends — or, when nothing is on, until `next` starts. */
  minutesLeft: number | null;
  /** How far through the current period we are, 0–1. Null when nothing is on. */
  progress: number | null;
  next: NextUp | null;
  /** Periods still to come today, not including `current`. */
  remaining: Entry[];
  /** The first period of today, which may be registration rather than a lesson. */
  dayStart: Entry | null;
}

/** What is happening at `now`, and what happens after it. */
export function snapshot(tt: Timetable, now: Date): Snapshot {
  const day = dayKeyOf(now);
  const mins = minutesInto(now);
  const today = entriesFor(tt, day);

  const current = today.find((e) => mins >= e.startMin && mins < e.endMin) ?? null;
  const remaining = today.filter((e) => e.startMin > mins);
  const next = findNext(tt, day, mins);

  let state: NowState;
  if (current) {
    state = current.kind;
  } else if (today.length === 0) {
    state = "no-school";
  } else if (mins < today[0].startMin) {
    state = "before-school";
  } else {
    state = "after-school";
  }

  const dayStart = today[0] ?? null;

  // Mid-lesson we count down to the end of it; otherwise to whatever is next. Before
  // school that is the start of the day, not the first lesson — if registration is
  // at 07:45 then 07:45 is the time you have to be there, not 07:50.
  let minutesLeft: number | null = null;
  let progress: number | null = null;
  if (current) {
    minutesLeft = current.endMin - mins;
    progress = (mins - current.startMin) / (current.endMin - current.startMin);
  } else if (state === "before-school" && dayStart) {
    minutesLeft = dayStart.startMin - mins;
  } else if (next && next.daysAhead === 0) {
    minutesLeft = next.entry.startMin - mins;
  }

  return { day, state, current, minutesLeft, progress, next, remaining, dayStart };
}

/** The next actual lesson — skipping breaks, free periods, weekends and holidays. */
function findNext(tt: Timetable, from: DayKey, afterMin: number): NextUp | null {
  const start = DAY_KEYS.indexOf(from);

  for (let ahead = 0; ahead < 7; ahead++) {
    const day = DAY_KEYS[(start + ahead) % 7];
    const entry = entriesFor(tt, day).find(
      (e) => e.kind === "lesson" && (ahead > 0 || e.startMin > afterMin),
    );
    if (entry) return { entry, day, daysAhead: ahead };
  }
  return null;
}

/** Every subject in the timetable, in the order it is first taught in the week. */
export function subjectsInOrder(tt: Timetable): string[] {
  const out: string[] = [];
  for (const day of SCHOOL_DAYS) {
    for (const entry of entriesFor(tt, day)) {
      const subject = entry.lesson?.subject;
      if (subject && !out.includes(subject)) out.push(subject);
    }
  }
  return out;
}
