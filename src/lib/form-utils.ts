import type React from "react";

/**
 * Block non-numeric keystrokes at the input level so InputNumber doesn't
 * visually echo letters before sanitizing on blur. Allows digits, decimal
 * point, navigation keys, and modifier shortcuts (copy/paste/etc).
 */
export function blockNonNumericKeys(
  e: React.KeyboardEvent<HTMLInputElement>
): void {
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
    ".",
  ];
  if (allowed.includes(e.key)) return;
  if (e.ctrlKey || e.metaKey) return; // copy/paste/etc
  if (/^[0-9]$/.test(e.key)) return;
  e.preventDefault();
}
