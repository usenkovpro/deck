/**
 * Reading and writing the timetable and homework. This is the only module that
 * touches localStorage — nothing else in Deck should know where the data lives.
 *
 * Everything stays on the device. Deck makes no network requests, ever.
 */

import {
  DAY_KEYS,
  type DayKey,
  type Homework,
  type Kit,
  type Timetable,
} from "./types";

const KEY = "deck.timetable.v1";

export type ParseResult =
  | { ok: true; value: Timetable }
  | { ok: false; error: string };

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Validates untrusted JSON into a Timetable. Errors name the exact field that is
 * wrong — "days.Wed[2].subject is missing" is a fixable message, "invalid JSON"
 * is not.
 */
export function parseTimetable(input: unknown): ParseResult {
  const fail = (error: string): ParseResult => ({ ok: false, error });

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return fail("The top level should be an object like { slots: [...], days: {...} }");
  }
  const raw = input as Record<string, unknown>;

  if (!Array.isArray(raw.slots) || raw.slots.length === 0) {
    return fail("slots is missing, or is not a non-empty array");
  }

  const slots = [];
  const seen = new Set<number>();
  for (let i = 0; i < raw.slots.length; i++) {
    const s = raw.slots[i] as Record<string, unknown>;
    const at = `slots[${i}]`;
    if (typeof s !== "object" || s === null) return fail(`${at} is not an object`);
    if (typeof s.n !== "number" || !Number.isFinite(s.n)) {
      return fail(`${at}.n must be a number (the period number)`);
    }
    if (seen.has(s.n)) return fail(`${at}.n = ${s.n} is used twice`);
    seen.add(s.n);
    if (typeof s.start !== "string" || !TIME.test(s.start)) {
      return fail(`${at}.start must be a time like "09:55"`);
    }
    if (typeof s.end !== "string" || !TIME.test(s.end)) {
      return fail(`${at}.end must be a time like "10:50"`);
    }
    if (s.end <= s.start) {
      return fail(`${at} ends at ${s.end}, which is not after its start ${s.start}`);
    }
    const type = s.type ?? "lesson";
    if (type !== "lesson" && type !== "break" && type !== "lunch") {
      return fail(`${at}.type must be "lesson", "break" or "lunch"`);
    }
    slots.push({
      n: s.n,
      start: s.start,
      end: s.end,
      type,
      label: typeof s.label === "string" ? s.label : undefined,
    });
  }
  slots.sort((a, b) => a.start.localeCompare(b.start));

  if (typeof raw.days !== "object" || raw.days === null || Array.isArray(raw.days)) {
    return fail("days is missing, or is not an object keyed by Mon, Tue, ...");
  }

  const days: Timetable["days"] = {};
  for (const [key, value] of Object.entries(raw.days as Record<string, unknown>)) {
    if (!(DAY_KEYS as readonly string[]).includes(key)) {
      return fail(`days.${key} is not a day — use ${DAY_KEYS.join(", ")}`);
    }
    if (!Array.isArray(value)) return fail(`days.${key} must be an array of lessons`);

    const lessons = [];
    for (let i = 0; i < value.length; i++) {
      const l = value[i] as Record<string, unknown>;
      const at = `days.${key}[${i}]`;
      if (typeof l !== "object" || l === null) return fail(`${at} is not an object`);
      if (typeof l.n !== "number") return fail(`${at}.n must be a period number`);
      if (!seen.has(l.n)) return fail(`${at}.n = ${l.n} has no matching slot`);
      if (typeof l.subject !== "string" || l.subject.trim() === "") {
        return fail(`${at}.subject is missing`);
      }
      lessons.push({
        n: l.n,
        subject: l.subject.trim(),
        teacher: typeof l.teacher === "string" ? l.teacher : null,
        room: typeof l.room === "string" ? l.room : null,
      });
    }
    days[key as DayKey] = lessons;
  }

  const meta = (raw.meta ?? {}) as Record<string, unknown>;
  return {
    ok: true,
    value: {
      version: 1,
      meta: {
        label: typeof meta.label === "string" ? meta.label : undefined,
        asAt: typeof meta.asAt === "string" ? meta.asAt : undefined,
      },
      slots,
      days,
    },
  };
}

