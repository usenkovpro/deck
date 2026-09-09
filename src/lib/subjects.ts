/**
 * Subject colours.
 *
 * Assigned in the order subjects are first taught in the week, so subjects that sit
 * next to each other on screen never land on the same hue. Per design-system.md a
 * subject colour is only ever a solid rail or dot, never text — which is why the
 * palette can be this vivid without any contrast problems in either theme.
 */

import { subjectsInOrder } from "./schedule";
import type { Timetable } from "./types";

/** Sixteen hues, because a full Year 9 timetable really does run to 16 subjects. */
const PALETTE_SIZE = 16;

export function subjectColours(tt: Timetable): Map<string, string> {
  const map = new Map<string, string>();
  subjectsInOrder(tt).forEach((subject, i) => {
    map.set(subject, `var(--sub-${(i % PALETTE_SIZE) + 1})`);
  });
  return map;
}
