# Deck — Design System

The single source of truth for colour, type and spacing. Never write a raw hex value
in a component. Every colour comes from a custom property defined in
`src/styles/global.css`.

## The idea

Deck is opened at 07:45 on a phone, outdoors, in Dubai sunlight, by someone who is
half awake and walking. It has about two seconds to answer one question: **where am I
meant to be right now?**

So: big first line, huge contrast, no decoration that isn't carrying information.
This is the opposite of a dashboard. One answer, then the detail underneath.

## Colour

Light is the default, because the phone is used outside in bright sun where dark
screens wash out. Dark mode follows the system setting.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f4f6f8` | `#0e1116` | Page background |
| `--surface` | `#ffffff` | `#171b22` | Cards, rows |
| `--surface-2` | `#eef1f5` | `#1f242c` | Pressed / secondary fill |
| `--text-1` | `#12151a` | `#f2f5f9` | Headlines, subject names |
| `--text-2` | `#5b6472` | `#9aa4b2` | Teacher, room, times |
| `--text-3` | `#8b95a3` | `#69727f` | Labels, disabled, fallbacks |
| `--line` | `#e2e7ec` | `#252b34` | Borders, dividers |
| `--accent` | `#2563eb` | `#6b9bff` | Links, "now", focus rings |
| `--bad` | `#c62f24` | `#ff6b5e` | Errors and overdue only |

`--bad` is for things that are wrong. It is never used for emphasis.

### Subject colours

Sixteen hues, assigned automatically in order of first appearance in the timetable,
so two subjects that sit next to each other never get the same colour. Sixteen because
that is what a full Year 9 timetable actually needs — with ten, two subjects on the
same day collided.

A subject colour is **only ever used as a solid shape** — a 3px rail down the left of
a row, or a dot. Never as text colour and never as a background behind text. That way
the palette can be vivid without any contrast problems in either theme.

`--sub-1` … `--sub-16` in `global.css`.

## Type

System font stack — it loads instantly and looks native, which matters more than
personality on a screen you look at for two seconds.

| Token | Size | Use |
|---|---|---|
| `--t-hero` | `2rem` / 700 | The subject you are in right now |
| `--t-lg` | `1.25rem` / 600 | Next lesson, day headings |
| `--t-md` | `1rem` / 500 | Subject name in a row |
| `--t-sm` | `0.875rem` | Teacher, room |
| `--t-xs` | `0.75rem` / 600 / `0.06em` tracking / uppercase | Section labels |

Times are set in `font-variant-numeric: tabular-nums` everywhere, so digits line up
in a column and don't jitter when the countdown ticks.

## Spacing

A 4px scale. `--s-1` 4px, `--s-2` 8px, `--s-3` 12px, `--s-4` 16px, `--s-5` 24px,
`--s-6` 32px, `--s-7` 48px.

Page gutter is `--s-4` (16px). Rows are 56px minimum so they're comfortable to tap.

## Radius and depth

`--r-sm` 8px, `--r-md` 12px, `--r-lg` 16px. One shadow, `--shadow`, used only on the
"now" card so it lifts off the page. Everything else is flat with a `--line` border.

## Rules

- **Mobile only.** Designed at 375px. Above 480px the layout simply centres in a
  480px column — this is a phone app, not a responsive website.
- **Tap targets are 44px minimum.**
- **No emoji, no icon font.** Any icon is inline SVG using `currentColor`.
- **Nothing animates except the progress bar and page transitions.** No bounce.
- **It must render with no timetable saved.** The empty state is a designed screen,
  not an accident.