/**
 * The saved timetable, or null. Data that fails validation is treated as no data —
 * a corrupted save should show the empty state, not a blank screen.
 */
export function loadTimetable(): Timetable | null {
  let text: string | null = null;
  try {
    text = localStorage.getItem(KEY);
  } catch {
    return null; // Private browsing, storage disabled — behave like a first run.
  }
  if (!text) return null;

  try {
    const parsed = parseTimetable(JSON.parse(text));
    return parsed.ok ? parsed.value : null;
  } catch {
    return null;
  }
}

export function saveTimetable(tt: Timetable): void {
  localStorage.setItem(KEY, JSON.stringify(tt));
}

export function clearTimetable(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing saved anyway */
  }
}

// --- Homework --------------------------------------------------------------

const HOMEWORK_KEY = "deck.homework.v1";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Homework from untrusted JSON. Unlike the timetable, a bad item is dropped rather
 * than the whole list: throwing away every piece of homework because one entry is
 * malformed would be far worse than losing that one entry.
 */
export function parseHomework(input: unknown): Homework[] {
  if (!Array.isArray(input)) return [];

  const out: Homework[] = [];
  for (const raw of input) {
    if (typeof raw !== "object" || raw === null) continue;
    const h = raw as Record<string, unknown>;
    if (typeof h.id !== "string" || h.id === "") continue;
    if (typeof h.subject !== "string" || h.subject.trim() === "") continue;
    if (typeof h.title !== "string" || h.title.trim() === "") continue;
    if (typeof h.due !== "string" || !DATE.test(h.due)) continue;

    out.push({
      id: h.id,
      subject: h.subject.trim(),
      title: h.title.trim(),
      due: h.due,
      done: h.done === true,
      created: typeof h.created === "number" ? h.created : 0,
    });
  }
  return out;
}

export function loadHomework(): Homework[] {
  try {
    const text = localStorage.getItem(HOMEWORK_KEY);
    return text ? parseHomework(JSON.parse(text)) : [];
  } catch {
    return []; // Storage disabled or corrupt JSON: behave like there is none.
  }
}

export function saveHomework(items: Homework[]): void {
  localStorage.setItem(HOMEWORK_KEY, JSON.stringify(items));
}

// --- Bag list --------------------------------------------------------------

const KIT_KEY = "deck.kit.v1";
const PACKED_KEY = "deck.packed.v1";

/** Trimmed, non-empty, and without case-insensitive duplicates. */
function cleanItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const raw of value) {
    if (typeof raw !== "string") continue;
    const item = raw.trim();
    if (item && !out.some((o) => o.toLowerCase() === item.toLowerCase())) out.push(item);
  }
  return out;
}

/** Bad data becomes an empty kit, never a crash. Subjects left empty are dropped. */
export function parseKit(input: unknown): Kit {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const bySubject: Record<string, string[]> = {};
  if (typeof raw.bySubject === "object" && raw.bySubject !== null) {
    for (const [subject, items] of Object.entries(raw.bySubject)) {
      const clean = cleanItems(items);
      if (subject.trim() && clean.length > 0) bySubject[subject.trim()] = clean;
    }
  }
  return { everyDay: cleanItems(raw.everyDay), bySubject };
}

export function loadKit(): Kit {
  try {
    const text = localStorage.getItem(KIT_KEY);
    return parseKit(text ? JSON.parse(text) : null);
  } catch {
    return parseKit(null);
  }
}

export function saveKit(kit: Kit): void {
  localStorage.setItem(KIT_KEY, JSON.stringify(kit));
}

/**
 * What has been ticked as packed, for one date. Only the date being packed for is
 * kept, so yesterday's ticks cannot carry over and claim tomorrow's bag is ready.
 */
export function loadPacked(date: string): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(PACKED_KEY) ?? "null");
    return raw && raw.date === date ? cleanItems(raw.items) : [];
  } catch {
    return [];
  }
}

export function savePacked(date: string, items: string[]): void {
  localStorage.setItem(PACKED_KEY, JSON.stringify({ date, items }));
}
