import { redirect } from "next/navigation";
import { acceptPendingInvitationForEmail, getAuthenticatedUser, getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { RampAppShell } from "@/components/ramp/RampAppShell";
import { RampHomeFeed } from "@/components/ramp/RampHomeFeed";
import { sampleHomeData } from "@/lib/ramp/sample-home";

export const dynamic = "force-dynamic";

export default async function RampHomePage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const member = await getCurrentUser();
  const signedIn = member ?? (await getAuthenticatedUser());
  if (!signedIn) redirect("/");
  // Signed in without a team: join via a pending invitation if one exists, else show a blank home.
  if (!member && (await acceptPendingInvitationForEmail(signedIn))) redirect("/ramp");
  const data = sampleHomeData;

  return (
    <RampAppShell nav={data.nav} topBar={false}>
      <div className="rampHomeGrid">
        <RampHomeFeed data={data} hasTeam={Boolean(member)} />
      </div>
    </RampAppShell>
  );
}
