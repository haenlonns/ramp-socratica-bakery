import type { ReactNode } from "react";
import "./ui.css";

/**
 * Dark tooltip with a left-pointing arrow. The parent supplies the position
 * (pointer or element anchor) in the container's coordinate space; the bubble
 * fades and slides in on `visible`, and tracks the position with no easing so
 * it never lags the cursor.
 */
export function Tooltip({
  visible,
  x,
  y,
  children,
}: {
  visible: boolean;
  x: number;
  y: number;
  children: ReactNode;
}) {
  return (
    <div
      className="tooltip"
      role="tooltip"
      data-visible={visible}
      style={{ transform: `translate3d(${x}px, ${y}px, 0)` }}
    >
      <div className="tooltipBubble">{children}</div>
    </div>
  );
}
