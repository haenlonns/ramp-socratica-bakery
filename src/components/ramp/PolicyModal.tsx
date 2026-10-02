"use client";

import { useEffect } from "react";
import { RampIcon } from "./RampIcon";

const RULES = [
  "Every team spends from one shared fund, charged to the team's virtual card.",
  "Up to 4 of any single item per team.",
  "Items are delivered about 5 minutes after you pay.",
  "Ingredients are for the bake. No returns, and no refunds on perishables.",
];

/** The "policy" link on the transactions panel opens this. */
export function PolicyModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="rampModalBackdrop" onClick={onClose}>
      <div
        className="rampModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="rampDrawerClose" onClick={onClose} aria-label="Close">
          <RampIcon name="close" />
        </button>
        <h2 id="policy-title" className="rampModalTitle">Socratica spending policy</h2>
        <ul className="rampModalList">
          {RULES.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </div>
    </div>
  );
}
