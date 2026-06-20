/** Generates a collision-resistant ID with a readable prefix. */
export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Returns today's date formatted for es-MX locale. */
export function today(): string {
  return new Date().toLocaleDateString("es-MX", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });
}

/** Case-insensitive substring search. Empty query always returns true. */
export function includesQuery(value: string, query: string): boolean {
  if (!query) return true;
  return value.toLowerCase().includes(query.toLowerCase());
}

/** Parses a comma-separated tag string into a clean array. */
export function parseTags(raw: string): string[] {
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}
