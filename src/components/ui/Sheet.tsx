"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import "./ui.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The one modal. Product detail and "How it works" are both content passed in.
 * Full-height panel over a dimmed backdrop; Esc and backdrop close it, focus is
 * trapped while open and returned to the trigger afterwards, body scroll locks.
 *
 * `inset` is how much of the page stays visible on the left: the gallery
 * sheet leaves 144px, the Ramp homescreen sheet leaves the 221px sidebar.
 */
export function Sheet({
  open,
  onClose,
  label,
  inset = "gallery",
  gutter = 95,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  inset?: "gallery" | "sidebar";
  /** Left padding of the content; the About frame uses 84, the product frame 95. */
  gutter?: number;
  children: ReactNode;
}) {
  // Mounted while open, and until the exit animation has finished.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);

  // Scroll lock, focus in, focus back out, Esc, and the Tab trap. Runs once the
  // panel is actually mounted so there is something to focus.
  useEffect(() => {
    if (!open || !present) return;
    trigger.current = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>(".sheetClose")?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      trigger.current?.focus?.();
    };
  }, [open, present, onClose]);

  if (!present) return null;

  return (
    <div className={`sheet sheet--${inset}`} data-state={open ? "open" : "closed"}>
      <div className="sheetBackdrop" onClick={onClose} />
      <div
        ref={panel}
        className="sheetPanel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onAnimationEnd={(event) => {
          if (!open && event.target === event.currentTarget) setPresent(false);
        }}
        style={{ "--sheet-gutter": `${gutter}px` } as CSSProperties}
      >
        <button type="button" className="sheetClose" onClick={onClose} aria-label="Close">
          <img src="/store/close.svg" alt="" aria-hidden width={24} height={24} />
        </button>
        <div className="sheetBody">{children}</div>
      </div>
    </div>
  );
}
