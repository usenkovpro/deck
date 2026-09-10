# Deck

Your school timetable, on your phone, offline.

**[usenkovpro.github.io/deck](https://usenkovpro.github.io/deck/)** — open it on your
phone and add it to your home screen.

Deck answers one question fast: **where am I meant to be right now?** It shows the
lesson you are in, how long is left of it, and what is next. No login, no account,
no internet needed.

## Privacy

Deck has no network code. Your timetable is saved in your browser's local storage on
your own device and is never uploaded, because there is nowhere for it to go. The
app ships empty — you add your own timetable, and you can delete it at any time from
the Setup screen.

Personal timetables are never committed to this repo: real data belongs in a
`*.local.json` file, which git ignores.

## Screens

- **Today** — the lesson happening now with a countdown, then what's next, then the
  rest of the day.
- **Week** — pick a day, see it as a list. Deliberately not a grid: a grid is
  unreadable at 375px, which is the main thing wrong with a paper timetable.
- **Setup** — import, export and delete your timetable.

## Running it

```
npm install
npm run dev
```

Then open the address it prints.

To preview any moment of the school day without waiting for it, add `?at=` to the
Today screen:

```
http://localhost:4321/?at=2026-09-11T12:00
```

Time then runs forward normally from there, so the countdown still ticks.

## Adding your timetable

Open **Setup** and paste JSON in this shape:

```json
{
  "slots": [
    { "n": 1, "start": "07:50", "end": "08:45" },
    { "n": 2, "start": "08:45", "end": "09:40" },
    { "n": 3, "start": "09:40", "end": "09:55", "type": "break", "label": "Break" }
  ],
  "days": {
    "Mon": [
      { "n": 1, "subject": "Computer Science", "teacher": "Mrs R Chaudhry", "room": "2011" },
      { "n": 2, "subject": "Music", "teacher": "Mr N Jackson", "room": "1060" }
    ]
  }
}
```

`slots` are the period times, shared across every day. `days` says which subject sits
in which period. A period with no lesson shows as free; a day you leave out is a day
with no school. Import tells you exactly which field is wrong if something does not
fit.

## Built with

[Astro](https://astro.build), TypeScript, and no other dependencies.
