"use client";

import { useState } from "react";
import type { WalletCard } from "@/lib/ramp/types";
import { usePurchases } from "@/lib/store/purchases";
import { CardDrawer } from "./CardDrawer";

const whole = (cents: number) => {
  const amount = cents / 100;
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
};

/** A small cumulative-spend chart; flat until something has been bought. */
function SpendChart({ totals }: { totals: number[] }) {
  const w = 151;
  const h = 112;
  if (totals.length === 0) {
    return <span className="rampChartEmpty" aria-hidden />;
  }
  const points = totals.length === 1 ? [0, totals[0]] : totals;
  const max = Math.max(...points) || 1;
  const x = (i: number) => (i / (points.length - 1)) * (w - 16);
  const y = (v: number) => h - 12 - (v / max) * (h - 28);
  const line = points.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  return (
    <svg className="rampChart" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <defs>
        <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7693d2" stopOpacity="0.5" />
          <stop offset="1" stopColor="#7693d2" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${x(points.length - 1)} ${h - 12} L0 ${h - 12} Z`} fill="url(#spendFill)" />
      <path d={line} fill="none" stroke="#7693d2" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeOverview({ card }: { card?: WalletCard }) {
  const purchases = usePurchases();
  const [drawer, setDrawer] = useState(false);

  // The card carries the live fund: remaining already reflects every posted purchase.
  const limit = card?.limitCents ?? card?.remainingCents ?? 0;
  const balance = card?.remainingCents ?? 0;
  const spent = Math.max(0, limit - balance);
  // Blue is what has been spent; before the first purchase the track is empty.
  const spentShare = limit > 0 ? Math.min(1, Math.max(0, spent / limit)) : 0;

  // Oldest first, running total after each purchase.
  const chronological = [...purchases].reverse();
  const totals: number[] = [];
  chronological.reduce((sum, p) => (totals.push(sum + p.totalCents), sum + p.totalCents), 0);
  const last = purchases[0]?.totalCents;
  const prev = purchases[1]?.totalCents;
  const change = last !== undefined && prev ? ((last - prev) / prev) * 100 : null;

  return (
    <div className="rampHomeCols">
      <div className="rampHomeCol">
        <div className="rampColHead">
          <span className="rampColTitle">Virtual cards</span>
          <button type="button" className="rampColLink" onClick={() => setDrawer(true)}>
            View all <span aria-hidden>&rarr;</span>
          </button>
        </div>
        <button type="button" className="rampStat rampStat--card" onClick={() => card && setDrawer(true)} disabled={!card}>
          <span className="rampStatLabel">{card ? "Current card balance" : "No card yet. Your admin will add you to a team."}</span>
          <span className="rampStatValue">{whole(balance)}</span>
          <span className="rampBal" aria-hidden>
            <span className="rampBalFill" style={{ width: `${spentShare * 100}%` }} />
            <span className="rampBalGap" />
            <span className="rampBalGap" />
            <span className="rampBalRest" />
          </span>
        </button>
      </div>

      <div className="rampHomeCol">
        <div className="rampColHead">
          <span className="rampColTitle">Insights</span>
        </div>
        <div className="rampStat rampStat--insight">
          <div className="rampInsightText">
            <span className="rampStatLabel">Total spending</span>
            <span className="rampStatValue">CA${Math.round(spent / 100)}</span>
            {change !== null && (
              <span className="rampDelta">
                <img
                  src="/ramp/icons/arrow-down-16.svg"
                  alt=""
                  aria-hidden
                  style={change > 0 ? { transform: "rotate(180deg)" } : undefined}
                />
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
          <SpendChart totals={totals} />
        </div>
      </div>

      {drawer && card && <CardDrawer card={card} onClose={() => setDrawer(false)} />}
    </div>
  );
}
