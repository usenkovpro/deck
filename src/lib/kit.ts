/**
 * What to put in your bag.
 *
 * Pure functions of (timetable, kit, snapshot), like schedule.ts. Nothing here
 * touches the DOM or storage.
 */

import { entriesFor, type Snapshot } from "./schedule";
import type { DayKey, Kit, Timetable } from "./types";

export interface BagItem {
  item: string;
  /** Which of the day's subjects need it. Empty for every-day items. */
  subjects: string[];
}

/**
 * Everything needed on `day`: the every-day items first, then subject kit in the
 * order the lessons happen. An item two subjects both need appears once, naming
 * both — a calculator for Maths and Science is still one calculator.
 */
export function bagFor(tt: Timetable, kit: Kit, day: DayKey): BagItem[] {
  const lessons = entriesFor(tt, day).filter((e) => e.kind === "lesson");
  if (lessons.length === 0) return [];

  const bag: BagItem[] = kit.everyDay.map((item) => ({ item, subjects: [] }));
  const find = (item: string) =>
    bag.find((b) => b.item.toLowerCase() === item.toLowerCase());

  for (const entry of lessons) {
    const subject = entry.lesson!.subject;
    for (const item of kit.bySubject[subject] ?? []) {
      const existing = find(item);
      if (!existing) {
        // Capitalised for display, so "calculator" typed under Science and
        // "Calculator" under Maths read the same whichever lesson comes first.
        const label = item.charAt(0).toUpperCase() + item.slice(1);
        bag.push({ item: label, subjects: [subject] });
      } else if (existing.subjects.length > 0 && !existing.subjects.includes(subject)) {
        existing.subjects.push(subject);
      }
    }
  }
  return bag;
}

/**
 * The day the bag is for.
 *
 * Before and during school, today. Once school is over — or on a day with none — the
 * next school day, because the bag gets packed the evening before, and a list of
 * what today needed is no use at 9pm.
 */
export function packingDay(snap: Snapshot): { day: DayKey; daysAhead: number } | null {
  if (snap.state === "after-school" || snap.state === "no-school") {
    return snap.next ? { day: snap.next.day, daysAhead: snap.next.daysAhead } : null;
  }
  return { day: snap.day, daysAhead: 0 };
}
