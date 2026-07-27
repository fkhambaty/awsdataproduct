import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Service-role Supabase client (server only). Never expose this to the browser. */
export function getServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Allowlisted admin emails (comma-separated ADMIN_EMAILS env; defaults to the owner). */
export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "fk_qrf@yahoo.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Admin auth: the caller must present a valid Supabase session (Bearer token) whose
 * email is on the allowlist. This is real authentication — no shared PIN.
 */
export async function verifyAdminUser(request: Request): Promise<boolean> {
  const admin = getServiceClient();
  if (!admin) return false;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user?.email) return false;
  return getAdminEmails().includes(user.email.toLowerCase());
}
