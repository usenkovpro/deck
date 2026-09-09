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

/** "19:20" — the clock, 24-hour to match how the timetable is printed. */
export function clockTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * A real ticking countdown: "37:24", or "1:05:30" once there is an hour to go.
 *
 * Seconds are shown rather than whole minutes because this is the number you watch
 * when you want the lesson to end — "38 min left" sitting still for a minute at a
 * time does not feel like a timer.
 */
export function timerText(seconds: number): string {
  if (seconds <= 0) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
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
