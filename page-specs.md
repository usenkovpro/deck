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
- Right-aligned: the **dial** — a small clock face with the countdown in the middle,
  ticking every second
- Bottom left: the current period's times, or how long until the next lesson starts

**The dial always tracks a lesson, never a break.** In a lesson it counts that lesson
down and the ring empties with it. The rest of the time it sits full at the next
lesson's whole length — during break you see the 55:00 waiting for you, not the break
draining away — while the time until it starts ticks down as text beside it. When
there is no lesson left today, the dial is not shown at all.

The two must join up: at the moment the lesson starts, a dial reading 55:00 has to
carry straight on to 54:59, never jump.

**States the Now card must handle:**
| Situation | What it says |
|---|---|
| In a lesson | The lesson, with countdown |
| In break or lunch | The period's own name — `BREAK`, `LUNCH`, `REGISTRATION` — with a countdown |
| Before school | `SCHOOL STARTS` + time until the day starts, which may be registration rather than the first lesson |
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

## `/edit` — Edit

Building a timetable by tapping. Every change saves immediately; there is no save
button to forget to press.

Two tabs:

- **Lessons** — the day bar, then every teaching period of that day as a row. A
  period with a lesson shows it; an empty one says "Add lesson". Tapping opens a
  dialog for subject, teacher and room. The subject field autocompletes from
  subjects already used, so the same subject is not typed five slightly different
  ways across the week.
- **Times** — every period with its start and end. Tapping edits it; there is also
  `Add a period`. Periods are typed as lesson, break or lunch.

Rules:

- Periods are numbered by **counting only the teaching ones**. The `n` on a slot is
  an internal id, and breaks use up numbers, so showing `n` would label a six-lesson
  day "Period 1, 2, 4, 5, 7, 8".
- **Overlapping periods are refused**, naming the period that clashes. Two periods
  running at once makes "what's on now" meaningless.
- Deleting a period also deletes the lessons in it, and says how many.
- Nothing is written to storage until it passes the same validation the loader uses.
  A change that saved but would not load again is indistinguishable, to the user,
  from their timetable vanishing.
- First run, with nothing saved: offer a generic school day to adjust, because an
  empty Lessons tab has no rows to tap and no way out.

## `/setup` — Setup

The hub, not the editor.

- Explains in one line that everything stays on this device and nothing is uploaded.
- A summary line ("5 days · 32 lessons · 16 subjects") and the primary button through
  to `/edit`.
- A collapsed `<details>` for JSON import and export — for backups and moving to
  another phone, not the everyday path.
- `Import` validates, and on failure shows exactly what's wrong (which field, which
  day) rather than a generic error.
- A delete button that needs two taps. A confirm dialog is too easy to dismiss by
  accident on a phone.

---

## Rules that apply to every page

- Works at 375px with no horizontal scroll.
- Renders with no timetable saved, and with corrupted saved data — never a blank page
  and never a crash. Bad data is treated as no data, with a message.
- No network requests at all. Deck works in aeroplane mode; that is the point.
- All state lives in `localStorage` under `deck.timetable.v1`.
