"use client";

import { useState } from "react";
import type { HomeData } from "@/lib/ramp/types";
import { greetingFor } from "@/lib/ramp/format";
import { ChecklistSection } from "./ChecklistSection";
import { AnimationTuner } from "./AnimationTuner";
import { IncompleteExpensesSection } from "./IncompleteExpensesSection";
import { RampNotice } from "./RampNotice";

export function RampHomeFeed({ data }: { data: HomeData }) {
  const { notices, checklist, incompleteExpenses } = data;
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

      {checklist.tasks.length > 0 && <ChecklistSection title={checklist.title} tasks={checklist.tasks} />}
    </div>
  );
}
