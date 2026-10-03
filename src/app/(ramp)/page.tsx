import { redirect } from "next/navigation";
import { RampHeader } from "@/components/ramp/RampHeader";
import { RampLoginForm } from "@/components/ramp/RampLoginForm";
import { getAuthenticatedUser, getCurrentAdmin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  if (await getCurrentUser()) redirect("/ramp");

  if (await getAuthenticatedUser()) redirect("/ramp");
  return (
    <div className="rampShell">
      <RampHeader />
      <main className="rampAuth">
        <div className="rampAuthInner">
          <h1>Welcome to Ramp</h1>
          <RampLoginForm />
        </div>
      </main>
    </div>
  );
}
