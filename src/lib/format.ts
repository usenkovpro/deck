/** Small display helpers. Nothing here knows about the DOM. */

import type { DayKey } from "./types";

const LONG_DAY: Record<DayKey, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export function longDay(day: DayKey): string {
  return LONG_DAY[day];
}

/** "Mon 9 Sep" — short enough for the header on a 375px screen. */
export function shortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** "23 min left", "1 hr 5 min left". Minutes only below an hour — it reads faster. */
export function countdown(minutes: number): string {
  if (minutes <= 0) return "ending now";
  if (minutes < 60) return `${minutes} min left`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr left` : `${h} hr ${m} min left`;
}

/** How a future lesson is introduced: "at 09:55", "tomorrow 07:50", "Mon 07:50". */
export function whenLabel(day: DayKey, time: string, daysAhead: number): string {
  if (daysAhead === 0) return `at ${time}`;
  if (daysAhead === 1) return `tomorrow ${time}`;
  return `${day} ${time}`;
}

/** Teacher and room joined, skipping whichever is missing. */
export function detailLine(
  teacher?: string | null,
  room?: string | null,
): string {
  return [teacher, room].filter(Boolean).join(" · ");
}
