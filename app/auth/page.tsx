"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function signIn() {
    setStatus("Sending magic link…");
    try {
      const sb = getSupabaseBrowser();
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      setStatus(error ? error.message : "Check your email for the login link.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <div className="game-card space-y-2 p-4">
        <label htmlFor="email" className="text-sm text-muted">
          Email (magic link)
        </label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          inputMode="email"
          placeholder="you@example.com"
          className="min-h-[44px] w-full rounded-xl border border-[#26263a] bg-[#12121c] px-3 text-sm"
        />
        <button
          onClick={signIn}
          className="min-h-[44px] w-full rounded-xl bg-[#f5c518] px-4 py-2 font-bold text-black"
        >
          Send magic link
        </button>
        {status ? <p className="text-sm">{status}</p> : null}
      </div>
    </div>
  );
}
