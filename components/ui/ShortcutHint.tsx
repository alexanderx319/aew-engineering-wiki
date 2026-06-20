import { C, F } from "../../lib/tokens";

export function ShortcutHint({ keys }: { keys: string[] }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {keys.map((k, i) => (
        <kbd key={i} style={{
          background:   C.surfaceLow,
          border:       `1px solid ${C.border}`,
          borderRadius: 4,
          padding:      "1px 6px",
          fontSize:     9,
          color:        C.textFaint,
          fontFamily:   F.mono,
        }}>
          {k}
        </kbd>
      ))}
    </span>
  );
}
