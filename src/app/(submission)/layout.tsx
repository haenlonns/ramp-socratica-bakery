import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Project Delivery Slip · Socratica Bakery",
  description: "Submit a project and form your Socratica Bakery team.",
};

export default function SubmissionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
