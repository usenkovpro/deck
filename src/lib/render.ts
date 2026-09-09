/**
 * Building DOM for the rows that Today and Week share.
 *
 * Everything user-supplied goes in through `textContent`, never `innerHTML`. A
 * subject called `<img onerror=...>` is then just a weird subject name instead of
 * code the page runs.
 */

import { detailLine } from "./format";
import type { Entry } from "./types";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** One period as a row: colour rail, subject, teacher · room, start–end. */
export function periodRow(entry: Entry, colours: Map<string, string>): HTMLElement {
  const row = el("li", "row");

  const rail = el("span", "row-rail");
  const subject = entry.lesson?.subject;
  if (subject) rail.style.setProperty("--rail", colours.get(subject) ?? "");
  row.append(rail);

  const main = el("div", "row-main");
  if (entry.kind === "free") {
    row.classList.add("is-free");
    main.append(el("div", "row-subject", "Free"));
  } else {
    main.append(el("div", "row-subject", subject ?? entry.slot.label ?? "Lesson"));
    const detail = detailLine(entry.lesson?.teacher, entry.lesson?.room);
    if (detail) main.append(el("div", "row-detail", detail));
  }
  row.append(main);

  const time = el("div", "row-time tnum");
  time.append(el("div", undefined, entry.slot.start));
  time.append(el("div", "row-end", entry.slot.end));
  row.append(time);

  return row;
}

/** Break and lunch: a thin labelled divider rather than a full row. */
export function dividerRow(entry: Entry): HTMLElement {
  const label = entry.slot.label ?? (entry.kind === "lunch" ? "Lunch" : "Break");
  const item = el("li", "divider", `${label} · ${entry.slot.start}`);
  return item;
}

/** A row for any entry — the caller does not need to know which kind it got. */
export function entryRow(entry: Entry, colours: Map<string, string>): HTMLElement {
  return entry.kind === "break" || entry.kind === "lunch"
    ? dividerRow(entry)
    : periodRow(entry, colours);
}

/** The designed no-timetable screen. Never leave a page blank. */
export function emptyState(
  heading: string,
  body: string,
  action?: { href: string; label: string },
): HTMLElement {
  const box = el("div", "empty");
  box.append(el("h2", undefined, heading));
  box.append(el("p", undefined, body));
  if (action) {
    const link = el("a", "btn", action.label);
    link.href = action.href;
    box.append(link);
  }
  return box;
}
