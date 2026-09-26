/** Ids for things the user creates. */
export function newId(): string {
  // randomUUID only exists on https and localhost. Deck is served from both, but a
  // fallback costs one line.
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
