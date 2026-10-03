"use client";

import { useState } from "react";

const initialValues = { teamName: "", projectName: "", projectUrl: "", problem: "", solution: "", impact: "", estimate: "", website: "" };
const emptyParticipant = { firstName: "", email: "" };

export function PublicSubmissionForm() {
  const [values, setValues] = useState(initialValues);
  const [participants, setParticipants] = useState(() => Array.from({ length: 3 }, () => ({ ...emptyParticipant })));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof initialValues, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const setParticipant = (index: number, key: keyof typeof emptyParticipant, value: string) => setParticipants((current) => current.map((participant, currentIndex) => currentIndex === index ? { ...participant, [key]: value } : participant));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setNotice("");
    const enteredParticipants = participants.filter((participant) => participant.firstName.trim() || participant.email.trim());
    if (!enteredParticipants.length) return setError("Add at least one participant.");
    if (enteredParticipants.some((participant) => !participant.firstName.trim() || !participant.email.trim())) return setError("Each participant needs a first name and email address.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/public-submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, participants: enteredParticipants }) });
      const result = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(result.error ?? "Unable to submit your project.");
      setNotice(result.message ?? "Your delivery slip is in."); setValues(initialValues); setParticipants(Array.from({ length: 3 }, () => ({ ...emptyParticipant })));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to submit your project."); }
    finally { setSubmitting(false); }
  }

  return <form className="deliverySlip" onSubmit={submit}>
    <header className="deliverySlipHeader"><p>Socratica Bakery · Project delivery slip</p><h1>Hand in what<br />you baked.</h1><span>01 / 01</span></header>
    {(error || notice) && <p className={error ? "deliverySlipMessage deliverySlipMessage--error" : "deliverySlipMessage"} role="status">{error || notice}</p>}
    <section className="deliverySlipSection"><div><b>01</b><h2>The people</h2></div><fieldset><label>Team name<input value={values.teamName} onChange={(event) => set("teamName", event.target.value)} placeholder="e.g. The Doughminators" required minLength={3} maxLength={80} /></label><div className="deliverySlipParticipants"><span>Participants</span>{participants.map((participant, index) => <div className="deliverySlipParticipantRow" key={index}><input aria-label={`Participant ${index + 1} first name`} value={participant.firstName} onChange={(event) => setParticipant(index, "firstName", event.target.value)} placeholder="First name" maxLength={80} /><input aria-label={`Participant ${index + 1} email address`} value={participant.email} onChange={(event) => setParticipant(index, "email", event.target.value)} placeholder="Email address" type="email" maxLength={320} /></div>)}{participants.length < 6 && <button className="deliverySlipAddButton" type="button" onClick={() => setParticipants((current) => [...current, { ...emptyParticipant }])}>Add another person</button>}</div></fieldset></section>
    <section className="deliverySlipSection"><div><b>02</b><h2>The build</h2></div><fieldset><label>Project name<input value={values.projectName} onChange={(event) => set("projectName", event.target.value)} placeholder="e.g. Proof & Flourish" required minLength={3} maxLength={100} /></label><label>Project URL<input value={values.projectUrl} onChange={(event) => set("projectUrl", event.target.value)} placeholder="https://your-project.com" required type="url" maxLength={1000} /></label><label>What problem are you solving?<textarea value={values.problem} onChange={(event) => set("problem", event.target.value)} required minLength={10} maxLength={700} /></label><label>How does your project solve it?<textarea value={values.solution} onChange={(event) => set("solution", event.target.value)} required minLength={10} maxLength={700} /></label></fieldset></section>
    <section className="deliverySlipSection"><div><b>03</b><h2>The difference</h2></div><fieldset><label>What impact could this have?<textarea value={values.impact} onChange={(event) => set("impact", event.target.value)} required minLength={10} maxLength={700} /></label><label>How would you estimate its impact? <em>Optional</em><textarea value={values.estimate} onChange={(event) => set("estimate", event.target.value)} maxLength={500} /></label></fieldset></section>
    <input className="deliverySlipHoney" tabIndex={-1} autoComplete="off" aria-hidden="true" value={values.website} onChange={(event) => set("website", event.target.value)} name="website" />
    <footer className="deliverySlipFooter"><button disabled={submitting}>{submitting ? "Sending…" : "Hand it to Grandma →"}</button></footer>
  </form>;
}
