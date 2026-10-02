"use client";

import Link from "next/link";
import { useState } from "react";
import { productsById } from "@/lib/catalog";
import { activeTeam } from "@/lib/ramp/config";
import { usePurchases, type Purchase } from "@/lib/store/purchases";
import { EmptyPurchases } from "./EmptyPurchases";
import { PolicyModal } from "./PolicyModal";
import { useRampConfig } from "./RampConfigProvider";

const dollars = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function ago(at: number) {
  const minutes = Math.round((Date.now() - at) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function describe(purchase: Purchase) {
  const names = purchase.lines
    .map((line) => productsById.get(line.productId)?.name)
    .filter((name): name is string => Boolean(name));
  if (names.length === 0) return "Store order";
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0];
}

function Row({ purchase, who, program }: { purchase: Purchase; who: string; program: string }) {
  return (
    <li className="rampTxRow">
      <div>
        <p className="rampTxMain">{dollars(purchase.totalCents)} for {describe(purchase)}</p>
        <p className="rampTxSub">{ago(purchase.at)}</p>
      </div>
      <div>
        <p className="rampTxMain">{who}</p>
        <p className="rampTxSub rampTxSub--strong">{program}</p>
      </div>
      <span className="rampTxAvatar">
        <img className="rampTxAvatarArt" src="/store/products/blueberry.svg" alt="" aria-hidden />
        <span className="rampTxBadge"><img src="/ramp/icons/shield-check.svg" alt="" aria-hidden /></span>
      </span>
    </li>
  );
}

export function TransactionsSection() {
  const purchases = usePurchases();
  const { config } = useRampConfig();
  const team = activeTeam(config);
  const [policyOpen, setPolicyOpen] = useState(false);

  return (
    <section className="rampTx">
      <div className="rampTxHead">
        <div>
          <h2 className="rampTxTitle">Your Transactions</h2>
          <p className="rampTxIntro">
            These are in line with your{" "}
            <button type="button" className="rampTxPolicy" onClick={() => setPolicyOpen(true)}>policy</button>
          </p>
        </div>
        <div className="rampTxActions">
          <Link href="/store/market" className="rampBtn rampBtn--primary">Start Shopping</Link>
          <Link href="/store" className="rampBtn rampBtn--secondary">How it works</Link>
        </div>
      </div>

      {purchases.length === 0 ? (
        <EmptyPurchases className="rampEmpty--tx" />
      ) : (
        <ul className="rampTxList">
          {purchases.map((purchase) => (
            <Row key={purchase.id} purchase={purchase} who={team.viewer.firstName} program={team.name} />
          ))}
        </ul>
      )}

      {policyOpen && <PolicyModal onClose={() => setPolicyOpen(false)} />}
    </section>
  );
}
