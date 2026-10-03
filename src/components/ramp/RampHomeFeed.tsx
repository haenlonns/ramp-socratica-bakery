"use client";

import type { HomeData } from "@/lib/ramp/types";
import { greetingFor } from "@/lib/ramp/format";
import { viewerFor } from "@/lib/ramp/from-config";
import { clearPurchases, seedSamplePurchases, usePurchases } from "@/lib/store/purchases";
import { useRampConfig } from "./RampConfigProvider";
import { AboutSheet } from "./AboutSheet";
import { DevStateToggle } from "./DevStateToggle";
import { HomeOverview } from "./HomeOverview";
import { TransactionsSection } from "./TransactionsSection";

export function RampHomeFeed({ data, hasTeam = true }: { data: HomeData; hasTeam?: boolean }) {
  void data;
  const { config } = useRampConfig();
  const viewer = viewerFor(config);
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

      <TransactionsSection />
      <HomeOverview hasTeam={hasTeam} />
      <AboutSheet />
    </div>
  );
}
