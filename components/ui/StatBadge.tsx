import { C, F } from "../../lib/tokens";

interface StatBadgeProps {
  label:  string;
  value:  number | string;
  color?: string;
}

export function StatBadge({ label, value, color = C.primary }: StatBadgeProps) {
  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          6,
      background:   color + "18",
      border:       `1px solid ${color}33`,
      borderRadius: 20,
      padding:      "3px 10px",
      fontSize:     11,
      fontFamily:   F.mono,
      color:        color,
    }}>
      <span style={{ fontWeight: 700 }}>{value}</span>
      <span style={{ color: C.textMuted, fontSize: 10 }}>{label}</span>
    </span>
  );
}
