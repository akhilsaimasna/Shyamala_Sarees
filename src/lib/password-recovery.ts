import type { SupabaseClient } from "@supabase/supabase-js";

export const ADMIN_PASSWORD_RESET_URL = "https://shyamala-sarees.vercel.app/admin/reset-password";

export function requestAdminPasswordRecovery(auth: Pick<SupabaseClient["auth"], "resetPasswordForEmail">, email: string) {
    return auth.resetPasswordForEmail(email.trim(), { redirectTo: ADMIN_PASSWORD_RESET_URL });
}

export function passwordRecoveryProblem(password: string, confirmation: string): string | null {
    if (password.length < 12) return "Use at least 12 characters for your new password.";
    if (password.length > 128) return "Use no more than 128 characters for your new password.";
    if (password !== confirmation) return "The passwords do not match.";
    return null;
}
