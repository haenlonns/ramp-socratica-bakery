import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ui.css";

type Variant = "soft" | "tint" | "outline";

type Props = {
  variant?: Variant;
  block?: boolean;
  className?: string;
  children: ReactNode;
  /** Renders a link instead of a button. */
  href?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * Pill button. `soft` is the blue Add to Cart / Get started; `tint` and
 * `outline` are the receipt pair.
 */
export function Button({ variant = "soft", block, className, children, href, ...buttonProps }: Props) {
  const classes = ["btn", `btn--${variant}`, block ? "btn--block" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  if (href !== undefined) {
    return <Link href={href} className={classes}>{children}</Link>;
  }
  return (
    <button type="button" {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
