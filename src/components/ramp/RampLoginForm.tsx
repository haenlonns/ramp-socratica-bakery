"use client";

import { useState } from "react";

// Magic-link delivery is currently unreliable, so sign-in skips it entirely:
// submitting the email signs that address straight into a real session.
export function RampLoginForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = email.trim();
    if (!value) {
      setError("Enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/instant-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Unable to sign in.");
      window.location.href = "/ramp";
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
      setSubmitting(false);
    }
  }

  return (
    <form className="rampForm" onSubmit={submit} noValidate>
      <div className={`rampField${error ? " rampFieldError" : ""}`}>
        <input
          type="email"
          name="email"
          autoComplete="email"
          aria-label="Email address"
          aria-invalid={error ? true : undefined}
          placeholder="Email address *"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (error) setError(null);
          }}
        />
      </div>
      {error && <p className="rampError" role="alert">{error}</p>}
      <button className="rampSubmit" type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Continue"}
      </button>
      <div className="rampFormFooter" />
    </form>
  );
}
