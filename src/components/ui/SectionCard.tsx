"use client";

import Link from "next/link";
import "./ui.css";

export type SectionTone = "aisle" | "fruits" | "fridge";

/**
 * Market section card (name, caret, blurb). `active` is driven by the shared
 * selector state, so hovering the card and hovering the shelf look identical.
 */
export function SectionCard({
  href,
  tone,
  name,
  blurb,
  active,
  onActivate,
  onDeactivate,
}: {
  href: string;
  tone?: SectionTone;
  name: string;
  blurb: string;
  active: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <Link
      href={href}
      className={tone ? `sectionCard sectionCard--${tone}` : "sectionCard"}
      data-active={active}
      onMouseEnter={onActivate}
      onMouseLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <span className="sectionCardHead">
        <span className="sectionCardName">{name}</span>
        <img className="sectionCardCaret" src="/store/caret-right.svg" alt="" aria-hidden />
      </span>
      <span className="sectionCardBlurb">{blurb}</span>
    </Link>
  );
}
