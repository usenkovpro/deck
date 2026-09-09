# Deck — Page Specs

Three screens in Phase 1. Bottom nav switches between the first two; Setup is reached
from the header.

---

## `/` — Today

The screen that justifies the app. Answers "where am I now, and what's next".

**Header:** `DECK` wordmark left, the date right ("Mon 9 Sep"), a small gear linking
to `/setup`.

**Now card** — the only card with a shadow.
- Label: `NOW` (or `BREAK`, `LUNCH`)
- Subject in `--t-hero`
- Teacher · Room in `--t-sm` / `--text-2`
- A progress bar showing how far through the period we are
- Right-aligned: minutes remaining, e.g. `23 min left`

**States the Now card must handle:**
| Situation | What it says |
|---|---|
| In a lesson | The lesson, with countdown |
| In break or lunch | `BREAK` / `LUNCH`, with countdown to the next lesson |
| Before school | `SCHOOL STARTS` + time until first lesson |
| After school | `SCHOOL'S DONE` + the next school day |
| Weekend | `NO SCHOOL` + the next school day |
| Free period | `FREE` + countdown to the next lesson |

**Next up** — one row, the next lesson, with its start time.

**Rest of today** — the remaining periods as rows. Each row: subject colour rail,
subject, teacher · room, start–end time right-aligned in tabular figures. Periods
already finished are not shown.

**Empty state** (no timetable saved): a short line explaining Deck needs a timetable,
and a button to `/setup`. Never a blank screen.

---

## `/week` — Week

The whole week, but readable on a phone — so **no grid**. A grid at 375px is
unreadable, which is exactly why the paper timetable is annoying.

- A sticky row of day buttons: `MON TUE WED THU FRI`. Today is selected on load and
  marked with a dot.
- Below it, that day's periods as the same rows used on Today, in time order.
- Break and lunch appear as thin dividers with the time, not as full rows.
- Day totals at the bottom: first lesson, last lesson, number of lessons.

---

## `/setup` — Setup

Phase 1 is import-only. The tap-to-edit builder is Phase 1b.

- Explains in one line that everything stays on this device and nothing is uploaded.
- A textarea to paste timetable JSON.
- `Import` button — validates, and on failure shows exactly what's wrong
  (which field, which day) rather than a generic error.
- If a timetable is already saved: a summary line ("5 days, 33 lessons, 16 subjects"),
  an `Export` button that copies the JSON back out, and a `Clear` button with a
  confirm step.
- A collapsed `<details>` showing the expected JSON shape as an example.

---

## Rules that apply to every page

- Works at 375px with no horizontal scroll.
- Renders with no timetable saved, and with corrupted saved data — never a blank page
  and never a crash. Bad data is treated as no data, with a message.
- No network requests at all. Deck works in aeroplane mode; that is the point.
- All state lives in `localStorage` under `deck.timetable.v1`.
