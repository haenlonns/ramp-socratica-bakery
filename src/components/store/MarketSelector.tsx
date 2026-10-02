"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { SectionCard, type SectionTone } from "@/components/ui/SectionCard";
import { MarketScene, REGIONS } from "./MarketScene";

export type MarketSection = { slug: string; name: string; blurb: string };

const isTone = (slug: string): slug is SectionTone => slug in REGIONS;

/** Gap between the pointer / region edge and the tooltip arrow. */
const TIP_OFFSET = { x: 18, y: -18 };

/**
 * Section cards + shelf illustration. One `active` section drives both, so a
 * card hover, a card focus and a shelf hover all produce the same highlight,
 * card tint and tooltip.
 */
export function MarketSelector({ sections }: { sections: MarketSection[] }) {
  const [active, setActive] = useState<SectionTone | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  const activate = useCallback((tone: SectionTone) => {
    setActive(tone);
  }, []);
  const deactivate = useCallback(() => {
    setActive(null);
    setPointer(null);
  }, []);

  // The shelf passes pointer positions already in scene coordinates.
  const onShelfMove = useCallback((_tone: SectionTone, event: MouseEvent<HTMLElement>) => {
    const scene = event.currentTarget.parentElement;
    if (!scene) return;
    const box = scene.getBoundingClientRect();
    setPointer({ x: event.clientX - box.left, y: event.clientY - box.top });
  }, []);

  const label = sections.find((s) => s.slug === active)?.name;
  // Pointer when there is one, otherwise just right of the region (card hover / keyboard focus).
  const anchor =
    active && pointer
      ? { x: pointer.x + TIP_OFFSET.x, y: pointer.y + TIP_OFFSET.y }
      : active
        ? { x: REGIONS[active].x + REGIONS[active].w + 8, y: REGIONS[active].y + REGIONS[active].h / 2 - 18 }
        : null;

  return (
    <div className="marketSelector">
      <nav className="marketCards" aria-label="Market areas">
        {sections.map((section) => {
          const tone = isTone(section.slug) ? section.slug : null;
          return (
            <SectionCard
              key={section.slug}
              href={`/store/market/${section.slug}`}
              tone={tone ?? undefined}
              name={section.name}
              blurb={section.blurb}
              active={tone !== null && active === tone}
              onActivate={() => {
                if (!tone) return;
                setPointer(null);
                activate(tone);
              }}
              onDeactivate={deactivate}
            />
          );
        })}
      </nav>

      <MarketScene
        active={active}
        tooltip={label && anchor ? { label, ...anchor } : null}
        onHover={activate}
        onLeave={deactivate}
        onPointerMove={onShelfMove}
      />
    </div>
  );
}
