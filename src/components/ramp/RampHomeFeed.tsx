"use client";

import type { HomeData, WalletCard } from "@/lib/ramp/types";
import { greetingFor } from "@/lib/ramp/format";
import { clearPurchases, seedSamplePurchases, usePurchases } from "@/lib/store/purchases";
import { AboutSheet } from "./AboutSheet";
import { DevStateToggle } from "./DevStateToggle";
import { HomeOverview } from "./HomeOverview";
import { TransactionsSection } from "./TransactionsSection";

export function RampHomeFeed({ data, card, teamName }: { data: HomeData; card?: WalletCard; teamName?: string }) {
  const { viewer } = data;
  const purchases = usePurchases();

  return (
    <div className="rampFeed">
      {/* Dev-only: flips between the empty and populated home page. */}
      <DevStateToggle
        label="Purchases"
        value={purchases.length > 0 ? "some" : "none"}
        onChange={(id) => (id === "some" ? seedSamplePurchases() : clearPurchases())}
        options={[
          { id: "none", label: "None" },
          { id: "some", label: "Sample" },
        ]}
      />

      <h1 className="rampGreeting">
        {greetingFor()}, {viewer.firstName}
      </h1>

      <TransactionsSection who={viewer.firstName} program={teamName ?? ""} />
      <HomeOverview card={card} />
      <AboutSheet />
    </div>
  );
}
