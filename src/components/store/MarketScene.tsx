"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import type { SectionTone } from "@/components/ui/SectionCard";
import { Grain } from "./Grain";

/**
 * The market stall illustration, rebuilt from the Figma vector parts with the
 * real product art on three shelves (Aisle 7, Fruits 4, Fridge 6). All
 * coordinates are the Figma geometry (scene is 1015 x 483); the `inner` group
 * is the shelf cabinet the rows are positioned inside.
 */

export const SCENE = { width: 1015, height: 483 } as const;
const INNER = { x: 231.15, y: 50.71 } as const;
const ART = 74.023;

type Item = { id: string; x: number; y: number };

const row = (ids: string[], left: number, top: number): Item[] =>
  ids.map((id, i) => ({ id, x: left + i * ART, y: top }));

const ITEMS: Record<SectionTone, Item[]> = {
  aisle: [
    { id: "granola", x: 13.75, y: 143.26 },
    { id: "cinnamon", x: 69.74, y: 140.77 },
    { id: "trail-mix", x: 123.33, y: 143.26 },
    { id: "graham-cracker", x: 197.35, y: 143.26 },
    { id: "castella-cake", x: 271.38, y: 143.26 },
    { id: "brown-sugar", x: 334.09, y: 143.26 },
    { id: "nutmeg", x: 389.79, y: 147.75 },
  ],
  fruits: row(["blueberry", "strawberry", "raspberry", "blackberry"], 86.3, 216.55),
  fridge: row(["honey", "whipping-cream", "creamer", "pumpkin-puree", "condensed-milk", "yogurt"], 11.1, 306.12),
};

/** Hover/focus region and highlight box per section, in scene coordinates. */
export const REGIONS: Record<SectionTone, { x: number; y: number; w: number; h: number }> = {
  aisle: { x: 239, y: 197, w: 462, h: 64 },
  fruits: { x: 315, y: 267, w: 302, h: 73 },
  fridge: { x: 240, y: 357, w: 452, h: 75 },
};

type Stripe = { x: number; y: number; w: number; h: number; color: string };
const STRIPES: Stripe[] = [
  { x: -0.38, y: 267.59, w: 465.248, h: 26.987, color: "#8c342e" },
  { x: 0.07, y: 202.95, w: 463.986, h: 8.472, color: "#8c342e" },
  { x: -0.38, y: 373.38, w: 481.44, h: 58.291, color: "#682224" },
  { x: 0, y: 207.02, w: 466.335, h: 6.403, color: "#682224" },
  { x: -1.07, y: 294.53, w: 472.738, h: 6.403, color: "#6d2724" },
  { x: -0.38, y: 355.03, w: 465.248, h: 26.987, color: "#8c342e" },
  { x: -1.07, y: 378.79, w: 472.738, h: 6.403, color: "#8c342e" },
];

type Glass = { src: string; x: number; y: number; w: number; h: number; flip?: boolean; outer?: boolean };
const GLASS: Glass[] = [
  { src: "glass-r1", x: 447.13, y: 213.43, w: 18.141, h: 81.102, flip: true },
  { src: "glass-r2", x: 448.68, y: 299.97, w: 18.351, h: 88.516, flip: true },
  { src: "glass-l1", x: 0, y: 213.43, w: 18.166, h: 81.275 },
  { src: "glass-l2", x: -0.38, y: 299.97, w: 18.351, h: 88.516 },
  { src: "glass-a", x: -14.08, y: 213.25, w: 124.138, h: 116.582 },
  { src: "glass-b", x: 30.93, y: 213.62, w: 209.416, h: 171.634 },
  { src: "glass-c", x: 330.08, y: 263.78, w: 208.876, h: 172.174, outer: true },
  { src: "glass-d", x: 544.89, y: 291.31, w: 151.664, h: 144.648, outer: true },
];

const at = (x: number, y: number, w: number, h: number, outer = false) => ({
  left: outer ? x : x + INNER.x,
  top: outer ? y : y + INNER.y,
  width: w,
  height: h,
});

