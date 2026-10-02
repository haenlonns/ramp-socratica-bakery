import { redirect } from "next/navigation";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { RampAppShell } from "@/components/ramp/RampAppShell";
import { RampHomeFeed } from "@/components/ramp/RampHomeFeed";
import { sampleHomeData } from "@/lib/ramp/sample-home";

export const dynamic = "force-dynamic";

export default async function RampHomePage() {
  if (await getCurrentAdmin()) redirect("/admin");
  if (!(await getCurrentUser())) redirect("/");
  const data = sampleHomeData;

  return (
    <RampAppShell nav={data.nav} topBar={false}>
      <div className="rampHomeGrid">
        <RampHomeFeed data={data} />
      </div>
    </RampAppShell>
  );
}
