import type { ReactNode } from "react";
import type { NavItem } from "@/lib/ramp/types";
import { RampSidebar } from "./RampSidebar";
import { RampTopBar } from "./RampTopBar";

/** Sidebar + top bar chrome shared by every signed-in Ramp screen. */
export function RampAppShell({
  nav,
  topBar = true,
  children,
}: {
  nav: NavItem[];
  /** The homescreen frame has no top bar. */
  topBar?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rampApp">
      <RampSidebar items={nav} />
      <div className={topBar ? "rampMain" : "rampMain rampMain--bare"}>
        {topBar && <RampTopBar />}
        <div className="rampContent">{children}</div>
      </div>
    </div>
  );
}
