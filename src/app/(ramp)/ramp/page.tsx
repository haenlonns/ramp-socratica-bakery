import { redirect } from "next/navigation";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { getMockFinanceOverview } from "@/lib/mock-finance";
import { liveHomeData } from "@/lib/ramp/live-home";
import { RampAppShell } from "@/components/ramp/RampAppShell";
import { RampHomeFeed } from "@/components/ramp/RampHomeFeed";
import { WalletPanel } from "@/components/ramp/WalletPanel";

export const dynamic = "force-dynamic";

export default async function RampHomePage() {
  if (await getCurrentAdmin()) redirect("/admin");
  const user = await getCurrentUser();
  if (!user) redirect("/");
  const data = liveHomeData(user, await getMockFinanceOverview(user));

  return (
    <RampAppShell nav={data.nav} viewer={data.viewer}>
      <div className="rampHomeGrid">
        <RampHomeFeed data={data} />
        <WalletPanel title={data.wallet.title} cards={data.wallet.cards} viewAllHref={data.wallet.viewAllHref} />
      </div>
    </RampAppShell>
  );
}
