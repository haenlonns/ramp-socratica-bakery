"use client";

import Link from "next/link";
import { useState } from "react";
import type { HomeTransaction } from "@/lib/ramp/types";
import { EmptyPurchases } from "./EmptyPurchases";
import { Sheet } from "@/components/ui/Sheet";
import { markSheetOpened } from "@/lib/use-sheet-param";

const POLICY = [
  "Every team spends from one shared fund, charged to the team's virtual card.",
  "Up to 4 of any single item per team.",
  "Items are delivered about 5 minutes after you pay.",
  "Ingredients are for the bake. No returns, and no refunds on perishables.",
];

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

/** Stand-in art per market area, so each row's avatar reflects where the money went. */
const VENDOR_ART: Record<string, string> = { aisle: "granola", fruits: "strawberry", fridge: "yogurt" };
const artFor = (merchant: string) => `/store/products/${VENDOR_ART[merchant.toLowerCase()] ?? "blueberry"}.svg`;

function Row({ transaction, who, program }: { transaction: HomeTransaction; who: string; program: string }) {
  const content = (
    <>
      <div>
        <p className="rampTxMain">{dollars(transaction.amountCents)} at {transaction.merchantName}</p>
        <p className="rampTxSub">{ago(transaction.at)}</p>
      </div>
      <div>
        <p className="rampTxMain">{who}</p>
        <p className="rampTxSub rampTxSub--strong">{program}</p>
      </div>
      <span className="rampTxAvatar">
        <img className="rampTxAvatarArt" src={artFor(transaction.merchantName)} alt="" aria-hidden />
        <span className="rampTxBadge"><img src="/ramp/icons/shield-check.svg" alt="" aria-hidden /></span>
      </span>
    </>
  );
  return (
    <li>
      {transaction.orderId ? <Link href={`/invoices/${transaction.orderId}`} className="rampTxRow">{content}</Link> : <div className="rampTxRow">{content}</div>}
    </li>
  );
}

export function TransactionsSection({ transactions, who, program }: { transactions: HomeTransaction[]; who: string; program: string }) {
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
          <Link href="/ramp?about" scroll={false} onClick={markSheetOpened} className="rampBtn rampBtn--secondary">How it works</Link>
        </div>
      </div>

      {transactions.length === 0 ? (
        <EmptyPurchases className="rampEmpty--tx" />
      ) : (
        <ul className="rampTxList">
          {transactions.map((transaction) => (
            <Row key={transaction.id} transaction={transaction} who={who} program={program} />
          ))}
        </ul>
      )}

      <Sheet open={policyOpen} onClose={() => setPolicyOpen(false)} label="Socratica spending policy" inset="sidebar">
        <div className="rampPolicy">
          <h2 className="rampPolicyTitle">Socratica spending policy</h2>
          <ul className="rampPolicyList">
            {POLICY.map((rule) => <li key={rule}>{rule}</li>)}
          </ul>
        </div>
      </Sheet>
    </section>
  );
}
