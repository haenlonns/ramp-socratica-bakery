import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const admin = createAdminClient();
  const { data: submission } = await admin.from("submissions").select("id,title,project_url,problem,solution,impact,estimate,teams!inner(name)").eq("id", id).maybeSingle();
  if (!submission) notFound();
  const team = submission.teams as unknown as { name: string };
  return <main className="deliverySlipPage"><article className="deliverySlip deliverySlip--project"><header className="deliverySlipHeader"><p>Socratica Bakery · Project delivery slip</p><h1>{submission.title}</h1><span>Delivered</span></header><p className="deliverySlipIntro">Built by {team.name}</p><section className="deliverySlipSection"><div><b>01</b><h2>The build</h2></div><fieldset><label>Project URL<a href={submission.project_url} target="_blank" rel="noreferrer">{submission.project_url}</a></label><label>What problem are they solving?<p>{submission.problem}</p></label><label>How does it solve it?<p>{submission.solution}</p></label></fieldset></section><section className="deliverySlipSection"><div><b>02</b><h2>The difference</h2></div><fieldset><label>What impact could this have?<p>{submission.impact}</p></label>{submission.estimate && <label>How they estimate the impact<p>{submission.estimate}</p></label>}</fieldset></section></article></main>;
}
