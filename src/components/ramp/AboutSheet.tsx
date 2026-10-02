"use client";

import { AboutContent } from "@/components/store/AboutContent";
import { Sheet } from "@/components/ui/Sheet";
import { useSheetParam } from "@/lib/use-sheet-param";

/** "How it works" over the homescreen, opened by `/ramp?about`. */
export function AboutSheet() {
  const { isOpen, close } = useSheetParam("about");
  return (
    <Sheet open={isOpen} onClose={close} label="How it works" inset="sidebar" gutter={84}>
      <AboutContent />
    </Sheet>
  );
}