export function MarketScene({
  active,
  tooltip,
  onHover,
  onLeave,
  onPointerMove,
}: {
  active: SectionTone | null;
  tooltip: { label: string; x: number; y: number } | null;
  onHover: (tone: SectionTone) => void;
  onLeave: () => void;
  onPointerMove: (tone: SectionTone, event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <div className="marketScene" data-active={active ?? "none"} style={{ width: SCENE.width, height: SCENE.height }}>
      <span className="marketSky marketSky--base" aria-hidden />
      {(Object.keys(REGIONS) as SectionTone[]).map((tone) => (
        <span key={tone} className={`marketSky marketSky--${tone}`} aria-hidden />
      ))}

      <img className="marketPiece" src="/store/market/shelf-line.svg" alt="" aria-hidden style={{ left: 232.21, top: 303.53, width: 1.067, height: 50.155 }} />
      <span className="marketPost" style={{ left: 695.2, top: 119.02, width: 14.951, height: 363.887, borderBottomRightRadius: 4.318 }} aria-hidden />

      {STRIPES.map((s) => (
        <span key={`${s.y}-${s.x}`} className="marketPiece" style={{ ...at(s.x, s.y, s.w, s.h), background: s.color }} aria-hidden />
      ))}

      {(Object.keys(REGIONS) as SectionTone[]).map((tone) => (
        <span key={tone} className={`marketHighlight marketHighlight--${tone}`} data-on={active === tone} style={{ left: REGIONS[tone].x, top: REGIONS[tone].y, width: REGIONS[tone].w, height: REGIONS[tone].h }} aria-hidden />
      ))}

      {GLASS.filter((g) => !g.outer).map((g) => (
        <img key={g.src} className="marketPiece" src={`/store/market/${g.src}.svg`} alt="" aria-hidden style={{ ...at(g.x, g.y, g.w, g.h), transform: g.flip ? "rotate(180deg) scaleY(-1)" : undefined }} />
      ))}

      {(Object.keys(ITEMS) as SectionTone[]).flatMap((tone) =>
        ITEMS[tone].map((item) => (
          <img key={item.id} className="marketItem" src={`/store/products/${item.id}.svg`} alt="" aria-hidden style={at(item.x, item.y, ART, ART)} />
        )),
      )}

      {GLASS.filter((g) => g.outer).map((g) => (
        <img key={g.src} className="marketPiece" src={`/store/market/${g.src}.svg`} alt="" aria-hidden style={at(g.x, g.y, g.w, g.h, true)} />
      ))}
      <span className="marketPost" style={{ left: 218.25, top: 119.02, width: 14.951, height: 363.887, borderBottomLeftRadius: 4.318 }} aria-hidden />

      <div className="marketAwning" aria-hidden>
        <img className="marketPiece" src="/store/market/awning.svg" alt="" style={{ left: 186.36, top: 112.32, width: 562.834, height: 47.975 }} />
        {Array.from({ length: 11 }, (_, i) => (
          <img key={i} className="marketPiece" src="/store/market/scallop.svg" alt="" style={{ left: 185.81 + i * 50.74, top: 144.58, width: 55.91, height: 38.794 }} />
        ))}
      </div>

      <span className="marketChef" aria-hidden>
        <img src="/store/market/arch.svg" alt="" width={355.614} height={279.022} />
      </span>

      {/* Hit regions: pointer only. Keyboard users reach the same sections through the cards. */}
      {(Object.keys(REGIONS) as SectionTone[]).map((tone) => (
        <Link
          key={tone}
          href={`/store/market/${tone}`}
          className="marketRegion"
          tabIndex={-1}
          aria-hidden
          style={{ left: REGIONS[tone].x, top: REGIONS[tone].y, width: REGIONS[tone].w, height: REGIONS[tone].h }}
          onMouseEnter={() => onHover(tone)}
          onMouseLeave={onLeave}
          onMouseMove={(event) => onPointerMove(tone, event)}
        />
      ))}

      <Tooltip visible={tooltip !== null} x={tooltip?.x ?? 0} y={tooltip?.y ?? 0}>
        {tooltip?.label}
      </Tooltip>

      <Grain />
    </div>
  );
}
