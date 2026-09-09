# Deck

A personal school timetable app. Static Astro build, no server, no accounts, no
network requests at all. Lives on a phone home screen.

## Non-negotiable rules

- **`design-system.md` is the single source of truth** for colour, type and spacing.
  Never write a raw hex value in a component — always use the CSS custom properties
  defined in `src/styles/global.css`.
- **`page-specs.md` is the source of truth** for what goes on each screen.
- **Mobile only.** Designed at 375px. Above 480px the layout centres in a 480px
  column. This is a phone app, not a responsive website.
- **Deck makes no network requests.** Not analytics, not fonts, not an API. If a
  change would add one, the change is wrong. Deck must work in aeroplane mode.
- **All storage goes through `src/lib/storage.ts`.** No other module touches
  `localStorage`.
- **Every screen renders with no timetable saved, and with corrupted saved data.**
  Bad data is treated as no data, with a message. Never a blank page, never a crash.
- **No emoji anywhere in the UI.** Icons are inline SVG using `currentColor`.
- **User text goes in through `textContent`, never `innerHTML`.**

## Privacy — the reason this app is built the way it is

A timetable contains a real student's name, class, teachers and room numbers. So:

1. **No personal timetable is ever committed.** Real data lives in `*.local.json`,
   which is gitignored. `my-timetable.local.json` is Igor's own copy.
2. The app ships **empty**. Everything is typed in or imported on the device.
3. Nothing is uploaded, because nothing can be — there is no network code.
4. Any example or placeholder data in the repo is made up.

## Project layout

```
design-system.md         Colour, type, spacing — read before styling anything
page-specs.md            What goes on each screen
src/lib/types.ts         Slot, Lesson, Timetable, Entry
src/lib/storage.ts       The only module that touches localStorage; validates on read
src/lib/schedule.ts      The brain: (timetable, date) -> what's on now and next
src/lib/subjects.ts      Subject colour assignment
src/lib/format.ts        Display helpers — no DOM
src/lib/render.ts        Building the period rows shared by Today and Week
src/layouts/BaseLayout.astro
src/pages/index.astro    Today
src/pages/week.astro     Week
src/pages/edit.astro     Tap-to-edit builder: lessons and period times
src/pages/setup.astro    Summary, import / export, delete
src/lib/edit.ts          Timetable mutations — each returns a new timetable
src/styles/global.css    All custom properties live here
src/styles/components.css  Shared component styles (global, because rows are built in JS)
```

## Why the rendering is done in JavaScript

The timetable lives in `localStorage`, which only exists on the device, so there is
nothing for Astro to render at build time. The pages ship as a static shell and fill
themselves in on load. That is also why `components.css` is a plain global
stylesheet — Astro's scoped styles cannot reach elements created at runtime.

## Development

```
npm run dev
```

Add `?at=2026-09-11T12:00` to the Today screen to preview any moment in time —
mid-lesson, break, after school, weekend — without waiting for the school day to get
there.

## Phases

1. **Timetable** — Today and Week screens, import via JSON. *(done)*
1b. **Tap-to-edit builder** — build and change a timetable without touching JSON.
    *(done)*
2. **Homework** — add homework against a subject with a due date, sorted by soonest.
3. **Install on the phone** — PWA, offline, home screen icon.
4. **Revision** — flashcards with spaced repetition.
5. Whatever the daily use suggests by then.

Phase 1b, still to do: a tap-to-edit timetable builder so Setup does not need JSON.
