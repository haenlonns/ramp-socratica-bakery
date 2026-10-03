"use client";

import { useState } from "react";
import Link from "next/link";
import type { HomeData } from "@/lib/ramp/types";
import { formatCardAmount, greetingFor } from "@/lib/ramp/format";
import { ChecklistSection } from "./ChecklistSection";
import { AnimationTuner } from "./AnimationTuner";
import { IncompleteExpensesSection } from "./IncompleteExpensesSection";
import { RampNotice } from "./RampNotice";

export function RampHomeFeed({ data }: { data: HomeData }) {
  const { notices, checklist, incompleteExpenses, transactions } = data;
  const { viewer } = data;

  const [submitted, setSubmitted] = useState<string[]>([]);

  const expenses = incompleteExpenses.filter((expense) => !submitted.includes(expense.id));

  return (
    <div className="rampFeed">
      <AnimationTuner />

      <h1 className="rampGreeting">
        {greetingFor()}, {viewer.firstName}
      </h1>

      {notices.map((notice) => (
        <RampNotice key={notice.id} notice={notice} />
      ))}

      <IncompleteExpensesSection
        expenses={expenses}
        onSubmit={(id) => setSubmitted((current) => [...current, id])}
      />

      {transactions.length > 0 && (
        <section className="rampTx" aria-labelledby="recent-card-activity">
          <div className="rampTxHead">
            <div>
              <h2 id="recent-card-activity" className="rampTxTitle">Recent card activity</h2>
              <p className="rampTxIntro">Purchases made with your workshop card.</p>
            </div>
          </div>
          <ul className="rampTxList">
            {transactions.map((transaction) => {
              const content = (
                <>
                  <div>
                    <p className="rampTxMain">{transaction.merchantName}</p>
                    <p className="rampTxSub">{transaction.occurredAtLabel}</p>
                  </div>
                  <div>
                    <p className="rampTxMain rampTxAmount">{formatCardAmount(transaction.amountCents, transaction.currency)}</p>
                    <p className="rampTxSub">Posted</p>
                  </div>
                  <div className="rampTxInvoice">
                    <span className="rampTxSub rampTxSub--strong">{transaction.invoiceNumber}</span>
                    {transaction.invoiceHref && <span aria-hidden>&rarr;</span>}
                  </div>
                </>
              );

              return (
                <li key={transaction.id}>
                  {transaction.invoiceHref ? (
                    <Link href={transaction.invoiceHref} className="rampTxRow">{content}</Link>
                  ) : (
                    <div className="rampTxRow">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {checklist.tasks.length > 0 && <ChecklistSection title={checklist.title} tasks={checklist.tasks} />}
    </div>
  );
}
