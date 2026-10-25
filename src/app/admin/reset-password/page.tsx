"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isStoreAdmin } from "@/lib/admin-access";
import { passwordRecoveryProblem } from "@/lib/password-recovery";

type RecoveryState = "checking" | "ready" | "invalid" | "complete";

export default function ResetPassword() {
    const [state, setState] = useState<RecoveryState>("checking");
    const [password, setPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        async function verifyRecovery() {
            try {
                // The SDK verifies the emailed callback with Supabase. URL parameters alone never authorise a reset.
                const { data, error: userError } = await supabase.auth.getUser();
                if (active) setState(!userError && isStoreAdmin(data.user) ? "ready" : "invalid");
            } catch { if (active) setState("invalid"); }
        }
        const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
            if (event === "PASSWORD_RECOVERY") {
                // Auth requests must run outside the SDK's state-change callback lock.
                setTimeout(() => { if (active) void verifyRecovery(); }, 0);
            }
            if (event === "SIGNED_OUT" && active) setState(current => current === "complete" ? current : "invalid");
        });
        void verifyRecovery();
        return () => { active = false; subscription.unsubscribe(); };
    }, []);

    async function updatePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault(); setError("");
        const problem = passwordRecoveryProblem(password, confirmation);
        if (problem) { setError(problem); return; }
        if (state !== "ready") return;
        setBusy(true);
        try {
            const { data, error: userError } = await supabase.auth.getUser();
            if (userError || !isStoreAdmin(data.user)) { setState("invalid"); return; }
            const { error: updateError } = await supabase.auth.updateUser({ password });
            if (updateError) {
                setError(updateError.code === "same_password" ? "Choose a password different from your previous password." : "Unable to update the password. Try a stronger password, or request a new reset link if this one has expired.");
                return;
            }
            setPassword(""); setConfirmation(""); setState("complete");
            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) setError("Your password was changed, but signing out could not finish. Close this browser session and sign in again with your new password.");
        } catch { setError("The request could not finish. If your password was changed, sign in with it; otherwise request a new reset link."); }
        finally { setBusy(false); }
    }

    return <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100" aria-labelledby="reset-password-title">
            <h1 id="reset-password-title" className="text-2xl font-heading font-bold mb-4">Choose a new password</h1>
            {state === "checking" ? <p role="status">Checking your recovery link…</p> : null}
            {state === "invalid" ? <><p role="alert" className="text-sm text-gray-700">This reset link is missing, expired, already used, or does not belong to an administrator. Request a new link and open the newest email.</p><Link href="/admin/forgot-password" className="block text-center underline mt-6">Request a new reset link</Link></> : null}
            {state === "complete" ? <><p role="status" className="text-sm text-gray-700">Your password has been updated. Sign in with your new password to continue.</p><Link href="/admin" className="block text-center underline mt-6">Sign in as administrator</Link></> : null}
            {state === "ready" ? <form onSubmit={updatePassword} className="space-y-4">
                <p id="password-help" className="text-sm text-gray-600">Use a unique password with at least 12 characters.</p>
                <div><label htmlFor="new-password" className="block text-sm font-medium mb-1">New password</label><input id="new-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="password-help" value={password} onChange={event => setPassword(event.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                <div><label htmlFor="confirm-password" className="block text-sm font-medium mb-1">Confirm new password</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                <button type="submit" disabled={busy} className="w-full bg-gray-900 text-white py-2 rounded-lg disabled:opacity-50">{busy ? "Updating…" : "Update password"}</button>
            </form> : null}
            {error ? <p role="alert" className="text-red-700 text-sm mt-4">{error}</p> : null}
        </section>
    </main>;
}
