// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { renderHook, cleanup, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

describe("useKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("calls action when shortcut key is pressed", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: "n", action, description: "Test" }],
      })
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n" }));
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("supports modifier keys", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: "n", modifier: "ctrl", action, description: "Test" }],
      })
    );

    // Without modifier -- should not fire
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n" }));
    expect(action).not.toHaveBeenCalled();

    // With modifier -- should fire
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", ctrlKey: true })
    );
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("does not fire when focus is in an input element", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: "n", action, description: "Test" }],
      })
    );

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", bubbles: true })
    );
    expect(action).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("does not fire when focus is in a textarea element", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: "n", action, description: "Test" }],
      })
    );

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    textarea.focus();

    textarea.dispatchEvent(
      new KeyboardEvent("keydown", { key: "n", bubbles: true })
    );
    expect(action).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it("handles sequence shortcuts (G then I)", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        sequences: [{ keys: ["g", "i"], action, description: "Test" }],
      })
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));

    expect(action).toHaveBeenCalledTimes(1);
  });

  it("resets sequence after timeout", () => {
    const action = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        sequences: [{ keys: ["g", "i"], action, description: "Test" }],
      })
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));

    // Advance past the 1000ms timeout
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "i" }));

    expect(action).not.toHaveBeenCalled();
  });

  it("cleans up listeners on unmount", () => {
    const action = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts: [{ key: "n", action, description: "Test" }],
      })
    );

    unmount();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "n" }));
    expect(action).not.toHaveBeenCalled();
  });

  it("handles multiple sequence shortcuts independently", () => {
    const actionGI = vi.fn();
    const actionGS = vi.fn();
    renderHook(() =>
      useKeyboardShortcuts({
        sequences: [
          { keys: ["g", "i"], action: actionGI, description: "Go to invoices" },
          { keys: ["g", "s"], action: actionGS, description: "Go to settings" },
        ],
      })
    );

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "g" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "s" }));

    expect(actionGS).toHaveBeenCalledTimes(1);
    expect(actionGI).not.toHaveBeenCalled();
  });
});
