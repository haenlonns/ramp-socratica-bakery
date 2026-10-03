import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const eventAdmin = await getCurrentAdmin();
  const user = eventAdmin ? null : await getCurrentUser();
  if (!eventAdmin && !user) redirect("/");
  const { id } = await params; if (!eventAdmin && id !== user?.teamId) notFound();
  const admin = createAdminClient();
  const { data: submission } = await admin.from("submissions").select("id").eq("team_id", id).maybeSingle();
  if (!submission) notFound();
  redirect(`/submissions/${submission.id}`);
}
