"use client";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { requestAdminPasswordRecovery } from "@/lib/password-recovery";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    async function requestReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true); setSent(false); setError("");
        try {
            const { error: resetError } = await requestAdminPasswordRecovery(supabase.auth, email);
            if (resetError) {
                setError("Unable to send a reset email right now. Please wait a few minutes and try again.");
                return;
            }
            setSent(true);
        } catch {
            setError("Unable to send a reset email. Check your connection and try again.");
        } finally { setBusy(false); }
    }

    return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100" aria-labelledby="forgot-password-title">
            <h1 id="forgot-password-title" className="text-2xl font-heading font-bold mb-4">Forgot password?</h1>
            <p className="text-sm text-gray-600 mb-6">Enter your storefront account email. We’ll send you a link to choose a new password.</p>
            <form onSubmit={requestReset} className="space-y-4">
                <div><label htmlFor="recovery-email" className="block text-sm font-medium mb-1">Email</label>
                    <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                {error ? <p role="alert" className="text-red-700 text-sm">{error}</p> : null}
                {sent ? <p role="status" className="text-gray-700 text-sm">If an account exists for this email, you’ll receive a reset link. Check your inbox and spam folder, then open the newest link. You can close this page.</p> : null}
                <button type="submit" disabled={busy || sent} className="w-full bg-gray-900 text-white py-2 rounded-lg disabled:opacity-50">{busy ? "Sending…" : sent ? "Reset email requested" : "Send reset link"}</button>
            </form>
            <Link href="/admin" className="block text-center text-sm underline mt-6">Back to administrator sign in</Link>
        </section>
    </main>;
}
