/**
 * What time it is, in one place.
 *
 * Normally just `new Date()` — but `?at=2026-09-11T12:00` pretends it is another
 * moment, so every state (mid-lesson, break, weekend) can be checked without waiting
 * for the school day to reach it. The header reads from here too, so the clock on
 * screen never disagrees with the countdown underneath it.
 */
/** The `?at` value, if it is a time we can actually use. */
function pretendStart(): Date | null {
  const at = new URLSearchParams(location.search).get("at");
  if (!at) return null;
  const pretend = new Date(at);
  return Number.isNaN(pretend.getTime()) ? null : pretend;
}

/**
 * Whether the app is showing a pretend time rather than the real one.
 *
 * This has to be visible on screen. A preview that looks exactly like the real app
 * will eventually be mistaken for it, and being told the wrong lesson is happening
 * is the single worst thing Deck can do.
 */
export function isPreview(): boolean {
  return pretendStart() !== null;
}

/** Milliseconds between the pretend time and the real one. Zero unless `?at` is set. */
let offset: number | null = null;

export function currentTime(): Date {
  const real = Date.now();

  if (offset === null) {
    const pretend = pretendStart();
    offset = pretend ? pretend.getTime() - real : 0;
  }

  // The offset is fixed once and then added to the real clock, so a previewed moment
  // still runs forward second by second. Freezing it would make the countdown sit
  // still, which is the one thing a timer must not do.
  return new Date(real + offset);
}
