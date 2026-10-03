import { redirect } from "next/navigation";
import { acceptPendingInvitationForEmail, getAuthenticatedUser, getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { RampAppShell } from "@/components/ramp/RampAppShell";
import { RampHomeFeed } from "@/components/ramp/RampHomeFeed";
import { getMockFinanceOverview } from "@/lib/mock-finance";
import { liveHomeData, viewerForUser } from "@/lib/ramp/live-home";
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
  const live = member ? await getMockFinanceOverview(member).then((overview) => liveHomeData(member, overview), () => null) : null;
  const data = { ...sampleHomeData, viewer: live?.viewer ?? viewerForUser(signedIn) };
  const card = live?.wallet.cards[0];

  return (
    <RampAppShell nav={data.nav} viewer={data.viewer} teamName={member?.teamName} topBar={false}>
      <div className="rampHomeGrid">
        <RampHomeFeed data={data} card={card} teamName={member?.teamName} />
      </div>
    </RampAppShell>
  );
}
