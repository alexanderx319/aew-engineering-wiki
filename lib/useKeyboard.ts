"use client";

import { useEffect } from "react";

interface KeyboardShortcuts {
  onSearch:     () => void;
  onNewSection: () => void;
  onEscape:     () => void;
}

export function useKeyboard({ onSearch, onNewSection, onEscape }: KeyboardShortcuts) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      // Ctrl+K or Cmd+K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        onSearch();
        return;
      }

      // Escape → close/cancel
      if (e.key === "Escape") {
        onEscape();
        return;
      }

      // N → new section (only when not typing)
      if (!isTyping && e.key === "n" && !e.ctrlKey && !e.metaKey) {
        onNewSection();
        return;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSearch, onNewSection, onEscape]);
}
