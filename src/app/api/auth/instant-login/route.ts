import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ email: z.email() });

// Temporary workshop convenience: skips the magic-link email and signs the given
// address straight into a real Supabase session. There is no verification step, so
// anyone who knows a participant's email can sign in as them.
export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const normalized = email.trim().toLowerCase();
    const { data, error } = await createAdminClient().auth.admin.generateLink({ type: "magiclink", email: normalized });
    if (error || !data) throw error ?? new Error("Unable to generate a sign-in link.");

    const supabase = await createServerSupabaseClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({ type: "email", token_hash: data.properties.hashed_token });
    if (verifyError) throw verifyError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to sign in." }, { status: 400 });
  }
}
