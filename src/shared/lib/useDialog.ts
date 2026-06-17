"use client";
import { useEffect, useRef } from "react";

/**
 * Accessibility helper for modal sheets / overlays.
 *
 * While `open` is true it:
 *  - closes the dialog on the Escape key (calls `onClose`),
 *  - moves keyboard focus into the dialog (the element referenced by the
 *    returned `initialFocusRef`, falling back to the panel's first focusable
 *    element), and
 *  - restores focus to whatever element was focused before it opened.
 *
 * Returns refs to wire onto the dialog panel and the element that should
 * receive focus first.
 */
export function useDialog<
  P extends HTMLElement = HTMLDivElement,
  F extends HTMLElement = HTMLElement,
>(open: boolean, onClose: () => void) {
  const panelRef = useRef<P>(null);
  const initialFocusRef = useRef<F>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Remember the trigger so we can restore focus when the dialog closes.
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    // Move focus into the dialog: the explicit target, else the first focusable.
    const focusTarget =
      initialFocusRef.current ??
      panelRef.current?.querySelector<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ??
      panelRef.current;
    focusTarget?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Best-effort focus restore to the trigger.
      restoreRef.current?.focus?.();
    };
  }, [open, onClose]);

  return { panelRef, initialFocusRef };
}
