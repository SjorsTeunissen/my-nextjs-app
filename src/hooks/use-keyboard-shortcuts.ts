"use client";

import { useEffect, useRef } from "react";

export interface Shortcut {
  key: string;
  modifier?: "ctrl" | "meta" | "alt" | "shift";
  action: () => void;
  description: string;
}

export interface SequenceShortcut {
  keys: string[];
  action: () => void;
  description: string;
}

export interface UseKeyboardShortcutsOptions {
  shortcuts?: Shortcut[];
  sequences?: SequenceShortcut[];
}

const SEQUENCE_TIMEOUT = 1000;

function isInputTarget(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  if (!target || !target.tagName) return false;
  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    target.isContentEditable
  );
}

export function useKeyboardShortcuts({
  shortcuts = [],
  sequences = [],
}: UseKeyboardShortcutsOptions) {
  const sequenceBuffer = useRef<string[]>([]);
  const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (isInputTarget(event)) return;

      // Check single-key shortcuts with modifiers first
      for (const shortcut of shortcuts) {
        const modifierMatch =
          (!shortcut.modifier && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) ||
          (shortcut.modifier === "ctrl" && event.ctrlKey) ||
          (shortcut.modifier === "meta" && event.metaKey) ||
          (shortcut.modifier === "alt" && event.altKey) ||
          (shortcut.modifier === "shift" && event.shiftKey);

        if (event.key.toLowerCase() === shortcut.key.toLowerCase() && modifierMatch) {
          event.preventDefault();
          shortcut.action();
          // Reset sequence buffer on single-key match
          sequenceBuffer.current = [];
          if (sequenceTimer.current) {
            clearTimeout(sequenceTimer.current);
            sequenceTimer.current = null;
          }
          return;
        }
      }

      // Handle sequence shortcuts
      if (sequences.length > 0) {
        sequenceBuffer.current.push(event.key.toLowerCase());

        if (sequenceTimer.current) {
          clearTimeout(sequenceTimer.current);
        }

        for (const seq of sequences) {
          const seqKeys = seq.keys.map((k) => k.toLowerCase());
          const bufferLen = sequenceBuffer.current.length;
          const seqLen = seqKeys.length;

          if (bufferLen >= seqLen) {
            const lastN = sequenceBuffer.current.slice(bufferLen - seqLen);
            if (lastN.every((k, i) => k === seqKeys[i])) {
              event.preventDefault();
              seq.action();
              sequenceBuffer.current = [];
              return;
            }
          }
        }

        sequenceTimer.current = setTimeout(() => {
          sequenceBuffer.current = [];
          sequenceTimer.current = null;
        }, SEQUENCE_TIMEOUT);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimer.current) {
        clearTimeout(sequenceTimer.current);
      }
    };
  }, [shortcuts, sequences]);
}
