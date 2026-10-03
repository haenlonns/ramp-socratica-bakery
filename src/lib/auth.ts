import { createAdminClient } from "./supabase/admin";
import { createServerSupabaseClient } from "./supabase/server";

export const EVENT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
export type AuthenticatedUser = { id: string; email: string };
export type CurrentUser = AuthenticatedUser & { teamId: string; teamName: string; memberRole: "OWNER" | "MEMBER"; eventId: string };

// Local development only: DEV_LOGIN_EMAIL signs you in as that address without a magic link.
// Requires NODE_ENV=development (`next dev`), so a production build ignores it.
let devIdentity: AuthenticatedUser | undefined;
async function getDevLoginUser(): Promise<AuthenticatedUser | null> {
  const email = process.env.NODE_ENV === "development" ? process.env.DEV_LOGIN_EMAIL?.trim().toLowerCase() : undefined;
  if (!email) return null;
  if (devIdentity?.email === email) return devIdentity;
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  let id = profile?.id as string | undefined;
  if (!id) {
    const { data, error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error || !data.user) throw new Error(`DEV_LOGIN_EMAIL: could not create ${email}: ${error?.message}`);
    id = data.user.id;
  }
  return (devIdentity = { id, email });
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createServerSupabaseClient(); const { data } = await supabase.auth.getClaims();
  const session = data?.claims?.sub && typeof data.claims.email === "string" ? { sub: data.claims.sub, email: data.claims.email } : null;
  const dev = session ? null : await getDevLoginUser();
  const claims = session ?? (dev ? { sub: dev.id, email: dev.email } : null);
  if (!claims) return null;
  const admin = createAdminClient();
  await admin.from("profiles").upsert({ id: claims.sub, email: claims.email }, { onConflict: "id", ignoreDuplicates: true });
  const { data: bootstrap } = await admin.from("superadmin_bootstraps").select("event_id,consumed_at").eq("email", claims.email.toLowerCase()).maybeSingle();
  if (bootstrap && !bootstrap.consumed_at) {
    await admin.from("event_admins").upsert({ event_id: bootstrap.event_id, user_id: claims.sub, role: "SUPERADMIN" }, { onConflict: "event_id,user_id" });
    await admin.from("superadmin_bootstraps").update({ consumed_by: claims.sub, consumed_at: new Date().toISOString() }).eq("email", claims.email.toLowerCase()).is("consumed_at", null);
  }
  return { id: claims.sub, email: claims.email };
}
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await getAuthenticatedUser(); if (!user) return null;
  const { data } = await createAdminClient().from("team_members").select("team_id,event_id,role,teams!inner(name)").eq("user_id", user.id).eq("event_id", EVENT_ID).is("left_at", null).maybeSingle();
  if (!data) return null; return { ...user, teamId: data.team_id, eventId: data.event_id, teamName: (data.teams as unknown as { name: string }).name, memberRole: data.role as "OWNER" | "MEMBER" };
}
export async function getCurrentAdmin() {
  const user = await getAuthenticatedUser(); if (!user) return null;
  const { data } = await createAdminClient().from("event_admins").select("role").eq("event_id", EVENT_ID).eq("user_id", user.id).maybeSingle();
  return data ? { ...user, role: data.role as "ADMIN" | "SUPERADMIN" } : null;
}

// Signed in but not on a team: accept the newest live invitation addressed to this email.
// The invitation row already binds the email to a team, and accept_team_invitation re-checks
// the email, expiry, revocation, admin and one-team rules, so no browser-held token is needed.
export async function acceptPendingInvitationForEmail(user: AuthenticatedUser): Promise<boolean> {
  const admin = createAdminClient();
  const { data: invitation } = await admin.from("team_invitations").select("token_hash")
    .eq("event_id", EVENT_ID).eq("email", user.email.toLowerCase()).is("accepted_at", null).is("revoked_at", null)
    .gt("expires_at", new Date().toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!invitation) return false;
  const { error } = await admin.rpc("accept_team_invitation", { target_token_hash: invitation.token_hash, target_user_id: user.id, target_email: user.email });
  return !error;
}
