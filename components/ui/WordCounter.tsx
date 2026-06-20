import { C, F } from "../../lib/tokens";

interface WordCounterProps {
  text: string;
}

export function WordCounter({ text }: WordCounterProps) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const lines = text.split("\n").length;

  return (
    <div style={{ display: "flex", gap: 16, color: C.textFaint, fontSize: 10, fontFamily: F.mono }}>
      <span>{words} palabra{words !== 1 ? "s" : ""}</span>
      <span>{chars} caracteres</span>
      <span>{lines} línea{lines !== 1 ? "s" : ""}</span>
    </div>
  );
}
