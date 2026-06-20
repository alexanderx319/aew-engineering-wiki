import type React from "react";
import { C, F } from "../../lib/tokens";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split("\n");
  const blocks: React.ReactElement[] = [];
  let paragraph: string[] = [];
  let code: string[]       = [];
  let inCode               = false;

  const flushParagraph = (key: string) => {
    if (!paragraph.length) return;
    blocks.push(
      <p key={key} style={{ color: C.textBody, fontSize: 14, lineHeight: 1.8, margin: "2px 0", fontFamily: F.mono, whiteSpace: "pre-wrap" }}>
        {paragraph.join("\n")}
      </p>
    );
    paragraph = [];
  };

  const flushCode = (key: string) => {
    if (!code.length) return;
    blocks.push(
      <pre key={key} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, color: "#c7f9ff", overflowX: "auto", fontSize: 12, lineHeight: 1.7, fontFamily: F.code, whiteSpace: "pre", margin: 0 }}>
        <code>{code.join("\n")}</code>
      </pre>
    );
    code = [];
  };

  lines.forEach((rawLine, index) => {
    const line    = rawLine.trimEnd();
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) { flushCode(`code-${index}`); inCode = false; }
      else        { flushParagraph(`p-${index}`); inCode = true; }
      return;
    }
    if (inCode) { code.push(rawLine); return; }

    if (trimmed.startsWith("### ")) {
      flushParagraph(`p-${index}`);
      blocks.push(<h3 key={`h3-${index}`} style={{ color: "#9a90ff", fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8, fontFamily: F.mono }}>{trimmed.slice(4)}</h3>);
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushParagraph(`p-${index}`);
      blocks.push(<h2 key={`h2-${index}`} style={{ color: C.primary, fontSize: 16, fontWeight: 700, marginTop: 24, marginBottom: 8, fontFamily: F.mono }}>{trimmed.slice(3)}</h2>);
      return;
    }
    if (trimmed === "") {
      flushParagraph(`p-${index}`);
      blocks.push(<div key={`gap-${index}`} style={{ height: 10 }} />);
      return;
    }
    paragraph.push(rawLine);
  });

  flushParagraph("p-end");
  if (inCode) flushCode("code-end");

  return <div style={{ display: "grid", gap: 4 }}>{blocks}</div>;
}
