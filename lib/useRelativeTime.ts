/**
 * Converts a date string like "Jun 10, 2026" to relative text.
 * "hoy", "ayer", "hace 3 días", "hace 2 semanas", etc.
 */
export function relativeTime(dateStr: string): string {
  if (!dateStr) return "";

  const now   = new Date();
  const date  = new Date(dateStr);

  // If parsing failed, return original
  if (isNaN(date.getTime())) return dateStr;

  const diffMs   = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0)  return "hoy";
  if (diffDays === 1)  return "ayer";
  if (diffDays < 7)   return `hace ${diffDays} días`;
  if (diffDays < 14)  return "hace 1 semana";
  if (diffDays < 30)  return `hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 60)  return "hace 1 mes";
  if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`;
  return `hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) > 1 ? "s" : ""}`;
}
