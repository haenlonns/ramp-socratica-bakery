import { createHash, randomBytes, randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { EVENT_ID } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const googleForm = {
  responseUrl: "https://docs.google.com/forms/d/e/1FAIpQLScNdhQ2nCkaonVLJjExdhJwPn-zBrESX6V6iLcb6D1vKtUgeg/formResponse",
  entries: {
    teamName: "entry.1239808504",
    teamMembers: "entry.932805120",
    contactEmail: "entry.720788223",
    projectName: "entry.2136359351",
    projectUrl: "entry.682441376",
    problem: "entry.1400338021",
    solution: "entry.1258445005",
    impact: "entry.847382914",
    estimate: "entry.847927678",
  },
} as const;

const schema = z.object({
  teamName: z.string().trim().min(3).max(80),
  participants: z.array(z.object({ firstName: z.string().trim().min(1).max(80), email: z.email().max(320) })).min(1).max(6),
  projectName: z.string().trim().min(3).max(100),
  projectUrl: z.url({ protocol: /^https?$/ }).max(1_000),
  problem: z.string().trim().min(10).max(700),
  solution: z.string().trim().min(10).max(700),
  impact: z.string().trim().min(10).max(700),
  estimate: z.string().trim().max(500),
  website: z.literal(""),
});

function parseParticipants(value: Array<{ firstName: string; email: string }>) {
  const emails = value.map((participant) => participant.email.trim().toLowerCase());
  const unique = [...new Set(emails)];
  if (emails.length !== unique.length) throw new Error("Each participant email can only be included once.");
  if (unique.length > 6) throw new Error("Enter no more than six participant email addresses.");
  for (const email of unique) if (!z.email().safeParse(email).success) throw new Error(`Invalid participant email: ${email}`);
  return unique;
}

async function sendToGoogleForm(input: z.infer<typeof schema>) {
  const fields = new URLSearchParams({
    [googleForm.entries.teamName]: input.teamName,
    [googleForm.entries.teamMembers]: input.participants.map(({ firstName, email }) => `${firstName} <${email}>`).join(", "),
    [googleForm.entries.contactEmail]: input.participants[0].email,
    [googleForm.entries.projectName]: input.projectName,
    [googleForm.entries.projectUrl]: input.projectUrl,
    [googleForm.entries.problem]: input.problem,
    [googleForm.entries.solution]: input.solution,
    [googleForm.entries.impact]: input.impact,
    [googleForm.entries.estimate]: input.estimate,
  });
  const response = await fetch(googleForm.responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: fields,
    redirect: "manual",
  });
  if (response.status < 200 || response.status >= 400) throw new Error("Unable to send the project to the Google Form.");
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Please complete every required field with valid information." }, { status: 400 });
    const input = parsed.data;
    const emails = parseParticipants(input.participants);
    const invitations = emails.map((email) => {
      const token = randomBytes(32).toString("base64url");
      return { email, token, token_hash: createHash("sha256").update(token).digest("hex") };
    });
    const admin = createAdminClient();
    const teamId = randomUUID();
    const { error } = await admin.rpc("create_public_submission_team", {
      target_team_id: teamId,
      target_event_id: EVENT_ID,
      target_team_name: input.teamName,
      target_slug: `team-${randomBytes(6).toString("hex")}`,
      target_project_name: input.projectName,
      target_project_url: input.projectUrl,
      target_problem: input.problem,
      target_solution: input.solution,
      target_impact: input.impact,
      target_estimate: input.estimate,
      target_invitations: invitations.map(({ email, token_hash }) => ({ email, token_hash })),
      target_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error(error.message);

    // The team is created first so rejected intakes never reach the Google Form.
    const formForwarded = await sendToGoogleForm(input).then(() => true, (formError) => {
      console.error("Public submission Google Form forwarding failed", { teamId, formError });
      return false;
    });

    const origin = new URL(request.url).origin;
    const deliveryFailures: string[] = [];
    await Promise.all(invitations.map(async ({ email, token }) => {
      const { error: emailError } = await admin.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${origin}/auth/callback?invite=${encodeURIComponent(token)}` },
      });
      if (emailError) deliveryFailures.push(email);
    }));

    if (!formForwarded || deliveryFailures.length) {
      const problems = [
        !formForwarded && "it could not be forwarded to the judging form",
        deliveryFailures.length && `invitation emails could not be sent to ${deliveryFailures.join(", ")}`,
      ].filter(Boolean).join(", and ");
      return NextResponse.json({ ok: true, message: `Your project was recorded, but ${problems}. Please let an organizer know.` });
    }
    return NextResponse.json({ ok: true, message: "Your delivery slip is in. Each teammate will receive a sign-in link to confirm their place on the team." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to submit your project." }, { status: 400 });
  }
}
