import { redirect } from "next/navigation";
import { acceptPendingInvitationForEmail, getAuthenticatedUser, getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { RampAppShell } from "@/components/ramp/RampAppShell";
import { RampHomeFeed } from "@/components/ramp/RampHomeFeed";
import { getMockFinanceOverview } from "@/lib/mock-finance";
import { liveHomeData, viewerForUser } from "@/lib/ramp/live-home";
import type { HomeTransaction } from "@/lib/ramp/types";
import { sampleHomeData } from "@/lib/ramp/sample-home";

export const dynamic = "force-dynamic";

export default async function RampHomePage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const member = await getCurrentUser();
  const signedIn = member ?? (await getAuthenticatedUser());
  if (!signedIn) redirect("/");
  // Signed in without a team: join via a pending invitation if one exists, else show a blank home.
  if (!member && (await acceptPendingInvitationForEmail(signedIn))) redirect("/ramp");
  // Card, balance and names come from the signed-in user's real fund and card.
  const overview = member ? await getMockFinanceOverview(member).catch(() => null) : null;
  const live = member && overview ? liveHomeData(member, overview) : null;
  const transactions: HomeTransaction[] = (overview?.transactions ?? [])
    .filter((transaction) => transaction.status === "POSTED")
    .map((transaction) => ({ id: transaction.id, merchantName: transaction.merchantName, amountCents: transaction.amountCents, at: Date.parse(transaction.createdAt), orderId: transaction.orderId }));
  const data = { ...sampleHomeData, viewer: live?.viewer ?? viewerForUser(signedIn) };
  const card = live?.wallet.cards[0];

  return (
    <RampAppShell nav={data.nav} viewer={data.viewer} teamName={member?.teamName} topBar={false}>
      <div className="rampHomeGrid">
        <RampHomeFeed data={data} card={card} transactions={transactions} teamName={member?.teamName} />
      </div>
    </RampAppShell>
  );
}
