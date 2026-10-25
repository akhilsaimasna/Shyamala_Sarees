// Call only with a user returned by Supabase auth.getUser/signInWithPassword.
// Authorization is enforced independently by database and Storage RLS.
export function isStoreAdmin(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
    return user?.app_metadata?.role === "admin";
}
