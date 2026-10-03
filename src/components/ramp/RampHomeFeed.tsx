"use client";

import type { HomeData, HomeTransaction, WalletCard } from "@/lib/ramp/types";
import { greetingFor } from "@/lib/ramp/format";
import { AboutSheet } from "./AboutSheet";
import { HomeOverview } from "./HomeOverview";
import { TransactionsSection } from "./TransactionsSection";

export function RampHomeFeed({ data, card, transactions, teamName }: { data: HomeData; card?: WalletCard; transactions: HomeTransaction[]; teamName?: string }) {
  const { viewer } = data;

  return (
    <div className="rampFeed">
      <h1 className="rampGreeting">
        {greetingFor()}, {viewer.firstName}
      </h1>

      <TransactionsSection transactions={transactions} who={viewer.firstName} program={teamName ?? ""} />
      <HomeOverview card={card} transactions={transactions} who={viewer.firstName} program={teamName ?? ""} />
      <AboutSheet />
    </div>
  );
}
