"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/lib/ramp/types";
import { activeTeam } from "@/lib/ramp/config";
import { RampIcon } from "./RampIcon";
import { useRampConfig } from "./RampConfigProvider";

function NavRowContent({ item }: { item: NavItem }) {
  return (
    <>
      <RampIcon name={item.icon} size={12} />
      <span className="rampNavLabel">{item.label}</span>
      {item.badge !== undefined && <span className="rampNavBadge">{item.badge}</span>}
    </>
  );
}

export function RampSidebar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const { config } = useRampConfig();
  const team = activeTeam(config);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <nav className="rampSidebar" aria-label="Primary">
      <div className="rampSidebarHead">
        <button type="button" className="rampSidebarIconBtn" aria-label="Collapse sidebar">
          <RampIcon name="sb-toggle" size={16} />
        </button>
        <Link href="/ramp" className="rampSidebarIconBtn" aria-label="Ramp home">
          <img src="/ramp/icons/sb-logo.svg" alt="" aria-hidden width={15.57} height={16.09} />
        </Link>
      </div>

      <div className="rampSidebarScroll">
        <div className="rampSidebarUser">
          <p>{team.viewer.firstName}</p>
          <p className="rampSidebarUserSub">{team.name}</p>
        </div>
        <hr className="rampSidebarRule" />

        <ul className="rampNav">
          {items.map((item) => {
            // No href means the destination does not exist yet: render an inert
            // button so it still looks and focuses like a nav row.
            if (!item.href) {
              return (
                <li key={item.id}>
                  <button type="button" className="rampNavItem rampNavItem--inert" aria-disabled>
                    <NavRowContent item={item} />
                  </button>
                </li>
              );
            }

            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={active ? "rampNavItem rampNavItem--active" : "rampNavItem"}
                  aria-current={active ? "page" : undefined}
                >
                  <NavRowContent item={item} />
                </Link>
              </li>
            );
          })}
        </ul>
        <hr className="rampSidebarRule" />
      </div>

      <div className="rampSidebarFoot">
        <a className="rampNavItem" href="https://ramp.com/careers" target="_blank" rel="noreferrer">
          <RampIcon name="sb-careers" size={12} />
          <span className="rampNavLabel">Careers at Ramp</span>
        </a>
      </div>
      <div className="rampSidebarFoot">
        <button type="button" className="rampLogout" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
