/**
 * What time it is, in one place.
 *
 * Normally just `new Date()` — but `?at=2026-09-11T12:00` pretends it is another
 * moment, so every state (mid-lesson, break, weekend) can be checked without waiting
 * for the school day to reach it. The header reads from here too, so the clock on
 * screen never disagrees with the countdown underneath it.
 */
/** Milliseconds between the pretend time and the real one. Zero unless `?at` is set. */
let offset: number | null = null;

export function currentTime(): Date {
  const real = Date.now();

  if (offset === null) {
    const at = new URLSearchParams(location.search).get("at");
    const pretend = at ? new Date(at) : null;
    offset =
      pretend && !Number.isNaN(pretend.getTime()) ? pretend.getTime() - real : 0;
  }

  // The offset is fixed once and then added to the real clock, so a previewed moment
  // still runs forward second by second. Freezing it would make the countdown sit
  // still, which is the one thing a timer must not do.
  return new Date(real + offset);
}
