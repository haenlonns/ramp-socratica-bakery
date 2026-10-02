import { redirect } from "next/navigation";
import { RampHeader } from "@/components/ramp/RampHeader";
import { RampLoginForm } from "@/components/ramp/RampLoginForm";
import { acceptPendingInvitationForEmail, getAuthenticatedUser, getCurrentAdmin, getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  if (await getCurrentAdmin()) redirect("/admin");
  if (await getCurrentUser()) redirect("/ramp");

  const authenticated = await getAuthenticatedUser();
  if (authenticated && (await acceptPendingInvitationForEmail(authenticated))) redirect("/ramp");
  return (
    <div className="rampShell">
      <RampHeader />
      <main className="rampAuth">
        <div className="rampAuthInner">
          <h1>Welcome to Ramp</h1>
          {authenticated ? (
            <p className="rampNote">You’re signed in. You’re not on a bakery team yet. Ask your event admin to invite {authenticated.email}.</p>
          ) : (
            <RampLoginForm />
          )}
        </div>
      </main>
    </div>
  );
}
