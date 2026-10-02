import type { ReactNode } from "react";
import type { NavItem, Viewer } from "@/lib/ramp/types";
import { RampSidebar } from "./RampSidebar";
import { RampTopBar } from "./RampTopBar";

/** Sidebar + top bar chrome shared by every signed-in Ramp screen. */
export function RampAppShell({
  nav,
  viewer,
  children,
}: {
  nav: NavItem[];
  viewer: Viewer;
  children: ReactNode;
}) {
  return (
    <div className="rampApp">
      <RampSidebar items={nav} />
      <div className="rampMain">
        <RampTopBar viewer={viewer} />
        <div className="rampContent">{children}</div>
      </div>
    </div>
  );
}
